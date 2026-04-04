const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password are required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email already registered' });

  const user = await User.create({ name, email, password, phone });
  const token = signToken(user._id);

  res.status(201).json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ error: 'Invalid credentials' });

  if (!user.isActive)
    return res.status(403).json({ error: 'Account deactivated' });

  const token = signToken(user._id);
  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name images price');
  res.json(user);
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, dateOfBirth } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, phone, dateOfBirth },
    { new: true, runValidators: true }
  );
  res.json(user);
});

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword)))
    return res.status(400).json({ error: 'Current password incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
});

exports.addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach(a => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  res.json(user.addresses);
});

exports.toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid = req.params.productId;
  const idx = user.wishlist.findIndex(id => id.toString() === pid);
  if (idx > -1) user.wishlist.splice(idx, 1);
  else user.wishlist.push(pid);
  await user.save();
  res.json({ wishlist: user.wishlist });
});
