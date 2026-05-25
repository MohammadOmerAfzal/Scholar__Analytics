const Analysis = require('../models/Analysis');
const Category = require('../models/Category');

// ─────────────────────────────────────────
// GET all analyses (ADMIN - includes drafts)
// ─────────────────────────────────────────
exports.getAnalyses = async (req, res) => {
  try {
    const { category, tag, difficulty, search, page = 1, limit = 20, admin } = req.query;

    const filter = {};

    // If not admin request, only show published
    if (admin !== '1') {
      filter.published = true;
    }

    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (difficulty) filter.difficulty = difficulty;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [analyses, total] = await Promise.all([
      Analysis.find(filter)
        .populate('category', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Analysis.countDocuments(filter)
    ]);

    res.json({
      analyses,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limitNum)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// GET single analysis (public)
// ─────────────────────────────────────────
// analysisController.js - Update the getSingleAnalysis function
exports.getSingleAnalysis = async (req, res) => {
  try {
    const { slug } = req.params;
    const isAdminRequest = req.query.admin === '1';
    const trackView = req.headers['x-track-view'] !== 'false';

    const isId = slug.match(/^[0-9a-fA-F]{24}$/);
    const query = isId ? { _id: slug } : { slug };

    if (!isAdminRequest) {
      query.published = true;
    }

    const analysis = await Analysis.findOne(query)
      .populate('category', 'name slug')
      .populate('author', 'username');

    if (!analysis) return res.status(404).json({ message: 'Analysis not found' });

    // Only increment views if not admin request and trackView is true
    if (!isAdminRequest && trackView) {
      analysis.views += 1;
      await analysis.save();
    }

    res.json(analysis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// GET by category slug (public)
// ─────────────────────────────────────────
exports.getByCategory = async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug });

    if (!cat) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const analyses = await Analysis.find({
      category: cat._id,
      published: true
    })
      .populate('category', 'name slug')
      .select('-contentBlocks')
      .sort({ createdAt: -1 });

    res.json({ category: cat, analyses });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// GET by ID (ADMIN)
// ─────────────────────────────────────────
exports.getByIdAdmin = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id)
      .populate('category', 'name slug')
      .populate('author', 'username');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json(analysis);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// GET by slug (PUBLIC)
// ─────────────────────────────────────────
exports.getBySlug = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      slug: req.params.slug,
      published: true
    })
      .populate('category', 'name slug')
      .populate('author', 'username');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    analysis.views += 1;
    await analysis.save();

    res.json(analysis);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────
exports.createAnalysis = async (req, res) => {
  try {
    const data = { ...req.body, author: req.user._id };

    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
    }

    const analysis = await Analysis.create(data);
    await analysis.populate('category', 'name slug');

    res.status(201).json(analysis);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Slug already exists' });
    }
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────
exports.updateAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json(analysis);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────
exports.deleteAnalysis = async (req, res) => {
  try {
    await Analysis.findByIdAndDelete(req.params.id);
    res.json({ message: 'Analysis deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────
// TOGGLE PUBLISH
// ─────────────────────────────────────────
exports.togglePublish = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id);

    if (!analysis) {
      return res.status(404).json({ message: 'Not found' });
    }

    analysis.published = !analysis.published;
    await analysis.save();

    res.json({ published: analysis.published });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};