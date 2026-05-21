import express from "express";
import {
  runAnalysis,
  getAnalyses,
  toggleBookmark,
  deleteAnalysis,
  clearAllAnalyses,
} from "../controllers/analysisController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, runAnalysis);
router.get("/", protect, getAnalyses);
router.put("/:id/bookmark", protect, toggleBookmark);
router.delete("/:id", protect, deleteAnalysis);
router.delete("/", protect, clearAllAnalyses);

export default router;