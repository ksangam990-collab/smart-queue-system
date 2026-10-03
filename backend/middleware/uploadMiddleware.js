import multer from 'multer';

const storage = multer.memoryStorage();

// Raster formats only — `image/svg+xml` also starts with "image/" and can embed
// scripts, so a blanket startsWith('image/') check is not safe.
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only JPG, PNG or WebP images are allowed'), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2 MB is plenty for a 200x200 avatar
});
