const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  register, login, getMe, updateProfile, changePassword, addAddress, toggleWishlist
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/address', protect, addAddress);
router.put('/wishlist/:productId', protect, toggleWishlist);

module.exports = router;
