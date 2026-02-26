// Zero imports — uses raw fetch only, guaranteed to start
Deno.serve(async (req: Request) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  // Always 200 so the JS client never throws before we can read the error
  const ok = (data: unknown) =>
    new Response(JSON.stringify(data), { status: 200, headers: cors });

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const premiumPrice = Deno.env.get('STRIPE_PREMIUM_PRICE_ID');
    const enterprisePrice = Deno.env.get('STRIPE_ENTERPRISE_PRICE_ID');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!stripeKey)      return ok({ error: 'STRIPE_SECRET_KEY is not set in Supabase secrets.' });
    if (!premiumPrice)   return ok({ error: 'STRIPE_PREMIUM_PRICE_ID is not set in Supabase secrets.' });
    if (!enterprisePrice) return ok({ error: 'STRIPE_ENTERPRISE_PRICE_ID is not set in Supabase secrets.' });

    // Validate the user token via Supabase Auth REST API — no SDK import needed
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader) return ok({ error: 'Not authenticated — please log in.' });

    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: authHeader,
        apikey: supabaseAnonKey ?? '',
      },
    });

    if (!userRes.ok) {
      const body = await userRes.text();
      return ok({ error: `Auth failed (${userRes.status}): ${body}` });
    }

    const user = await userRes.json() as any;
    if (!user?.id) return ok({ error: 'Could not retrieve user. Please log in again.' });

    // Parse plan
    let plan: string;
    try {
      const body = await req.json();
      plan = body?.plan ?? '';
    } catch {
      return ok({ error: 'Invalid JSON body.' });
    }

    const priceId = plan === 'premium' ? premiumPrice : plan === 'enterprise' ? enterprisePrice : null;
    if (!priceId) return ok({ error: `Unknown plan "${plan}". Must be "premium" or "enterprise".` });

    const origin = req.headers.get('origin') || 'https://my.rawajcard.com';

    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('line_items[0][price]', priceId);
    params.set('line_items[0][quantity]', '1');
    params.set('success_url', `${origin}/CheckoutSuccess?stripe_subscription=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`);
    params.set('cancel_url', `${origin}/Upgrade`);
    params.set('customer_email', user.email ?? '');
    params.set('metadata[user_id]', user.id);
    params.set('metadata[user_email]', user.email ?? '');
    params.set('metadata[plan]', plan);
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

    if (!session?.url) {
      return ok({ error: 'Stripe returned no checkout URL.' });
    }

    return ok({ url: session.url });

  } catch (err: any) {
    return ok({ error: `Unhandled error: ${err?.message ?? String(err)}` });
  }
});
