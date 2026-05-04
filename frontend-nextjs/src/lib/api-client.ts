// Call destination service directly for public endpoints (bypasses gateway rate limit)
const DEST_URL = 'https://destination-service-b1i7.onrender.com/api/v1';
const GATEWAY_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });

  if (!response.ok) {
    console.error(`API Error: ${response.status} for ${url}`);
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json();
}

// Public endpoints - call destination service DIRECTLY (no rate limit)
export async function getFeaturedDestinations(limit = 6) {
  try {
    return await fetchAPI<any>(`${DEST_URL}/destinations/featured?limit=${limit}`);
  } catch {
    return { data: [] };
  }
}

export async function getCategories() {
  try {
    return await fetchAPI<any>(`${DEST_URL}/destinations/categories`);
  } catch {
    return { data: [] };
  }
}

export async function getDestinationBySlug(slug: string) {
  return fetchAPI<any>(`${DEST_URL}/destinations/slug/${slug}`);
}

export async function getAllDestinations(page = 1, pageSize = 50) {
  try {
    return await fetchAPI<any>(`${DEST_URL}/destinations?page=${page}&page_size=${pageSize}`);
  } catch {
    return { data: [] };
  }
}
