import express from 'express';
import { getAllUsers, getAllAnalyses, deleteUser, getStats } from '../controllers/adminController.js';

const router = express.Router();

router.get('/users',        getAllUsers);
router.get('/analyses',     getAllAnalyses);
router.get('/stats',        getStats);
router.delete('/user/:id',  deleteUser);

export default router;
