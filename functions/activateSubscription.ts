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
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!supabaseUrl) return ok({ error: 'SUPABASE_URL is not configured.' });
    if (!serviceRoleKey) return ok({ error: 'SUPABASE_SERVICE_ROLE_KEY is not configured.' });
    if (!stripeSecretKey) return ok({ error: 'STRIPE_SECRET_KEY is not configured.' });

    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return ok({ error: 'Missing Authorization header. Please log in.' });
    }

    const jwt = authHeader.replace('Bearer ', '');
    let userId = '';
    let userEmail = '';

    try {
      const parts = jwt.split('.');
      if (parts.length !== 3) throw new Error('malformed');
      const pad = (s: string) => s + '='.repeat((4 - s.length % 4) % 4);
      const payload = JSON.parse(atob(pad(parts[1].replace(/-/g, '+').replace(/_/g, '/'))));
      userId = payload.sub ?? '';
      userEmail = payload.email ?? '';
      if (!userId) throw new Error('missing sub');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return ok({ error: `Could not decode token: ${message}. Please log out and log in again.` });
    }

    let sessionId = '';
    try {
      const body = await req.json();
      sessionId = body?.sessionId ?? '';
    } catch {
      return ok({ error: 'Invalid JSON body.' });
    }

    if (!sessionId) {
      return ok({ error: 'sessionId is required.' });
    }

    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
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

    const plan = session?.metadata?.plan ?? 'premium';

    const restHeaders = {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: 'return=representation',
    };

    const existingRes = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?select=id&created_by_user_id=eq.${encodeURIComponent(userId)}&limit=1`,
      { headers: restHeaders },
    );

    const existingRows = await existingRes.json() as Array<{ id: string }> | { message?: string };
    if (!existingRes.ok || !Array.isArray(existingRows)) {
      return ok({ error: `Failed to read current subscription: ${JSON.stringify(existingRows)}` });
    }

    const subData = {
      plan,
      status: 'active',
      metadata: {
        stripe_session_id: sessionId,
        stripe_subscription_id: session?.subscription ?? null,
        activated_at: new Date().toISOString(),
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
          created_by: userEmail,
          created_by_user_id: userId,
        }),
      });
    }

    if (!writeRes.ok) {
      const writeBody = await writeRes.text();
      return ok({ error: `Failed to save subscription: ${writeBody}` });
    }

    return ok({ success: true, plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return ok({ error: `Unhandled error: ${message}` });
  }
});
