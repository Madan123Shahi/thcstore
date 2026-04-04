const router = require('express').Router();
const { protect, admin } = require('../middleware/auth');
const {
  getCategories, getCategory, createCategory, updateCategory, deleteCategory,
} = require('../controllers/categoryController');

router.get('/', getCategories);
router.get('/:slug', getCategory);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
