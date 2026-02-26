import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Always return HTTP 200 — errors go in { error: '...' } so the JS client never throws
const json = (data: unknown) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- Check Stripe secrets first ---
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePremiumPriceId = Deno.env.get('STRIPE_PREMIUM_PRICE_ID');
    const stripeEnterprisePriceId = Deno.env.get('STRIPE_ENTERPRISE_PRICE_ID');

    if (!stripeSecretKey) {
      return json({ error: 'STRIPE_SECRET_KEY secret is not set in Supabase → Project Settings → Edge Functions → Secrets.' });
    }

    // --- Auth: anon key + forwarded Authorization header (official Supabase pattern) ---
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const authHeader = req.headers.get('Authorization');

    if (!authHeader) {
      return json({ error: 'Unauthorized: no Authorization header. Please log in.' });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return json({ error: `Unauthorized: ${authError?.message ?? 'invalid session — please log in again.'}` });
    }

    // --- Parse request body ---
    let plan: string;
    try {
      const body = await req.json();
      plan = body?.plan;
    } catch {
      return json({ error: 'Invalid request body — expected JSON with { plan }.' });
    }

    if (!plan || !['premium', 'enterprise'].includes(plan)) {
      return json({ error: `Invalid plan "${plan}". Must be "premium" or "enterprise".` });
    }

    const priceId = plan === 'premium' ? stripePremiumPriceId : stripeEnterprisePriceId;
    if (!priceId) {
      return json({ error: `STRIPE_${plan.toUpperCase()}_PRICE_ID secret is not set in Supabase → Project Settings → Edge Functions → Secrets.` });
    }

    // --- Create Stripe checkout session ---
    const origin = req.headers.get('origin') || 'https://my.rawajcard.com';

    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('success_url', `${origin}/CheckoutSuccess?stripe_subscription=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${origin}/Upgrade`);
    params.append('customer_email', user.email ?? '');
    params.append('metadata[user_id]', user.id);
    params.append('metadata[user_email]', user.email ?? '');
    params.append('metadata[plan]', plan);
    params.append('allow_promotion_codes', 'true');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeRes.json() as any;

    if (!stripeRes.ok) {
      const stripeError = session?.error?.message ?? JSON.stringify(session);
      console.error('Stripe API error:', stripeError);
      return json({ error: `Stripe error: ${stripeError}` });
    }

    if (!session.url) {
      return json({ error: 'Stripe did not return a checkout URL.' });
    }

    return json({ url: session.url });

  } catch (err: any) {
    console.error('createStripeCheckout unhandled error:', err);
    return json({ error: `Server error: ${err?.message ?? 'unknown'}` });
  }
});
