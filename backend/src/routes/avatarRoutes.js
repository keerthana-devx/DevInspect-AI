import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload, uploadAvatar, deleteAvatar } from '../controllers/avatarController.js';

const router = express.Router();

router.post('/', protect, upload.single('avatar'), uploadAvatar);
router.delete('/', protect, deleteAvatar);

export default router;
