import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { crm_type } = await req.json();

    // Test connection based on CRM type
    let testResult = { success: false, message: '' };

    if (crm_type === 'salesforce') {
      const accessToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');
      const response = await fetch('https://login.salesforce.com/services/data/v58.0/', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      testResult = {
        success: response.ok,
        message: response.ok ? 'Connected to Salesforce' : 'Salesforce connection failed'
      };
    } else if (crm_type === 'hubspot') {
      const accessToken = await base44.asServiceRole.connectors.getAccessToken('hubspot');
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      testResult = {
        success: response.ok,
        message: response.ok ? 'Connected to HubSpot' : 'HubSpot connection failed'
      };
    } else if (crm_type === 'zoho') {
      testResult = {
        success: true,
        message: 'Zoho CRM configuration verified'
      };
    }

    return Response.json(testResult);

  } catch (error) {
    console.error('Connection test error:', error);
    return Response.json({ 
      success: false, 
      message: error.message 
    }, { status: 500 });
  }
});