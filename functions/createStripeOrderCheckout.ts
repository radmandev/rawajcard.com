// Stripe Checkout — one-time payment for physical store products
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
    if (!stripeKey) return ok({ error: 'STRIPE_SECRET_KEY is not set in Supabase secrets.' });

    // Decode JWT for user identity
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
      if (!userId) throw new Error('no sub');
    } catch (e) {
      return ok({ error: `Could not decode token: ${(e as Error).message}` });
    }

    // Parse body
    interface CartItem {
      product_name: string;
      product_price: number;
      quantity: number;
      product_image?: string;
    }
    interface ShippingInfo {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
      country?: string;
    }

    let cartItems: CartItem[] = [];
    let shippingInfo: ShippingInfo = {};

    try {
      const body = await req.json();
      cartItems = body.cartItems ?? [];
      shippingInfo = body.shippingInfo ?? {};
    } catch {
      return ok({ error: 'Invalid JSON body.' });
    }

    if (!cartItems.length) return ok({ error: 'Cart is empty.' });

    const origin = req.headers.get('origin') || 'https://rawajcard.com';

    // Build Stripe Checkout session as x-www-form-urlencoded
    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('success_url', `${origin}/CheckoutSuccess?stripe_order=true&session_id={CHECKOUT_SESSION_ID}`);
    params.set('cancel_url', `${origin}/Checkout`);
    if (userEmail) params.set('customer_email', userEmail);
    params.set('allow_promotion_codes', 'true');

    // Shipping address collection
    params.set('shipping_address_collection[allowed_countries][0]', 'SA');
    params.set('shipping_address_collection[allowed_countries][1]', 'AE');
    params.set('shipping_address_collection[allowed_countries][2]', 'KW');
    params.set('shipping_address_collection[allowed_countries][3]', 'QA');
    params.set('shipping_address_collection[allowed_countries][4]', 'BH');
    params.set('shipping_address_collection[allowed_countries][5]', 'OM');

    // Line items — SAR prices (Stripe requires integer halalas)
    cartItems.forEach((item, i) => {
      const amount = Math.round(item.product_price * 100); // SAR → halalas
      params.set(`line_items[${i}][price_data][currency]`, 'sar');
      params.set(`line_items[${i}][price_data][unit_amount]`, String(amount));
      params.set(`line_items[${i}][price_data][product_data][name]`, item.product_name);
      if (item.product_image) {
        params.set(`line_items[${i}][price_data][product_data][images][0]`, item.product_image);
      }
      params.set(`line_items[${i}][quantity]`, String(item.quantity));
    });

    // Store context in metadata for post-payment processing
    params.set('metadata[user_id]', userId);
    params.set('metadata[user_email]', userEmail);
    params.set('metadata[shipping_name]', shippingInfo.name ?? '');
    params.set('metadata[shipping_phone]', shippingInfo.phone ?? '');
    params.set('metadata[shipping_address]', shippingInfo.address ?? '');
    params.set('metadata[shipping_city]', shippingInfo.city ?? '');
    params.set('metadata[shipping_country]', shippingInfo.country ?? 'Saudi Arabia');

    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const session = await stripeRes.json() as Record<string, unknown>;

    if (!stripeRes.ok) {
      const errMsg = (session?.error as Record<string, unknown>)?.message ?? JSON.stringify(session);
      return ok({ error: `Stripe error: ${errMsg}` });
    }

    return ok({ url: session.url, sessionId: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return ok({ error: `Server error: ${msg}` });
  }
});
