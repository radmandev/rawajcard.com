export function normalizeImageUrl(imageUrl) {
  if (typeof imageUrl !== 'string' || imageUrl.trim().length === 0) {
    return imageUrl;
  }

  try {
    const parsedUrl = new URL(imageUrl);

    if (parsedUrl.hostname === 'tapni.com' && parsedUrl.pathname === '/_next/image') {
      const originalUrl = parsedUrl.searchParams.get('url');
      if (originalUrl) {
        return decodeURIComponent(originalUrl);
      }
    }

    return imageUrl;
  } catch {
    return imageUrl;
  }
}
