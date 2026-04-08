const SUPABASE_STORAGE_PREFIX = 'https://tbuyrfpzmwghiwapixym.supabase.co/storage/v1/object/public/site-images/';
const LIVE_DOMAIN = 'compawnest.com';

/**
 * Converts a Supabase storage URL to /uploads/ path when on the live domain.
 * In Lovable preview or other environments, returns the original Supabase URL.
 */
export function getImageUrl(url: string): string {
  if (!url) return url;
  
  // Already a relative /uploads/ path — convert to full URL if NOT on live domain
  if (url.startsWith('/uploads/')) {
    if (isLiveDomain()) {
      return url; // PHP proxy will handle it
    }
    // On preview/dev, convert back to Supabase URL
    const fileName = url.replace('/uploads/', '');
    return `${SUPABASE_STORAGE_PREFIX}${fileName}`;
  }
  
  // Full Supabase URL — convert to /uploads/ if on live domain
  if (url.includes('supabase.co/storage/') && isLiveDomain()) {
    const fileName = url.replace(SUPABASE_STORAGE_PREFIX, '');
    return `/uploads/${fileName}`;
  }
  
  return url;
}

/**
 * Gets the storage URL to save in the database (always full Supabase URL).
 */
export function getStorageUrl(fileName: string): string {
  return `${SUPABASE_STORAGE_PREFIX}${fileName}`;
}

function isLiveDomain(): boolean {
  return typeof window !== 'undefined' && window.location.hostname.includes(LIVE_DOMAIN);
}
