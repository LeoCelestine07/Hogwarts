// Utility functions for handling image URLs

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Default placeholder images by category
const PLACEHOLDERS = {
  service: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&q=80',
  project: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&q=80',
  default: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80',
};

/**
 * Resolves an image URL to a proper absolute URL
 * Handles relative paths, old domain URLs, and missing images
 */
export const resolveImageUrl = (url, type = 'default') => {
  if (!url) {
    return PLACEHOLDERS[type] || PLACEHOLDERS.default;
  }

  // If it's a relative path starting with /api/, prepend backend URL
  if (url.startsWith('/api/')) {
    return `${BACKEND_URL}${url}`;
  }

  // If it's an Unsplash URL or other external URL, use as-is
  if (url.startsWith('https://images.unsplash.com') || url.startsWith('https://customer-assets.emergentagent.com')) {
    return url;
  }

  // If it contains an old preview domain, try to extract the filename and rebuild
  const uploadMatch = url.match(/\/uploads\/([a-f0-9-]+\.[a-z]+)$/i);
  if (uploadMatch) {
    return `${BACKEND_URL}/api/uploads/${uploadMatch[1]}`;
  }

  // Otherwise return as-is (might be a valid external URL)
  return url;
};

/**
 * Get a placeholder image for a specific type
 */
export const getPlaceholder = (type = 'default') => {
  return PLACEHOLDERS[type] || PLACEHOLDERS.default;
};

/**
 * Handle image load errors by setting a placeholder
 */
export const handleImageError = (event, type = 'default') => {
  event.target.src = PLACEHOLDERS[type] || PLACEHOLDERS.default;
  event.target.onerror = null; // Prevent infinite loop
};
