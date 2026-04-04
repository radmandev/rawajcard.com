// No imports — avoid Deno npm/esm startup failures
Deno.serve(async (req: Request) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  // Always return 200 so frontend can read error messages consistently
  const ok = (data: unknown) =>
    new Response(JSON.stringify(data), { status: 200, headers: cors });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl) return ok({ error: 'SUPABASE_URL is not configured.' });
    if (!serviceRoleKey) return ok({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' });
    if (!supabaseAnonKey) return ok({ error: 'SUPABASE_ANON_KEY is not configured.' });
    if (!stripeSecretKey) return ok({ error: 'STRIPE_SECRET_KEY is not configured.' });

    const authHeader = req.headers.get('Authorization') ?? '';
    const hasBearer = authHeader.startsWith('Bearer ');
    if (authHeader && !hasBearer) {
      return ok({ error: 'Unauthorized: malformed Authorization header.' });
    }

    let userId = '';
    let userEmail = '';
    let hasValidatedAuth = false;

    if (hasBearer) {
      const jwt = authHeader.replace('Bearer ', '').trim();
      if (!jwt) return ok({ error: 'Unauthorized: missing bearer token.' });

      const authUserRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${jwt}`,
        },
      });

      if (!authUserRes.ok) {
        return ok({ error: 'Unauthorized: invalid or expired session token.' });
      }

      const authUser = await authUserRes.json() as Record<string, unknown>;
      userId = String(authUser?.id || '');
      userEmail = String(authUser?.email || '');
      hasValidatedAuth = Boolean(userId);
    }

    let sessionId = '';
    let bodyUserId = '';
    let bodyUserEmail = '';
    try {
      const body = await req.json();
      sessionId = body?.sessionId ?? '';
      bodyUserId = String(body?.userId || '');
      bodyUserEmail = String(body?.userEmail || '');
    } catch {
      return ok({ error: 'Invalid JSON body.' });
    }

    if (!sessionId) {
      return ok({ error: 'sessionId is required.' });
    }

    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=subscription`, {
      headers: { Authorization: `Bearer ${stripeSecretKey}` },
    });
    const session = await stripeRes.json() as Record<string, any>;

    if (!stripeRes.ok) {
      return ok({ error: `Stripe verification failed: ${session?.error?.message ?? JSON.stringify(session)}` });
    }

    const paidStatuses = new Set(['paid', 'no_payment_required']);
    if (!paidStatuses.has(String(session?.payment_status ?? ''))) {
      return ok({ error: `Payment not completed yet (status: ${session?.payment_status ?? 'unknown'}).` });
    }

    // Fallback identity source for post-checkout redirects where app session is missing.
    const metadataUserId = String(session?.metadata?.user_id || '');
    const metadataUserEmail = String(session?.metadata?.user_email || session?.customer_details?.email || '');

    // Trust body-provided identity only when bearer auth was validated.
    if (hasValidatedAuth) {
      if (!userId && bodyUserId) userId = bodyUserId;
      if (!userEmail && bodyUserEmail) userEmail = bodyUserEmail;
    }

    if (!userId && metadataUserId) userId = metadataUserId;
    if (!userEmail && metadataUserEmail) userEmail = metadataUserEmail;

    // Prevent mismatches when we have a validated logged-in user.
    if (hasValidatedAuth) {
      const safeLower = (v: string) => String(v || '').trim().toLowerCase();
      if (metadataUserId && userId && metadataUserId !== userId) {
        return ok({ error: 'User mismatch: session metadata user_id does not match authenticated user.' });
      }
      if (metadataUserEmail && userEmail && safeLower(metadataUserEmail) !== safeLower(userEmail)) {
        return ok({ error: 'User mismatch: session metadata user_email does not match authenticated user.' });
      }
    }

    if (!userId && !userEmail) {
      return ok({
        error: 'Unable to resolve user for this checkout session. Ensure createStripeCheckout sets metadata.user_id/user_email.'
      });
    }

    // Some live schemas enforce subscriptions.user_id NOT NULL.
    // Fail early with a clear message instead of a generic Postgres constraint error.
    if (!userId) {
      return ok({
        error: 'Unable to resolve user_id for this checkout session. Ensure createStripeCheckout sets metadata.user_id.'
      });
    }

    const plan = session?.metadata?.plan ?? 'premium';
    const subscriptionObj = session?.subscription && typeof session.subscription === 'object'
      ? session.subscription
      : null;
    const stripeSubId = typeof session?.subscription === 'string'
      ? session.subscription
      : subscriptionObj?.id ?? null;

    const stripeStatus = String(subscriptionObj?.status || '').toLowerCase();
    const trialStartUnix = Number(subscriptionObj?.trial_start || 0);
    const trialEndUnix = Number(subscriptionObj?.trial_end || 0);
    const trialDaysMeta = Number(session?.metadata?.trial_days || 0);

    const hasFutureTrialEnd = Number.isFinite(trialEndUnix) && trialEndUnix > 0
      ? (trialEndUnix * 1000) > Date.now()
      : false;
    const isTrialing = stripeStatus === 'trialing' || hasFutureTrialEnd;

    const restHeaders = {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: 'return=representation',
    };

    const lookupUrl = userId
      ? `${supabaseUrl}/rest/v1/subscriptions?select=id&created_by_user_id=eq.${encodeURIComponent(userId)}&limit=1`
      : `${supabaseUrl}/rest/v1/subscriptions?select=id&created_by=eq.${encodeURIComponent(userEmail)}&limit=1`;

    const existingRes = await fetch(lookupUrl, { headers: restHeaders });

    const existingRows = await existingRes.json() as Array<{ id: string }> | { message?: string };
    if (!existingRes.ok || !Array.isArray(existingRows)) {
      return ok({ error: `Failed to read current subscription: ${JSON.stringify(existingRows)}` });
    }

    const subData = {
      plan,
      plan_type: plan,
      status: isTrialing ? 'trialing' : 'active',
      user_id: userId || null,
      created_by: userEmail || null,
      created_by_user_id: userId || null,
      metadata: {
        stripe_session_id: sessionId,
        stripe_subscription_id: stripeSubId,
        activated_at: new Date().toISOString(),
        trial_started_at: isTrialing
          ? new Date((trialStartUnix > 0 ? trialStartUnix : Math.floor(Date.now() / 1000)) * 1000).toISOString()
          : null,
        trial_ends_at: isTrialing && trialEndUnix > 0
          ? new Date(trialEndUnix * 1000).toISOString()
          : null,
        trial_days: isTrialing ? (trialDaysMeta || null) : 0,
        trial_active: isTrialing,
      },
    };

    let writeRes: Response;
    if (existingRows[0]?.id) {
      writeRes = await fetch(
        `${supabaseUrl}/rest/v1/subscriptions?id=eq.${encodeURIComponent(existingRows[0].id)}`,
        {
          method: 'PATCH',
          headers: restHeaders,
          body: JSON.stringify(subData),
        },
      );
    } else {
      writeRes = await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
        method: 'POST',
        headers: restHeaders,
        body: JSON.stringify({
          ...subData,
          user_id: userId || null,
          created_by: userEmail || null,
          created_by_user_id: userId || null,
        }),
      });
    }

    if (!writeRes.ok) {
      const writeBody = await writeRes.text();
      return ok({ error: `Failed to save subscription: ${writeBody}` });
    }

    return ok({
      success: true,
      plan,
      trialing: isTrialing,
      resolved_user_id: userId || null,
      resolved_user_email: userEmail || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return ok({ error: `Unhandled error: ${message}` });
  }
});
