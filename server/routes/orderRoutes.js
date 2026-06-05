import express from "express";
const router = express.Router();
import { protect, admin } from "../middleware/auth.js";
import {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  refundOrder,
} from "../controllers/orderController.js";
import { validate, validateQuery } from "../middleware/validate.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  getAllOrdersSchema,
} from "../../shared/schemas/order.schema.js";
router.post("/", protect, validate(createOrderSchema), createOrder);
router.get("/mine", protect, getMyOrders);
router.get(
  "/admin",
  protect,
  admin,
  validateQuery(getAllOrdersSchema),
  getAllOrders,
);
router.get("/:id", protect, getOrder);
router.patch(
  "/:id/status",
  protect,
  admin,
  validate(updateOrderStatusSchema),
  updateOrderStatus,
);
// ✅ PUT /api/orders/:id/refund — admin only
router.put("/:id/refund", protect, admin, refundOrder);

export default router;
