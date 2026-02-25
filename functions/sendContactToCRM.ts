import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contactData } = await req.json();

    // Get card owner info to fetch their webhook URL
    const cardOwner = contactData.card_owner;
    
    // Query users to find the card owner's webhook
    const users = await base44.asServiceRole.entities.User.filter({ 
      email: cardOwner 
    });
    
    if (users.length === 0 || !users[0].crm_webhook_url) {
      return Response.json({ 
        success: true, 
        message: 'No webhook configured' 
      });
    }

    const webhookUrl = users[0].crm_webhook_url;

    // Detect CRM type and format data accordingly
    let payload;
    let url = webhookUrl;

    if (webhookUrl.includes('bitrix24.com')) {
      // Bitrix24 format
      payload = {
        fields: {
          TITLE: `New contact: ${contactData.visitor_name}`,
          NAME: contactData.visitor_name,
          EMAIL: contactData.visitor_email ? [{ VALUE: contactData.visitor_email, VALUE_TYPE: 'WORK' }] : undefined,
          PHONE: contactData.visitor_phone ? [{ VALUE: contactData.visitor_phone, VALUE_TYPE: 'WORK' }] : undefined,
          COMPANY_TITLE: contactData.visitor_company || undefined,
          COMMENTS: contactData.notes || `Contact from Rawajcard - Card ID: ${contactData.card_id}`,
          SOURCE_ID: 'WEB',
          SOURCE_DESCRIPTION: 'Rawajcard Digital Business Card'
        }
      };

      // Bitrix24 uses query params for data
      const params = new URLSearchParams();
      params.append('fields', JSON.stringify(payload.fields));
      
      // Append to existing URL params
      const separator = webhookUrl.includes('?') ? '&' : '?';
      url = `${webhookUrl}${separator}${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET'
      });

      const result = await response.json();
      
      if (!result.result) {
        console.error('Bitrix24 error:', result);
        return Response.json({ 
          success: false, 
          error: result.error_description || 'Bitrix24 API error',
          details: result
        }, { status: 500 });
      }

      return Response.json({ 
        success: true, 
        message: 'Contact added to Bitrix24',
        lead_id: result.result
      });

    } else if (webhookUrl.includes('pipedrive.com')) {
      // Pipedrive format
      payload = {
        name: contactData.visitor_name,
        email: contactData.visitor_email,
        phone: contactData.visitor_phone,
        organization_name: contactData.visitor_company,
        notes: contactData.notes,
        visible_to: '3'
      };
    } else if (webhookUrl.includes('hubspot.com')) {
      // HubSpot format
      payload = {
        properties: {
          firstname: contactData.visitor_name?.split(' ')[0],
          lastname: contactData.visitor_name?.split(' ').slice(1).join(' '),
          email: contactData.visitor_email,
          phone: contactData.visitor_phone,
          company: contactData.visitor_company,
          notes: contactData.notes,
          hs_lead_status: 'NEW'
        }
      };
    } else {
      // Generic webhook format
      payload = {
        name: contactData.visitor_name,
        email: contactData.visitor_email,
        phone: contactData.visitor_phone,
        company: contactData.visitor_company,
        notes: contactData.notes,
        source: 'Rawajcard',
        card_id: contactData.card_id,
        created_at: contactData.created_date
      };
    }

    // Send to webhook (for non-Bitrix24)
    if (!webhookUrl.includes('bitrix24.com')) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch {
        result = responseText;
      }

      if (!response.ok) {
        console.error('Webhook failed:', result);
        return Response.json({ 
          success: false, 
          error: 'Webhook request failed',
          details: result
        }, { status: 500 });
      }

      return Response.json({ 
        success: true, 
        message: 'Contact sent to CRM',
        response: result
      });
    }

  } catch (error) {
    console.error('Error sending to CRM:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});