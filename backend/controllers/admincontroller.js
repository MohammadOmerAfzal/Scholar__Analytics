const User = require('../models/User');
const Analysis = require('../models/Analysis');
const Category = require('../models/Category');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalAnalyses, publishedAnalyses, totalCategories] =
      await Promise.all([
        User.countDocuments(),
        Analysis.countDocuments(),
        Analysis.countDocuments({ published: true }),
        Category.countDocuments(),
      ]);

    const topAnalyses = await Analysis.find({ published: true })
      .sort({ views: -1 })
      .limit(5)
      .select('title views category slug')
      .populate('category', 'name');

    res.json({
      totalUsers,
      totalAnalyses,
      publishedAnalyses,
      totalCategories,
      topAnalyses,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};