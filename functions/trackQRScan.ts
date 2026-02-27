import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    
    if (!slug) {
      return Response.redirect('https://rawajcard.com', 302);
    }

    const base44 = createClientFromRequest(req);
    
    // Find the card
    const cards = await base44.asServiceRole.entities.BusinessCard.filter({ slug });
    
    if (cards.length === 0) {
      return Response.redirect('https://rawajcard.com', 302);
    }

    const card = cards[0];

    // Track the scan
    try {
      await base44.asServiceRole.entities.CardView.create({
        card_id: card.id,
        card_owner: card.created_by,
        view_type: 'qr_scan',
        visitor_id: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || '',
        referrer: req.headers.get('referer') || ''
      });

      // Increment scan count
      await base44.asServiceRole.entities.BusinessCard.update(card.id, {
        scan_count: (card.scan_count || 0) + 1
      });
    } catch (error) {
      console.error('Tracking error:', error);
      // Continue with redirect even if tracking fails
    }

    // Redirect to the actual card page
    const cardUrl = `https://rawajcard.com/c/${slug}`;
    return Response.redirect(cardUrl, 302);

  } catch (error) {
    console.error('Error:', error);
    return Response.redirect('https://rawajcard.com', 302);
  }
});