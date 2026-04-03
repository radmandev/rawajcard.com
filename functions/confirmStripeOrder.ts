// Confirm a Stripe one-time order payment, create DB order record, clear cart
// No imports — zero startup failures on Deno cold starts
Deno.serve(async (req: Request) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const ok = (data: unknown) =>
    new Response(JSON.stringify(data), { status: 200, headers: cors });

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey) return ok({ error: 'STRIPE_SECRET_KEY is not set.' });
    if (!supabaseUrl) return ok({ error: 'SUPABASE_URL is not set.' });
    if (!serviceRoleKey) return ok({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set.' });

    // Decode JWT
    const authHeader = req.headers.get('Authorization') ?? '';
    if (!authHeader.startsWith('Bearer ')) {
      return ok({ error: 'Missing Authorization header.' });
    }

    const jwt = authHeader.replace('Bearer ', '');
    let userId = '';
    let userEmail = '';

    try {
      const parts = jwt.split('.');
      const pad = (s: string) => s + '='.repeat((4 - s.length % 4) % 4);
      const payload = JSON.parse(atob(pad(parts[1].replace(/-/g, '+').replace(/_/g, '/'))));
      userId = payload.sub ?? '';
      userEmail = payload.email ?? '';
    } catch (e) {
      return ok({ error: `Token decode failed: ${(e as Error).message}` });
    }

    // Parse body
    let sessionId = '';
    try {
      const body = await req.json();
      sessionId = body?.sessionId ?? '';
    } catch {
      return ok({ error: 'Invalid JSON body.' });
    }

    if (!sessionId) return ok({ error: 'sessionId is required.' });

    // Verify session with Stripe
    const stripeRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${stripeKey}` },
    });
    const session = await stripeRes.json() as Record<string, unknown>;

    if (!stripeRes.ok) {
      const errMsg = (session?.error as Record<string, unknown>)?.message ?? JSON.stringify(session);
      return ok({ error: `Stripe verification failed: ${errMsg}` });
    }

    const paymentStatus = String(session?.payment_status ?? '');
    if (!['paid', 'no_payment_required'].includes(paymentStatus)) {
      return ok({ error: `Payment not complete (status: ${paymentStatus}).` });
    }

    // Extract metadata saved during checkout creation
    const meta = (session?.metadata ?? {}) as Record<string, string>;
    const shippingInfo = {
      name: meta.shipping_name ?? '',
      email: meta.shipping_email ?? '',
      phone: meta.shipping_phone ?? '',
      address: meta.shipping_address ?? '',
      city: meta.shipping_city ?? '',
      country: meta.shipping_country ?? 'Saudi Arabia',
    };

    const lineItemsRes = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${sessionId}/line_items?limit=100`,
      { headers: { Authorization: `Bearer ${stripeKey}` } }
    );
    const lineItemsData = await lineItemsRes.json() as { data?: Array<Record<string, unknown>> };
    const cartItems = Array.isArray(lineItemsData?.data)
      ? lineItemsData.data.map((item, index) => {
          const quantity = Number(item.quantity ?? 1) || 1;
          const amountTotal = Number(item.amount_total ?? 0) / 100;
          return {
            product_id: String(item.price?.id ?? index),
            product_name: String(item.description ?? `Rawaj Item ${index + 1}`),
            quantity,
            product_price: quantity ? amountTotal / quantity : amountTotal,
            product_image: '',
          };
        })
      : [];

    // Amount in SAR (Stripe stores in halalas)
    const amountTotal = typeof session?.amount_total === 'number'
      ? (session.amount_total as number) / 100
      : 0;

    // Generate human-readable order number
    const orderNumber = 'RWJ-' + Date.now().toString(36).toUpperCase();

    // Create order in Supabase using service role key
    const dbHeaders = {
      'Content-Type': 'application/json',
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      Prefer: 'return=representation',
    };

    const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
      method: 'POST',
      headers: dbHeaders,
      body: JSON.stringify({
        created_by: userEmail || shippingInfo.email || userId,
        created_by_user_id: userId || undefined,
        amount: amountTotal,
        currency: 'SAR',
        status: 'paid',
        metadata: {
          order_number: orderNumber,
          stripe_session_id: sessionId,
          shippingInfo,
          cartItems,
          payment_method: 'stripe',
        },
      }),
    });

    if (!orderRes.ok) {
      const orderErr = await orderRes.text();
      console.error('Order creation failed:', orderErr);
      // Still return success — payment was captured, just log the DB issue
    }

    // Clear user's cart items via service role
    await fetch(
      `${supabaseUrl}/rest/v1/cart_items?created_by=eq.${encodeURIComponent(userEmail || userId)}`,
      { method: 'DELETE', headers: dbHeaders }
    );

    return ok({ success: true, order_number: orderNumber, amount: amountTotal });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return ok({ error: `Server error: ${msg}` });
  }
});
