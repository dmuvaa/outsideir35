export function getProxyImageUrl(fullUrl: string): string {
  if (!fullUrl) return '';
  if (!fullUrl.startsWith('http')) return fullUrl; // Probably an emoji or already relative
  
  // Extract the path after '/public/'
  const parts = fullUrl.split('/storage/v1/object/public/');
  if (parts.length < 2) return fullUrl; // Fallback if it's an external URL
  
  const path = parts[1];
  return `/api/image?path=${encodeURIComponent(path)}`;
}
