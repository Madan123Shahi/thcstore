import Stripe from "stripe";
import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import Coupon from "../models/Coupon.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { io } from "../server.js";
import {
  sendOrderConfirmationEmail,
  sendShippingUpdateEmail,
  sendRefundEmail,
} from "../services/emailService.js";
import { handleOrderLoyalty } from "../services/loyaltyService.js";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_PRICE, TAX_RATE } from "../../shared/constants.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const emitOrderUpdate = (order) => {
  io.to(`user:${order.user}`).emit("order:updated", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    isPaid: order.isPaid,
    trackingNumber: order.trackingNumber,
  });
  io.to("admin").emit("order:updated", {
    orderId: order._id,
    orderNumber: order.orderNumber,
    orderStatus: order.orderStatus,
    user: order.user,
  });
};

// ─────────────────────────────────────────────
// @desc    Create Stripe PaymentIntent
// @route   POST /api/payments/create-payment-intent
// @access  Private
// ─────────────────────────────────────────────
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { totalPrice } = req.body;
  if (!totalPrice || totalPrice <= 0) throw new AppError("Invalid total price", 400);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalPrice * 100),
    currency: "usd",
    metadata: { userId: req.user._id.toString() },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
});

// ─────────────────────────────────────────────
// @desc    Verify payment after Stripe confirms
// @route   POST /api/payments/verify
// @access  Private
// ─────────────────────────────────────────────
export const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentIntentId } = req.body;
  if (!paymentIntentId) throw new AppError("Payment Intent ID is required", 400);

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (paymentIntent.status !== "succeeded") throw new AppError("Payment not completed", 400);

  // Ensure the payment intent belongs to the requesting user
  if (paymentIntent.metadata?.userId !== req.user._id.toString())
    throw new AppError("Unauthorized payment intent", 403);

  const order = await Order.findOne({ paymentIntentId });
  if (!order) throw new AppError("Order not found for this payment", 404);
  if (order.isPaid) return res.json({ message: "Payment already verified", order });

  order.isPaid = true;
  order.paidAt = new Date();
  order.orderStatus = "confirmed";
  order.paymentResult = {
    status: paymentIntent.status,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    update_time: new Date().toISOString(),
  };
  await order.save();

  emitOrderUpdate(order);

  res.json({ message: "Payment verified successfully", order });
});

// ─────────────────────────────────────────────
// @desc    Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe only)
// ─────────────────────────────────────────────
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    try {
      const order = await Order.findOne({ paymentIntentId: paymentIntent.id });
      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date();
        order.orderStatus = "confirmed";
        order.paymentResult = {
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          update_time: new Date().toISOString(),
        };
        await order.save();
        emitOrderUpdate(order);
        console.log(`✅ Webhook: Order ${order.orderNumber} marked as paid`);
      }
    } catch (err) {
      console.error("Webhook order update failed:", err.message);
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    console.error(`❌ Payment failed for intent: ${event.data.object.id}`);
  }

  res.json({ received: true });
};

// ─────────────────────────────────────────────
// @desc    Refund a paid order
// @route   PUT /api/orders/:id/refund
// @access  Admin
// ─────────────────────────────────────────────
export const refundOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError("Order not found", 404);
  if (!order.isPaid) throw new AppError("Order has not been paid", 400);
  if (order.paymentMethod !== "stripe")
    throw new AppError("Refunds only apply to Stripe payments", 400);
  if (order.orderStatus === "refunded") throw new AppError("Order already refunded", 400);
  if (!order.paymentIntentId) throw new AppError("No payment intent found", 400);

  const refund = await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
    reason: "requested_by_customer",
  });

  order.orderStatus = "refunded";
  order.paymentResult = {
    ...order.paymentResult,
    status: `refunded — ${refund.status}`,
    update_time: new Date().toISOString(),
  };
  await order.save();

  emitOrderUpdate(order);

  const user = await User.findById(order.user);
  if (user) sendRefundEmail(order, user).catch(console.error);

  res.json({ message: "Refund issued successfully", refund, order });
});

