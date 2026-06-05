import express from "express";
import {
  createPaymentIntent,
  verifyPayment,
  stripeWebhook,
  refundOrder,
} from "../controllers/orderController.js";
import { protect, admin } from "../middleware/auth.js";

const router = express.Router();

// ✅ Webhook MUST be before express.json() — needs raw body
// Register this route in app.js BEFORE app.use(express.json())
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), // ✅ raw body for Stripe signature check
  stripeWebhook,
);

// POST /api/payments/create-payment-intent
router.post("/create-payment-intent", protect, createPaymentIntent);

// POST /api/payments/verify
router.post("/verify", protect, verifyPayment);

// PUT /api/orders/:id/refund
router.put("/:id/refund", protect, admin, refundOrder);

export default router;
