// frontend/src/utils/avatar.js

const PALETTE = [
  '5b5ff5', // Slotly primary indigo
  '0fb894', // Emerald / teal
  'f59e0b', // Amber
  'ec4899', // Pink
  '8b5cf6', // Violet
  '3b82f6', // Blue
  '14b8a6', // Teal
  'f43f5e', // Rose
];

export function getNameColor(name = '') {
  if (!name || typeof name !== 'string') return '5b5ff5';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

/**
 * Returns initials from first name and last name.
 * Handles titles like Dr., Mr., etc. gracefully.
 * E.g., "Dr. Sarah Staff" -> "SS", "Sarah Staff" -> "SS", "John Doe" -> "JD"
 */
export function getInitials(name = '') {
  if (!name || typeof name !== 'string') return '';
  // Remove common honorifics/prefixes if followed by name
  const cleaned = name.trim().replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '');
  const parts = cleaned.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    const raw = name.trim().split(/\s+/).filter(Boolean);
    return raw[0] ? raw[0].slice(0, 2).toUpperCase() : 'U';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generates an instant, zero-network SVG data URI containing the user's initials.
 */
export function avatarFallback(name = '', bg, size = 64) {
  const initials = getInitials(name) || 'U';
  const color = (bg || getNameColor(name)).replace('#', '');
  const fontSize = Math.round(size * 0.42);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="${size / 2}" fill="%23${color}"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="%23ffffff" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="600" font-size="${fontSize}">${initials}</text></svg>`;
  return `data:image/svg+xml;utf8,${svg}`;
}

/**
 * Returns the uploaded profile picture URL if present,
 * or generates the initials avatar based on the user's first and last name.
 */
export function getAvatarUrl(userOrName, bg, size = 64) {
  if (!userOrName) return avatarFallback('', bg, size);
  const user = typeof userOrName === 'object' ? userOrName : { name: userOrName };
  const url = user?.avatar?.url;
  // If user has a real uploaded profile picture (e.g. Cloudinary) and not the old seed=User placeholder
  if (url && typeof url === 'string' && !url.includes('seed=User') && url.trim() !== '') {
    return url;
  }
  return avatarFallback(user?.name, bg, size);
}
