import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PAYPAL_API = 'https://api-m.paypal.com';

async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET is missing');
  }
  
  const auth = btoa(`${clientId}:${clientSecret}`);
  
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      user = null;
    }

    const { orderId, cartItems, shippingInfo, totalSAR, createdBy } = await req.json();
    
    const accessToken = await getPayPalAccessToken();
    
    // Capture payment
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    const capture = await response.json();
    
    if (capture.status === 'COMPLETED') {
      // Create order in database
      const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase();
      const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
      
      const order = await base44.asServiceRole.entities.Order.create({
        order_number: orderNumber,
        items: safeCartItems.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.product_price
        })),
        total: Number(totalSAR) || 0,
        status: 'processing',
        shipping_address: shippingInfo,
        payment_method: 'paypal',
        created_by: user?.email || createdBy || shippingInfo?.email || null
      });
      
      return Response.json({ 
        success: true,
        order_number: orderNumber,
        paypal_transaction_id: capture.id || capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id || null
      });
    }
    
    return Response.json({ error: 'Payment failed' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});