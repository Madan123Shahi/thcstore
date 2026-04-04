// cartRoutes.js - Cart is managed client-side via Redux, this route handles server-sync
const router = require('express').Router();
const { protect } = require('../middleware/auth');

router.get('/', protect, (req, res) => res.json({ message: 'Cart is managed client-side' }));

module.exports = router;
