import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's CRM config
    const users = await base44.asServiceRole.entities.User.filter({ email: user.email });
    const crmConfig = users[0]?.crm_config;

    if (!crmConfig || crmConfig.status !== 'active') {
      return Response.json({ 
        success: false, 
        message: 'No active CRM integration' 
      }, { status: 400 });
    }

    // Get all contacts for this user
    const contacts = await base44.entities.ContactSubmission.filter({ 
      card_owner: user.email 
    });

    let synced = 0;
    let failed = 0;

    // Sync each contact
    for (const contact of contacts) {
      try {
        await base44.functions.invoke('syncContactToCRM', { contactData: contact });
        synced++;
      } catch (error) {
        console.error(`Failed to sync contact ${contact.id}:`, error);
        failed++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Synced ${synced} contacts, ${failed} failed`,
      synced_count: synced,
      failed_count: failed
    });

  } catch (error) {
    console.error('Bulk sync error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});