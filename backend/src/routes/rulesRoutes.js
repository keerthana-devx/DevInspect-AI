import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getRules, createRule, updateRule, toggleRule, deleteRule } from '../controllers/rulesController.js';

const router = express.Router();

router.get('/',              protect, getRules);
router.post('/',             protect, createRule);
router.put('/:id',           protect, updateRule);
router.patch('/:id/toggle',  protect, toggleRule);
router.delete('/:id',        protect, deleteRule);

export default router;
