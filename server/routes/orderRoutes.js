const router = require('express').Router();
const { protect, admin } = require('../middleware/auth');
const {
  createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus,
} = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/admin', protect, admin, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
