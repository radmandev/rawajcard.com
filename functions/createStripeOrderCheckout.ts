// Stripe Checkout — one-time payment for physical/digital store products
// Guest checkout supported (no auth required)
// Enables: Card, Apple Pay, Google Pay, Stripe Link automatically
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

    // ── Auth: OPTIONAL — works for both guests and logged-in users ─────
    let userId = '';
    let userEmail = '';

    const authHeader = req.headers.get('Authorization') ?? '';
    if (authHeader.startsWith('Bearer ')) {
      const jwt = authHeader.replace('Bearer ', '');
      try {
        const parts = jwt.split('.');
        if (parts.length === 3) {
          const pad = (s: string) => s + '='.repeat((4 - s.length % 4) % 4);
          const payload = JSON.parse(
            atob(pad(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
          );
          // Only treat as an authenticated user if the JWT has sub + email
          // (anon key JWTs have role='anon' but no sub/email)
          if (payload?.sub && payload?.email) {
            userId = payload.sub;
            userEmail = payload.email;
          }
        }
      } catch {
        // Ignore decode failures — guest checkout proceeds normally
      }
    }

    // ── Parse body ─────────────────────────────────────────────────────
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

    // ── Build Stripe Checkout session ──────────────────────────────────
    // Helper to attempt a Stripe Checkout session creation
    const attemptCheckout = async (extraParams: Record<string, string>) => {
      const p = new URLSearchParams();
      p.set('mode', 'payment');
      p.set('success_url', `${origin}/CheckoutSuccess?stripe_order=true&session_id={CHECKOUT_SESSION_ID}`);
      p.set('cancel_url', `${origin}/Checkout`);
      p.set('allow_promotion_codes', 'true');
      p.set('phone_number_collection[enabled]', 'true');

      // Pre-fill email for authenticated users
      if (userEmail) p.set('customer_email', userEmail);

      // Shipping to GCC countries
      p.set('shipping_address_collection[allowed_countries][0]', 'SA');
      p.set('shipping_address_collection[allowed_countries][1]', 'AE');
      p.set('shipping_address_collection[allowed_countries][2]', 'KW');
      p.set('shipping_address_collection[allowed_countries][3]', 'QA');
      p.set('shipping_address_collection[allowed_countries][4]', 'BH');
      p.set('shipping_address_collection[allowed_countries][5]', 'OM');

      // Free shipping option
      p.set('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
      p.set('shipping_options[0][shipping_rate_data][fixed_amount][amount]', '0');
      p.set('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'sar');
      p.set('shipping_options[0][shipping_rate_data][display_name]', 'Standard Shipping (2-5 days)');

      // Line items
      cartItems.forEach((item, i) => {
        const amount = Math.round(item.product_price * 100);
        p.set(`line_items[${i}][price_data][currency]`, 'sar');
        p.set(`line_items[${i}][price_data][unit_amount]`, String(amount));
        p.set(`line_items[${i}][price_data][product_data][name]`, item.product_name);
        if (item.product_image) {
          p.set(`line_items[${i}][price_data][product_data][images][0]`, item.product_image);
        }
        p.set(`line_items[${i}][quantity]`, String(item.quantity));
      });

      // Metadata for fulfillment
      p.set('metadata[user_id]', userId);
      p.set('metadata[user_email]', userEmail);
      p.set('metadata[guest]', userId ? 'false' : 'true');
      p.set('metadata[shipping_name]', shippingInfo.name ?? '');
      p.set('metadata[shipping_phone]', shippingInfo.phone ?? '');
      p.set('metadata[shipping_address]', shippingInfo.address ?? '');
      p.set('metadata[shipping_city]', shippingInfo.city ?? '');
      p.set('metadata[shipping_country]', shippingInfo.country ?? 'Saudi Arabia');

      // Apply extra params (payment method config varies by attempt)
      for (const [k, v] of Object.entries(extraParams)) {
        p.set(k, v);
      }

      return fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: p.toString(),
      });
    };

    // Attempt 1: Dynamic payment methods (automatic — enables Apple Pay, Google Pay, Link)
    // This is the recommended approach; requires "Automatic payment methods" in Stripe dashboard
    let res = await attemptCheckout({
      'payment_method_types[0]': 'card',
      'payment_method_types[1]': 'link',
    });
    let session = await res.json() as Record<string, unknown>;

    // Attempt 2: card only (Link not enabled in dashboard)
    if (!res.ok && String((session?.error as Record<string, unknown>)?.message ?? '').toLowerCase().includes('link')) {
      res = await attemptCheckout({ 'payment_method_types[0]': 'card' });
      session = await res.json() as Record<string, unknown>;
    }

    // Attempt 3: bare minimum fallback
    if (!res.ok) {
      res = await attemptCheckout({});
      session = await res.json() as Record<string, unknown>;
    }

    if (!res.ok) {
      const errMsg = (session?.error as Record<string, unknown>)?.message ?? JSON.stringify(session);
      return ok({ error: `Stripe error: ${errMsg}` });
    }

    return ok({ url: session.url, sessionId: session.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return ok({ error: `Server error: ${msg}` });
  }
});
