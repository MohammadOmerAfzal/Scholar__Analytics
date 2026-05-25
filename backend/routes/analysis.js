const express = require('express');
const router = express.Router();

const {
  getAnalyses,
  getByCategory,
  getSingleAnalysis,
  getByIdAdmin,
  getBySlug,
  createAnalysis,
  updateAnalysis,
  deleteAnalysis,
  togglePublish
} = require('../controllers/analysisController');

const { protect, adminOnly, optionalAuth } = require('../middleware/auth');

// Public
router.get('/', getAnalyses);
router.get('/by-category/:slug', getByCategory);
router.get('/:slug', optionalAuth, getBySlug);

// Admin
router.get('/id/:id', protect, adminOnly, getByIdAdmin);
router.post('/', protect, adminOnly, createAnalysis);
router.put('/:id', protect, adminOnly, updateAnalysis);
router.delete('/:id', protect, adminOnly, deleteAnalysis);
router.patch('/:id/publish', protect, adminOnly, togglePublish);

module.exports = router;