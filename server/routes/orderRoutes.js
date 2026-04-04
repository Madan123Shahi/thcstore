import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/auth.js";
import {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/admin", protect, admin, getAllOrders);
router.get("/:id", protect, getOrder);
router.put("/:id/status", protect, admin, updateOrderStatus);

export default router;
