const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/**
 * Builds the full URL for a backend-uploaded image.
 * Handles both absolute URLs (http/https) and relative paths.
 *
 * @param path - The image path or full URL from the API
 * @param fallback - Optional fallback image path
 */
export function buildImageUrl(path?: string | null, fallback = "/images/placeholder-product.jpg"): string {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // Strip leading slash to avoid double slashes
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
}

/**
 * Get the primary (first) image URL from a product's imageUrl array.
 */
export function getProductImageUrl(
  imageUrl?: string[], 
  fallback?: string
): string {
  if (!imageUrl || imageUrl.length === 0) {
    return fallback ?? "/images/placeholder-product.jpg";
  }
  
  // Karena data sudah berupa array of string, langsung ambil elemen pertama (index 0)
  return buildImageUrl(imageUrl[0], fallback);
}