const router = require('express').Router();
const { protect, admin } = require('../middleware/auth');
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  getFeatured, getBestSellers, addReview,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/featured', getFeatured);
router.get('/bestsellers', getBestSellers);
router.get('/:id', getProduct);
router.post('/', protect, admin, createProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, addReview);

module.exports = router;
