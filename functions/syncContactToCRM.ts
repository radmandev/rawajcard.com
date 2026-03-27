import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contactData } = await req.json();

    // Get card owner's CRM config
    const users = await base44.asServiceRole.entities.User.filter({ 
      email: contactData.card_owner 
    });
    
    if (users.length === 0 || !users[0].crm_config || users[0].crm_config.status !== 'active') {
      return Response.json({ 
        success: true, 
        message: 'No active CRM integration' 
      });
    }

    const crmConfig = users[0].crm_config;
    const provider = crmConfig.provider;
    const fieldMapping = crmConfig.field_mapping || {};

    // Map contact data to CRM fields
    const mapFields = (data, mapping) => {
      const mapped = {};
      for (const [cardField, crmField] of Object.entries(mapping)) {
        if (data[cardField]) {
          mapped[crmField] = data[cardField];
        }
      }
      return mapped;
    };

    const mappedData = mapFields(contactData, fieldMapping);

    // Sync to specific CRM
    let result;
    
    if (provider === 'salesforce') {
      result = await syncToSalesforce(base44, mappedData, contactData);
    } else if (provider === 'hubspot') {
      result = await syncToHubSpot(base44, mappedData, contactData);
    } else if (provider === 'zoho') {
      result = await syncToZoho(crmConfig, mappedData, contactData);
    }

    return Response.json({ 
      success: true, 
      message: 'Contact synced to CRM',
      crm_record_id: result?.id
    });

  } catch (error) {
    console.error('CRM sync error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});

async function syncToSalesforce(base44, mappedData, originalData) {
  const accessToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');
  
  // Get Salesforce instance URL (typically stored during OAuth)
  const instanceUrl = 'https://login.salesforce.com'; // Should be from OAuth response
  
  const leadData = {
    FirstName: mappedData.name?.split(' ')[0] || '',
    LastName: mappedData.name?.split(' ').slice(1).join(' ') || 'Contact',
    Email: mappedData.email,
    Phone: mappedData.phone,
    Company: mappedData.company || 'Unknown',
    Description: mappedData.notes || `Contact from Rawajcard - Card ID: ${originalData.card_id}`,
    LeadSource: 'Rawajcard',
    Status: 'Open - Not Contacted'
  };

  const response = await fetch(`${instanceUrl}/services/data/v58.0/sobjects/Lead`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(leadData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Salesforce API error: ${error[0]?.message || 'Unknown error'}`);
  }

  return await response.json();
}

async function syncToHubSpot(base44, mappedData, originalData) {
  const accessToken = await base44.asServiceRole.connectors.getAccessToken('hubspot');
  
  const contactData = {
    properties: {
      firstname: mappedData.name?.split(' ')[0] || '',
      lastname: mappedData.name?.split(' ').slice(1).join(' ') || 'Contact',
      email: mappedData.email,
      phone: mappedData.phone,
      company: mappedData.company,
      notes: mappedData.notes || `Contact from Rawajcard - Card ID: ${originalData.card_id}`,
      hs_lead_status: 'NEW',
      lifecyclestage: 'lead'
    }
  };

  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`HubSpot API error: ${error.message || 'Unknown error'}`);
  }

  return await response.json();
}

async function syncToZoho(crmConfig, mappedData, originalData) {
  // Zoho requires API key/OAuth token stored in config
  const apiKey = crmConfig.api_credentials?.api_key;
  const accessToken = crmConfig.api_credentials?.access_token;
  
  if (!accessToken && !apiKey) {
    throw new Error('Zoho CRM credentials not configured');
  }

  const leadData = {
    data: [{
      First_Name: mappedData.name?.split(' ')[0] || '',
      Last_Name: mappedData.name?.split(' ').slice(1).join(' ') || 'Contact',
      Email: mappedData.email,
      Phone: mappedData.phone,
      Company: mappedData.company,
      Description: mappedData.notes || `Contact from Rawajcard - Card ID: ${originalData.card_id}`,
      Lead_Source: 'Rawajcard',
      Lead_Status: 'Not Contacted'
    }]
  };

  const response = await fetch('https://www.zohoapis.com/crm/v3/Leads', {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken || apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(leadData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Zoho API error: ${error.message || 'Unknown error'}`);
  }

  return await response.json();
}