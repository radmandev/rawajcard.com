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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    // Authenticate user
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

    const { sessionId } = await req.json();
    if (!sessionId) {
      return Response.json({ error: 'sessionId is required' }, { status: 400, headers: corsHeaders });
    }

    // Verify the Stripe checkout session
    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${stripeSecretKey}` },
    });
    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      throw new Error(session.error?.message ?? 'Failed to fetch Stripe session');
    }

    if (session.payment_status !== 'paid') {
      return Response.json(
        { error: 'Payment not completed yet' },
        { status: 400, headers: corsHeaders }
      );
    }

    const plan = session.metadata?.plan ?? 'premium';

    // Upsert subscription record
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('created_by_user_id', user.id)
      .maybeSingle();

    const subData = {
      plan,
      status: 'active',
      metadata: {
        stripe_session_id: sessionId,
        stripe_subscription_id: session.subscription ?? null,
        activated_at: new Date().toISOString(),
      },
    };

    if (existing?.id) {
      await supabase
        .from('subscriptions')
        .update(subData)
        .eq('id', existing.id);
    } else {
      await supabase.from('subscriptions').insert({
        ...subData,
        created_by: user.email,
        created_by_user_id: user.id,
      });
    }

    return Response.json({ success: true, plan }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('activateSubscription error:', err);
    return Response.json(
      { error: err.message ?? 'Internal server error' },
      { status: 500, headers: corsHeaders }
    );
  }
});
