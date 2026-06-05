import Stripe from "stripe";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { asyncHandler, AppError } from "../utils/appError.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ─────────────────────────────────────────────
// @desc    Create Stripe PaymentIntent
// @route   POST /api/payments/create-payment-intent
// @access  Private
// ─────────────────────────────────────────────
export const createPaymentIntent = asyncHandler(async (req, res) => {
  const { totalPrice } = req.body;

  if (!totalPrice || totalPrice <= 0)
    throw new AppError("Invalid total price", 400);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(totalPrice * 100), // Stripe uses cents
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

  if (!paymentIntentId)
    throw new AppError("Payment Intent ID is required", 400);

  // ✅ Retrieve PaymentIntent directly from Stripe
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  if (paymentIntent.status !== "succeeded")
    throw new AppError("Payment not completed", 400);

  // ✅ Find the order linked to this paymentIntentId
  const order = await Order.findOne({ paymentIntentId });
  if (!order) throw new AppError("Order not found for this payment", 404);

  // ✅ Already verified — prevent duplicate processing
  if (order.isPaid)
    return res.json({ message: "Payment already verified", order });

  // ✅ Mark order as paid
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

  res.json({ message: "Payment verified successfully", order });
});

// ─────────────────────────────────────────────
// @desc    Stripe Webhook — async payment confirmation
// @route   POST /api/payments/webhook
// @access  Public (Stripe only) — NO auth middleware
// ─────────────────────────────────────────────
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    // ✅ req.body must be raw Buffer here — see app.js note below
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // ✅ Handle payment_intent.succeeded event
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;

    try {
      const order = await Order.findOne({
        paymentIntentId: paymentIntent.id,
      });

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
        console.log(`✅ Webhook: Order ${order.orderNumber} marked as paid`);
      }
    } catch (err) {
      console.error("Webhook order update failed:", err.message);
      // ✅ Still return 200 — so Stripe doesn't keep retrying
    }
  }

  // ✅ Handle payment_intent.payment_failed event
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    console.error(`❌ Payment failed for intent: ${paymentIntent.id}`);
    // Optionally notify user via email here
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

  // ✅ Only refund paid Stripe orders
  if (!order.isPaid) throw new AppError("Order has not been paid", 400);
  if (order.paymentMethod !== "stripe")
    throw new AppError("Refunds only apply to Stripe payments", 400);
  if (order.orderStatus === "refunded")
    throw new AppError("Order already refunded", 400);
  if (!order.paymentIntentId)
    throw new AppError("No payment intent found for this order", 400);

  // ✅ Issue refund via Stripe
  const refund = await stripe.refunds.create({
    payment_intent: order.paymentIntentId,
    reason: "requested_by_customer",
  });

  // ✅ Update order status
  order.orderStatus = "refunded";
  order.paymentResult = {
    ...order.paymentResult,
    status: `refunded — ${refund.status}`,
    update_time: new Date().toISOString(),
  };
  await order.save();

  res.json({ message: "Refund issued successfully", refund, order });
});

// ─────────────────────────────────────────────
// @desc    Create new order
// @route   POST /api/orders
// @access  Private
// ─────────────────────────────────────────────
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes, paymentIntentId } =
    req.body;

  if (!items?.length) throw new AppError("No items", 400);

  // ✅ Verify Stripe payment before creating order
  if (paymentMethod === "stripe") {
    if (!paymentIntentId)
      throw new AppError("Payment intent ID is required", 400);

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (paymentIntent.status !== "succeeded")
      throw new AppError("Payment not completed", 400);

    // ✅ Prevent reuse of same paymentIntentId
    const existingOrder = await Order.findOne({ paymentIntentId });
    if (existingOrder)
      throw new AppError("Payment already used for an order", 400);
  }

  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    // ✅ Atomic stock decrement — prevents race condition
    const product = await Product.findOneAndUpdate(
      { _id: item.product, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true },
    );

    if (!product)
      throw new AppError(
        `Product not found or out of stock: ${item.product}`,
        400,
      );

    itemsPrice += product.price * item.quantity;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      price: product.price,
      quantity: item.quantity,
    });
  }

  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const order = await Order.create({
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
    totalPrice,
    notes,
  });

  res.status(201).json(order);
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
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email",
  );

  if (!order) throw new AppError("Order not found", 404);

  if (
    order.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  )
    throw new AppError("Not authorized", 403);

  res.json(order);
});

// ─────────────────────────────────────────────
// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
// ─────────────────────────────────────────────
export const getAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
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
    { new: true, runValidators: true },
  );

  if (!order) throw new AppError("Order not found", 404);
  res.json(order);
});
