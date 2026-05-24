import express from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { extractFileContent } from '../utils/extractFileContent.js';

const router = express.Router();

// Store uploads in OS temp dir — cleaned up by extractFileContent after reading
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, os.tmpdir()),
  filename:    (_req, file, cb) => {
    const unique = `devinspect_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const ext    = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
});

// POST /api/upload-file
// Accepts a single file field named "file"
// Returns { text: string, filename: string }
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  try {
    const text = await extractFileContent(req.file);
    return res.json({ text, filename: req.file.originalname });
  } catch (err) {
    return res.status(422).json({ message: err.message });
  }
});

export default router;
