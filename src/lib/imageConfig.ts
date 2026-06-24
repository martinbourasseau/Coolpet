// CDN Base URL - change this when migrating to a CDN
// Example: "https://cdn.coolpet.fr" or "https://coolpet.b-cdn.net"
export const IMAGE_BASE_URL = "";

export function getImageUrl(path: string): string {
  return `${IMAGE_BASE_URL}${path}`;
}
