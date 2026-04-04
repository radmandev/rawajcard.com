// No imports — zero startup failures
Deno.serve(async (req: Request) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  // Always HTTP 200 — errors go in { error }
  const ok = (data: unknown) =>
    new Response(JSON.stringify(data), { status: 200, headers: cors });

  const STRIPE_PLAN_CATALOG = {
    premium: {
      productId: 'prod_UGjQ9TwyxVgt3F',
      defaultPriceId: 'price_1TIBxoDI4q7R2LzPhWnPgHvO',
      envPriceKey: 'STRIPE_PREMIUM_PRICE_ID',
    },
    teams: {
      productId: 'prod_UGjQR65XdGao7M',
      defaultPriceId: 'price_1TIBxoDI4q7R2LzPrwnGnlpA',
      envPriceKey: 'STRIPE_TEAMS_PRICE_ID',
    },
    enterprise: {
      productId: 'prod_UGjQrHered3gcx',
      defaultPriceId: 'price_1TIBxpDI4q7R2LzPkjhE4hDM',
      envPriceKey: 'STRIPE_ENTERPRISE_PRICE_ID',
    },
  } as const;

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const premiumPrice = Deno.env.get('STRIPE_PREMIUM_PRICE_ID') || STRIPE_PLAN_CATALOG.premium.defaultPriceId;
    const teamsPrice = Deno.env.get('STRIPE_TEAMS_PRICE_ID') || STRIPE_PLAN_CATALOG.teams.defaultPriceId;
    const enterprisePrice = Deno.env.get('STRIPE_ENTERPRISE_PRICE_ID') || STRIPE_PLAN_CATALOG.enterprise.defaultPriceId;

    if (!stripeKey)       return ok({ error: 'STRIPE_SECRET_KEY is not set in Supabase secrets.' });

    // Parse plan from body
    let plan: string;
    try {
      const body = await req.json() as Record<string, unknown>;
      plan = body?.plan as string ?? '';
    } catch {
      return ok({ error: 'Invalid JSON body.' });
    }

    // Manual auth handling (for --no-verify-jwt deployments)
    // - Authorization header: validate token with Supabase Auth
    const authHeader = req.headers.get('Authorization') ?? '';
    const hasBearer = authHeader.startsWith('Bearer ');
    let userId = '';
    let userEmail = '';
    let userCreatedAt = '';

    if (authHeader && !hasBearer) {
      return ok({ error: 'Unauthorized: malformed Authorization header.' });
    }

    if (!hasBearer) {
      return ok({ error: 'Please log in to start your subscription checkout.' });
    }

    if (!supabaseUrl) return ok({ error: 'SUPABASE_URL is not set in Supabase secrets.' });
    const authApiKey = supabaseAnonKey || serviceRoleKey;
    if (!authApiKey) {
      return ok({ error: 'SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY) is required to validate JWT manually.' });
    }

    const jwt = authHeader.replace('Bearer ', '').trim();
    if (!jwt) {
      return ok({ error: 'Unauthorized: missing bearer token.' });
    }

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: authApiKey,
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!userRes.ok) {
      return ok({ error: 'Unauthorized: invalid or expired session token. Please log in again.' });
    }

    const authUser = await userRes.json() as Record<string, unknown>;
    userId = String(authUser?.id || '');
    userEmail = String(authUser?.email || '');
    userCreatedAt = String(authUser?.created_at || '');

    if (!userId) {
      return ok({ error: 'Unauthorized: unable to resolve user from access token.' });
    }

    const planConfig = STRIPE_PLAN_CATALOG[plan as keyof typeof STRIPE_PLAN_CATALOG] ?? null;

    const priceId = plan === 'premium' ? premiumPrice
                  : plan === 'teams' ? teamsPrice
                  : plan === 'enterprise' ? enterprisePrice
                  : null;

    if (!priceId || !planConfig) {
      return ok({ error: `Invalid plan "${plan}". Must be "premium", "teams", or "enterprise".` });
    }

    // Admin-controlled early-bird offer with enforced 90-day Premium trial.
    let applyEarlyBirdTrial = false;
    let earlyBirdTrialDays = 90;
    if (serviceRoleKey) {
      try {
        const restHeaders = {
          'Content-Type': 'application/json',
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        };

        const settingRes = await fetch(
          `${supabaseUrl}/rest/v1/app_settings?select=value&key=eq.premium_early_bird_offer&limit=1`,
          { headers: restHeaders },
        );
        const settingRows = await settingRes.json() as Array<{ value?: Record<string, unknown> }>;
        const settingValue = Array.isArray(settingRows) ? (settingRows[0]?.value || {}) : {};
        const offerEnabled = Boolean(settingValue?.enabled);
        // Safety guard: premium trial must always be 90 days for Stripe checkout.
        const premiumTrialDays = 90;
        const teamsTrialDays = Math.max(1, Number(settingValue?.teams_trial_days ?? 14));
        const enterpriseTrialDays = Math.max(1, Number(settingValue?.enterprise_trial_days ?? 14));

        // Pick the right trial duration for the requested plan
        earlyBirdTrialDays = plan === 'premium' ? premiumTrialDays
                           : plan === 'teams'   ? teamsTrialDays
                           : enterpriseTrialDays;

        const newUserWindowDays = Math.max(1, Number(settingValue?.new_user_window_days ?? 30));

        const createdAtMs = Date.parse(userCreatedAt || '');
        const isNewUser = Number.isFinite(createdAtMs)
          ? (Date.now() - createdAtMs) <= (newUserWindowDays * 24 * 60 * 60 * 1000)
          : true;

        const subRes = await fetch(
          `${supabaseUrl}/rest/v1/subscriptions?select=id&created_by_user_id=eq.${encodeURIComponent(userId)}&limit=1`,
          { headers: restHeaders },
        );
        const subRows = await subRes.json() as Array<{ id: string }>;
        const hasSubscription = Array.isArray(subRows) && subRows.length > 0;

        // Apply trial for all paid plans when eligible
        const isPaidPlan = plan === 'premium' || plan === 'teams' || plan === 'enterprise';
        applyEarlyBirdTrial = isPaidPlan && offerEnabled && isNewUser && !hasSubscription;
      } catch {
        // If offer lookup fails, proceed with normal checkout.
        applyEarlyBirdTrial = false;
      }
    }

    const origin = req.headers.get('origin') || 'https://rawajcard.com';

    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('line_items[0][price]', priceId);
    params.set('line_items[0][quantity]', '1');
    if (applyEarlyBirdTrial) {
      params.set('subscription_data[trial_period_days]', String(earlyBirdTrialDays));
    } else {
      // Force no trial when user is not eligible.
      // This also overrides any trial configured directly on the Stripe Price.
      params.set('subscription_data[trial_end]', 'now');
    }
    params.set('success_url', `${origin}/CheckoutSuccess?stripe_subscription=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`);
    params.set('cancel_url', `${origin}/Upgrade`);
    if (userEmail) params.set('customer_email', userEmail);

    if (userId) params.set('metadata[user_id]', userId);
    if (userEmail) params.set('metadata[user_email]', userEmail);
    params.set('metadata[plan]', plan);
    params.set('metadata[product_id]', planConfig.productId);
    params.set('metadata[price_id]', priceId);
    if (applyEarlyBirdTrial) {
      params.set('metadata[early_bird_offer]', 'true');
      params.set('metadata[trial_days]', String(earlyBirdTrialDays));
    } else {
      params.set('metadata[trial_days]', '0');
    }
    params.set('allow_promotion_codes', 'true');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeRes.json() as any;

    if (!stripeRes.ok) {
      return ok({ error: `Stripe error: ${session?.error?.message ?? JSON.stringify(session)}` });
    }

    if (!session?.url) return ok({ error: 'Stripe did not return a checkout URL.' });

    return ok({ url: session.url });

  } catch (err: any) {
    return ok({ error: `Unhandled error: ${err?.message ?? String(err)}` });
  }
});
