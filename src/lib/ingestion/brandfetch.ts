const BRANDFETCH_CLIENT_ID = process.env.BRANDFETCH_CLIENT_ID;

interface BrandfetchResult {
  brandId: string;
  name: string;
  domain: string;
  icon: string | null;
  claimed: boolean;
}

// In-memory cache for the duration of a single crawl run
const logoCache = new Map<string, string | null>();

export async function getCompanyLogoUrl(
  companyName: string
): Promise<string | null> {
  if (!BRANDFETCH_CLIENT_ID) return null;

  // Check cache first
  const cacheKey = companyName.toLowerCase().trim();
  if (logoCache.has(cacheKey)) {
    return logoCache.get(cacheKey) ?? null;
  }

  try {
    const searchUrl = `https://api.brandfetch.io/v2/search/${encodeURIComponent(companyName)}?c=${BRANDFETCH_CLIENT_ID}`;
    const response = await fetch(searchUrl);

    if (!response.ok) {
      logoCache.set(cacheKey, null);
      return null;
    }

    const results: BrandfetchResult[] = await response.json();

    if (results.length === 0) {
      logoCache.set(cacheKey, null);
      return null;
    }

    // Use the first (best match) result's icon, or build a CDN URL from domain
    const best = results[0];
    // Strip query params from icon URLs to avoid expiring CDN tokens
    const rawIcon = best.icon
      ? best.icon.split("?")[0]
      : `https://cdn.brandfetch.io/${best.domain}/w/128/h/128/fallback/lettermark`;
    const logoUrl = rawIcon;

    logoCache.set(cacheKey, logoUrl);
    return logoUrl;
  } catch {
    logoCache.set(cacheKey, null);
    return null;
  }
}

export function clearLogoCache() {
  logoCache.clear();
}
