// userRoutes.js
const router = require('express').Router();
const { protect, admin } = require('../middleware/auth');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password').sort('-createdAt');
  res.json(users);
}));

router.get('/:id', protect, admin, asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}));

router.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
  res.json(user);
}));

module.exports = router;
