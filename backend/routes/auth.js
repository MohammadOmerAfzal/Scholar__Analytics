const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  toggleBookmark
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/bookmark/:analysisId', protect, toggleBookmark);

module.exports = router;