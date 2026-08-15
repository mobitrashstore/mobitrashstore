/**
 * High-Performance Image Optimization & Low-Network Adaptation Utility
 * Automatically adapts image quality and format based on user connection speed (2G/3G/4G/SaveData).
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  crop?: 'limit' | 'fill' | 'scale';
}

/**
 * Detects if the user is on a slow network or has data saver enabled.
 */
export const isSlowConnection = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (!conn) return false;
  if (conn.saveData) return true;
  if (conn.effectiveType === '2g' || conn.effectiveType === 'slow-2g' || conn.effectiveType === '3g') return true;
  return false;
};

/**
 * Transforms any image URL (Cloudinary, ImageKit, Unsplash, or raw) into an ultra-fast,
 * bandwidth-efficient, WebP/AVIF format with adaptive quality for low networks.
 */
export const getOptimizedImageUrl = (
  url: string | undefined | null,
  width: number = 800,
  quality: number = 80
): string => {
  if (!url || typeof url !== 'string') return 'https://placehold.co/400x400?text=No+Image';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  const isSlow = isSlowConnection();
  const targetQuality = isSlow ? Math.min(quality, 60) : quality;
  const targetWidth = isSlow ? Math.round(width * 0.8) : width;

  // 1. Cloudinary Optimization
  if (url.includes('res.cloudinary.com')) {
    const qParam = isSlow ? 'q_auto:eco' : `q_auto:good`;
    const transformStr = `f_auto,${qParam},w_${targetWidth},c_limit`;
    if (url.includes('/image/upload/')) {
      return url.replace('/image/upload/', `/image/upload/${transformStr}/`);
    }
    return url;
  }

  // 2. ImageKit Optimization
  if (url.includes('ik.imagekit.io')) {
    const separator = url.includes('?') ? '&' : '?';
    const cleanUrl = url.replace(/(\?|&)tr=[^&]*/g, '');
    const joinChar = cleanUrl.includes('?') ? '&' : '?';
    const trString = `tr=w-${targetWidth},q-${targetQuality},f-auto,pr-true`;
    return `${cleanUrl}${joinChar}${trString}`;
  }

  // 3. Unsplash Optimization
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', targetWidth.toString());
      u.searchParams.set('q', targetQuality.toString());
      u.searchParams.set('auto', 'format,compress');
      return u.toString();
    } catch {
      return url;
    }
  }

  return url;
};

/**
 * Generates responsive srcset strings for modern browsers to pick the optimal image size.
 */
export const getImageSrcSet = (url: string | undefined | null, widths: number[] = [320, 640, 960, 1280]): string => {
  if (!url || typeof url !== 'string') return '';
  return widths.map(w => `${getOptimizedImageUrl(url, w)} ${w}w`).join(', ');
};
