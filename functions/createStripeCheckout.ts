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

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const premiumPrice = Deno.env.get('STRIPE_PREMIUM_PRICE_ID');
    const enterprisePrice = Deno.env.get('STRIPE_ENTERPRISE_PRICE_ID');

    if (!stripeKey)       return ok({ error: 'STRIPE_SECRET_KEY is not set in Supabase secrets.' });
    if (!premiumPrice)    return ok({ error: 'STRIPE_PREMIUM_PRICE_ID is not set in Supabase secrets.' });
    if (!enterprisePrice) return ok({ error: 'STRIPE_ENTERPRISE_PRICE_ID is not set in Supabase secrets.' });

    // Decode JWT — gateway already verified it, we just need user info
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return ok({ error: 'Missing Authorization header. Please log in.' });
    }

    const jwt = authHeader.replace('Bearer ', '');
    let userId: string;
    let userEmail: string;

    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) throw new Error('malformed');
      // Pad base64 if needed
      const pad = (s: string) => s + '='.repeat((4 - s.length % 4) % 4);
      const payload = JSON.parse(atob(pad(parts[1].replace(/-/g, '+').replace(/_/g, '/'))));
      userId = payload.sub;
      userEmail = payload.email ?? '';
      if (!userId) throw new Error('no sub');
    } catch (e) {
      return ok({ error: `Could not decode token: ${e.message}. Please log out and log in again.` });
    }

    // Parse plan from body
    let plan: string;
    try {
      const body = await req.json();
      plan = body?.plan ?? '';
    } catch {
      return ok({ error: 'Invalid JSON body.' });
    }

    const priceId = plan === 'premium' ? premiumPrice
                  : plan === 'enterprise' ? enterprisePrice
                  : null;

    if (!priceId) return ok({ error: `Invalid plan "${plan}". Must be "premium" or "enterprise".` });

    const origin = req.headers.get('origin') || 'https://rawajcard.com';

    const params = new URLSearchParams();
    params.set('mode', 'subscription');
    params.set('line_items[0][price]', priceId);
    params.set('line_items[0][quantity]', '1');
    params.set('success_url', `${origin}/CheckoutSuccess?stripe_subscription=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`);
    params.set('cancel_url', `${origin}/Upgrade`);
    if (userEmail) params.set('customer_email', userEmail);
    params.set('metadata[user_id]', userId);
    params.set('metadata[user_email]', userEmail);
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

    if (!session?.url) return ok({ error: 'Stripe did not return a checkout URL.' });

    return ok({ url: session.url });

  } catch (err: any) {
    return ok({ error: `Unhandled error: ${err?.message ?? String(err)}` });
  }
});
