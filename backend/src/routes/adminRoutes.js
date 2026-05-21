import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getAllUsers,
  getUserHistory,
  getAdminStats,
} from "../controllers/adminController.js";

const router = express.Router();

/* Admin dashboard stats */
router.get("/stats", protect, getAdminStats);

/* All users */
router.get("/users", protect, getAllUsers);

/* Single user history */
router.get("/users/:id/history", protect, getUserHistory);

router.get("/users", getAllUsers);

export default router;