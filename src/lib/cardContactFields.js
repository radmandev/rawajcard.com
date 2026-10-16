function toArr(val) {
  if (Array.isArray(val)) return val.filter(Boolean);
  return val ? [val] : [];
}

export function getContactArrays(card) {
  return {
    phones:    toArr(card.phones    ?? card.phone),
    emails:    toArr(card.emails    ?? card.email),
    whatsapps: toArr(card.whatsapps ?? card.whatsapp),
    websites:  toArr(card.websites  ?? card.website),
    locations: toArr(card.locations ?? card.location),
  };
}

// A social_links value is a URL string, a { url, label } object for a named
// account, or an array of either when the card has several accounts on the
// same platform. Normalizes to [{ url, label }], keeping blank rows for the form.
export function toSocialAccounts(val) {
  if (val == null || val === '') return [];
  return (Array.isArray(val) ? val : [val]).map(v =>
    v && typeof v === 'object'
      ? { url: v.url || '', label: v.label || '' }
      : { url: v || '', label: '' }
  );
}

// Flat [platform, url, label] triples for rendering, skipping accounts with no URL
export function getSocialEntries(socialLinks) {
  return Object.entries(socialLinks || {}).flatMap(([platform, val]) =>
    toSocialAccounts(val)
      .filter(a => a.url)
      .map(a => [platform, a.url, a.label.trim()])
  );
}

export function buildVCard(card) {
  const { phones, emails, websites, locations } = getContactArrays(card);
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.name || ''}`,
    `TITLE:${card.title || ''}`,
    `ORG:${card.company || ''}`,
    ...phones.map(p    => `TEL:${p}`),
    ...emails.map(e    => `EMAIL:${e}`),
    ...websites.map(w  => `URL:${w}`),
    ...locations.map(l => `ADR:;;${l}`),
    'END:VCARD',
  ];
  return lines.join('\n');
}
