const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, notes } = req.body;
  if (!items?.length) return res.status(400).json({ error: 'No items' });

  let itemsPrice = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ error: `Product not found: ${item.product}` });
    if (product.stock < item.quantity) return res.status(400).json({ error: `${product.name} out of stock` });

    itemsPrice += product.price * item.quantity;
    orderItems.push({
      product: product._id, name: product.name,
      image: product.images?.[0]?.url, price: product.price,
      quantity: item.quantity,
    });
    product.stock -= item.quantity;
    await product.save();
  }

  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const taxPrice = Math.round(itemsPrice * 0.05);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const order = await Order.create({
    user: req.user._id, items: orderItems, shippingAddress,
    paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice, notes,
  });

  res.status(201).json(order);
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.json(orders);
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ error: 'Not authorized' });
  res.json(order);
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;
  const query = status ? { orderStatus: status } : {};
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .skip((page - 1) * limit)
    .limit(Number(limit));
  res.json({ orders, total, page: Number(page), pages: Math.ceil(total / limit) });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { orderStatus: req.body.status, ...(req.body.trackingNumber && { trackingNumber: req.body.trackingNumber }) },
    { new: true }
  );
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});
