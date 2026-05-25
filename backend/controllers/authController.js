const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({ username, email, password });

    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ message: `${field} already exists` });
    }

    res.status(400).json({ message: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET PROFILE
exports.getMe = (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      bookmarks: req.user.bookmarks,
      createdAt: req.user.createdAt
    }
  });
};

// BOOKMARK
exports.toggleBookmark = async (req, res) => {
  try {
    const user = req.user;
    const id = req.params.analysisId;

    const isBookmarked = user.bookmarks.includes(id);

    if (isBookmarked) {
      user.bookmarks = user.bookmarks.filter(
        (b) => b.toString() !== id
      );
    } else {
      user.bookmarks.push(id);
    }

    await user.save();

    res.json({
      bookmarked: !isBookmarked,
      bookmarks: user.bookmarks
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};