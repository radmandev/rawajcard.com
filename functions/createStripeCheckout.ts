import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripePremiumPriceId = Deno.env.get('STRIPE_PREMIUM_PRICE_ID');

    if (!stripeSecretKey) {
      return Response.json(
        { error: 'Stripe is not configured on the server. Set STRIPE_SECRET_KEY.' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Authenticate user via Supabase JWT
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
    }

    const { plan } = await req.json();
    const origin = req.headers.get('origin') || 'https://my.rawajcard.com';

    // Map plan to Stripe price ID
    let priceId: string | undefined;
    if (plan === 'premium') {
      priceId = stripePremiumPriceId;
    } else {
      return Response.json({ error: 'Invalid plan. Only "premium" is supported.' }, { status: 400, headers: corsHeaders });
    }

    if (!priceId) {
      return Response.json(
        { error: 'Stripe price ID not configured. Set STRIPE_PREMIUM_PRICE_ID.' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Build Stripe checkout session
    const params = new URLSearchParams();
    params.append('mode', 'subscription');
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append(
      'success_url',
      `${origin}/CheckoutSuccess?stripe_subscription=true&plan=${plan}&session_id={CHECKOUT_SESSION_ID}`
    );
    params.append('cancel_url', `${origin}/Dashboard`);
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
      body: params,
    });

    const session = await stripeRes.json();
    if (!stripeRes.ok) {
      throw new Error(session.error?.message ?? 'Failed to create Stripe checkout session');
    }

    return Response.json({ url: session.url }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('createStripeCheckout error:', err);
    return Response.json(
      { error: err.message ?? 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
});