// ─────────────────────────────────────────────
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// ─────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes, paymentIntentId, couponCode } = req.body;
  if (!items?.length) throw new AppError("No items", 400);

  // ── Pre-validate Stripe payment before touching the DB ──────────────────
  let paymentIntent = null;
  if (paymentMethod === "stripe") {
    if (!paymentIntentId) throw new AppError("Payment intent ID is required", 400);

    paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") throw new AppError("Payment not completed", 400);

    if (paymentIntent.metadata?.userId !== req.user._id.toString())
      throw new AppError("Unauthorized payment intent", 403);

    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder) throw new AppError("Payment already used for an order", 400);
  }

  // ── MongoDB transaction for atomic stock decrement ──────────────────────
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let itemsPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true, session }
      );
      if (!product) throw new AppError(`Product not found or out of stock: ${item.product}`, 400);

      itemsPrice += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images?.[0]?.url,
        price: product.price,
        quantity: item.quantity,
      });
    }

    const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE;
    const taxPrice = Math.round(itemsPrice * TAX_RATE);

    // ── Resolve coupon discount ─────────────────────────────────────────
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
      if (coupon) {
        const { valid } = coupon.isValid(itemsPrice);
        if (valid) {
          const calculated = coupon.calculateDiscount(itemsPrice, shippingPrice);
          if (calculated > 0) {
            discountAmount = calculated;
            coupon.usedCount += 1;
            await coupon.save({ session });
          }
        }
      }
    }

    const totalPrice = itemsPrice + shippingPrice + taxPrice - discountAmount;

    // ── Validate Stripe amount matches computed total ────────────────────
    if (paymentMethod === "stripe") {
      const expectedAmount = Math.round(totalPrice * 100);
      if (paymentIntent.amount !== expectedAmount) {
        throw new AppError(
          `Payment amount mismatch: expected ${expectedAmount}, got ${paymentIntent.amount}`,
          400
        );
      }
    }

    const order = await Order.create(
      [
        {
          user: req.user._id,
          items: orderItems,
          shippingAddress,
          paymentMethod,
          paymentIntentId: paymentMethod === "stripe" ? paymentIntentId : undefined,
          isPaid: paymentMethod === "stripe",
          paidAt: paymentMethod === "stripe" ? new Date() : undefined,
          orderStatus: paymentMethod === "stripe" ? "confirmed" : "pending",
          itemsPrice,
          shippingPrice,
          taxPrice,
          discountAmount,
          totalPrice,
          notes,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    const createdOrder = order[0];

    // ── Real-time notification ──────────────────────────────────────────
    io.to("admin").emit("order:new", {
      orderId: createdOrder._id,
      orderNumber: createdOrder.orderNumber,
      totalPrice: createdOrder.totalPrice,
      user: req.user._id,
    });

    // ── Non-blocking: email + loyalty points ────────────────────────────
    sendOrderConfirmationEmail(createdOrder, req.user).catch(console.error);
    handleOrderLoyalty({ user: req.user, order: createdOrder }).catch(console.error);

    res.status(201).json(createdOrder);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
});

// ─────────────────────────────────────────────
// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
// ─────────────────────────────────────────────
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
  res.json(orders);
});

// ─────────────────────────────────────────────
// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
// ─────────────────────────────────────────────
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) throw new AppError("Order not found", 404);
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== "admin")
    throw new AppError("Not authorized", 403);
  res.json(order);
});

// ─────────────────────────────────────────────
// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
// ─────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const { status } = req.query;

  const query = status ? { orderStatus: status } : {};
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate("user", "name email")
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ orders, total, page, pages: Math.ceil(total / limit) });
});

// ─────────────────────────────────────────────
// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
// ─────────────────────────────────────────────
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      orderStatus: status,
      ...(trackingNumber && { trackingNumber }),
    },
    { new: true, runValidators: true }
  );

  if (!order) throw new AppError("Order not found", 404);

  emitOrderUpdate(order);

  const user = await User.findById(order.user);
  if (user) sendShippingUpdateEmail(order, user).catch(console.error);

  res.json(order);
});
