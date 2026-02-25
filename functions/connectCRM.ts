import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { crm_type } = await req.json();

    // Generate OAuth URLs based on CRM type
    if (crm_type === 'salesforce') {
      // Request Salesforce OAuth
      const authUrl = await base44.asServiceRole.connectors.getAccessToken('salesforce');
      return Response.json({ 
        success: true, 
        auth_url: authUrl,
        message: 'Redirecting to Salesforce authorization...'
      });
    } else if (crm_type === 'hubspot') {
      // Request HubSpot OAuth
      const authUrl = await base44.asServiceRole.connectors.getAccessToken('hubspot');
      return Response.json({ 
        success: true, 
        auth_url: authUrl,
        message: 'Redirecting to HubSpot authorization...'
      });
    } else if (crm_type === 'zoho') {
      // For Zoho, return instructions for API key setup
      return Response.json({ 
        success: true, 
        requires_api_key: true,
        message: 'Please provide your Zoho CRM API credentials'
      });
    }

    return Response.json({ error: 'Unsupported CRM type' }, { status: 400 });

  } catch (error) {
    console.error('CRM connection error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});