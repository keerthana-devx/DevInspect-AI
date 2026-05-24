import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createShareLink, getSharedAnalysis } from '../controllers/shareController.js';

const router = express.Router();

router.post('/',        protect, createShareLink);
router.get('/:token',            getSharedAnalysis);

export default router;
