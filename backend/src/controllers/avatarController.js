import multer from 'multer';
import sharp from 'sharp';
import User from '../models/User.js';

// Store in memory — we compress and save as base64 data URI
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    return cb(new Error('Only image files are allowed'), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Compress & resize to 200x200 JPEG
    const compressed = await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 80 })
      .toBuffer();

    const dataUri = `data:image/jpeg;base64,${compressed.toString('base64')}`;

    await User.findByIdAndUpdate(req.user._id, { avatar: dataUri });

    res.json({ avatar: dataUri });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ message: err.message || 'Upload failed' });
  }
};

export const deleteAvatar = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { avatar: '' });
    res.json({ avatar: '' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove avatar' });
  }
};
