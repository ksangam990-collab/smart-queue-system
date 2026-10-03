// backend/utils/imageSignature.js
//
// `file.mimetype` is whatever the client claims. Before sending bytes to
// Cloudinary we verify the file's real signature ("magic bytes") matches an
// allowed raster image type. SVG is deliberately NOT allowed (it can carry
// scripts and becomes stored XSS when served back).

export const detectImageType = (buf) => {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
  return null;
};
