import express from "express";
import { getDashboardAnalytics, logEvent, getEventLogs } from "../controllers/analyticsController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

router.get("/dashboard", protect, admin, getDashboardAnalytics); // admin only
router.post("/event",    logEvent);                              // public — frontend tracking
router.get("/events",    protect, admin, getEventLogs);          // admin only

export default router;