const Category = require('../models/Category');
const Analysis = require('../models/Analysis');

// GET all categories with analysis count
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort('order');

    const withCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Analysis.countDocuments({
          category: cat._id,
          published: true,
        });

        return {
          ...cat.toObject(),
          analysisCount: count,
        };
      })
    );

    res.json(withCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single category by slug
exports.getCategoryBySlug = async (req, res) => {
  try {
    const cat = await Category.findOne({ slug: req.params.slug });

    if (!cat) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE category
exports.createCategory = async (req, res) => {
  try {
    // Remove icon and color if they were sent
    const { icon, color, ...cleanData } = req.body;
    const cat = await Category.create(cleanData);
    res.status(201).json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// UPDATE category
exports.updateCategory = async (req, res) => {
  try {
    // Remove icon and color if they were sent
    const { icon, color, ...cleanData } = req.body;
    const cat = await Category.findByIdAndUpdate(
      req.params.id,
      cleanData,
      { new: true }
    );

    res.json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};