import { z } from "zod";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        product: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product ID"),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "No items"),

  shippingAddress: z.object({
    name: z.string().trim().min(2).max(100),
    phone: z.string().regex(/^\d{10}$/, "Invalid phone"),
    line1: z.string().trim().min(5).max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(2).max(100),
    state: z.string().trim().min(2).max(100),
    pincode: z.string().regex(/^\d{6}$/, "Invalid pincode"),
  }),

  paymentMethod: z.enum(["razorpay", "cod", "upi"]),
  notes: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  trackingNumber: z.string().optional(),
});

export const getAllOrdersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z
    .enum(["pending", "processing", "shipped", "delivered", "cancelled"])
    .optional(),
});
