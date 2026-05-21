import express from 'express';
import { createWorkspace, getWorkspaces, inviteMember } from '../controllers/workspaceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createWorkspace);
router.get('/', protect, getWorkspaces);
router.post('/:id/invite', protect, inviteMember);

export default router;
