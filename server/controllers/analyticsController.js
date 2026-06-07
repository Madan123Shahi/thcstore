import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import EventLog from "../models/EventLog.js";
import { asyncHandler } from "../utils/appError.js";

// ─────────────────────────────────────────────
// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Admin
// ─────────────────────────────────────────────
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const now       = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now - 30 * 24 * 60 * 60 * 1000);

  // ── Revenue & orders ──────────────────────────────────────────
  const [
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    totalOrders,
    thisMonthOrders,
    totalUsers,
  ] = await Promise.all([
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: thisMonth } } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
    Order.aggregate([{ $match: { createdAt: { $gte: lastMonth, $lt: thisMonth } } }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: thisMonth } }),
    User.countDocuments({ role: "user" }),
  ]);

  // ── Daily revenue — last 7 days ───────────────────────────────
  const dailyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: last7Days }, isPaid: true } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // ── Orders by status ──────────────────────────────────────────
  const ordersByStatus = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  // ── Top selling products ──────────────────────────────────────
  const topProducts = await Order.aggregate([
    { $match: { createdAt: { $gte: last30Days } } },
    { $unwind: "$items" },
    {
      $group: {
        _id:      "$items.product",
        name:     { $first: "$items.name" },
        revenue:  { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        sold:     { $sum: "$items.quantity" },
      },
    },
    { $sort: { revenue: -1 } },
    { $limit: 5 },
  ]);

  // ── Monthly revenue — last 6 months ──────────────────────────
  const monthlyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) }, isPaid: true } },
    {
      $group: {
        _id:     { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: "$totalPrice" },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // ── Low stock products ────────────────────────────────────────
  const lowStock = await Product.find({ stock: { $lte: 5 }, isActive: true })
    .select("name stock images")
    .sort("stock")
    .limit(5);

  const revenueGrowth = lastMonthRevenue[0]?.total
    ? (((thisMonthRevenue[0]?.total || 0) - lastMonthRevenue[0].total) / lastMonthRevenue[0].total * 100).toFixed(1)
    : 0;

  res.json({
    summary: {
      totalRevenue:     totalRevenue[0]?.total || 0,
      thisMonthRevenue: thisMonthRevenue[0]?.total || 0,
      revenueGrowth:    Number(revenueGrowth),
      totalOrders,
      thisMonthOrders,
      totalUsers,
    },
    dailyRevenue,
    monthlyRevenue,
    ordersByStatus,
    topProducts,
    lowStock,
  });
});

// ─────────────────────────────────────────────
// @desc    Log a frontend event
// @route   POST /api/analytics/event
// @access  Public
// ─────────────────────────────────────────────
export const logEvent = asyncHandler(async (req, res) => {
  const { event, page, data } = req.body;
  if (!event) return res.json({ ok: true }); // silently ignore empty

  await EventLog.create({
    event,
    page,
    data,
    userId:    req.user?._id || null,
    userAgent: req.headers["user-agent"],
    ip:        req.ip,
  });

  res.json({ ok: true });
});

// ─────────────────────────────────────────────
// @desc    Get event logs (admin)
// @route   GET /api/analytics/events
// @access  Admin
// ─────────────────────────────────────────────
export const getEventLogs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, event } = req.query;
  const query = event ? { event } : {};
  const logs  = await EventLog.find(query)
    .sort("-createdAt")
    .skip((page - 1) * limit)
    .limit(Number(limit));
  const total = await EventLog.countDocuments(query);
  res.json({ logs, total });
});