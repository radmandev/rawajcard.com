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
    const { amount, orderData } = await req.json();
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }
    
    // Keep order currency in SAR
    const amountInSAR = numericAmount.toFixed(2);
    
    const accessToken = await getPayPalAccessToken();
    
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: 'SAR',
            value: amountInSAR,
          },
          description: 'Rawajcard Order',
        }],
        application_context: {
          return_url: `${req.headers.get('origin')}/CheckoutSuccess`,
          cancel_url: `${req.headers.get('origin')}/Checkout`,
          brand_name: 'Rawajcard',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
        }
      }),
    });
    
    const order = await response.json();
    
    if (!response.ok) {
      return Response.json({ error: order }, { status: response.status });
    }
    
    return Response.json({ 
      orderId: order.id,
      approvalUrl: order.links.find(link => link.rel === 'approve')?.href
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
});