import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const PAYPAL_API = 'https://api-m.paypal.com';

async function getPayPalAccessToken() {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  
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
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, orderData } = await req.json();
    
    // Convert SAR to USD (approximate rate: 1 SAR = 0.27 USD)
    const amountInUSD = (amount * 0.27).toFixed(2);
    
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
            currency_code: 'USD',
            value: amountInUSD,
          },
          description: 'Rawajcard Order',
        }],
        application_context: {
          return_url: `${req.headers.get('origin')}/checkout-success`,
          cancel_url: `${req.headers.get('origin')}/checkout`,
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
    return Response.json({ error: error.message }, { status: 500 });
  }
});