export function avatarFallback(name = '', bg = '6366f1', size = 64) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || '')}&background=${bg}&color=fff&size=${size}`;
}
