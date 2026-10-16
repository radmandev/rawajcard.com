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

// social_links values are a URL string, or an array of URLs when the card has
// several accounts on the same platform. Returns flat [platform, url] pairs.
export function getSocialEntries(socialLinks) {
  return Object.entries(socialLinks || {}).flatMap(([platform, val]) =>
    toArr(val).map(url => [platform, url])
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
