const mongoose = require('mongoose');

// Each content block can be one of 5 types
const contentBlockSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'image', 'code', 'video', 'table'],
    required: true
  },
  order: {
    type: Number,
    required: true
  },

  // For type: 'text'
  textContent: { type: String },

  // For type: 'image'
  imageUrl: { type: String },
  imageCaption: { type: String },

  // For type: 'code'
  codeContent: { type: String },
  codeLanguage: { type: String, default: 'python' },
  codeTitle: { type: String },

  // For type: 'video'
  videoUrl: { type: String },     // YouTube embed or direct URL
  videoTitle: { type: String },

  // For type: 'table'
  tableHeaders: [{ type: String }],
  tableRows: [[{ type: String }]]  // 2D array of cells
});

const analysisSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  summary: {
    type: String,
    required: [true, 'Summary is required'],
    maxlength: 300
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  tags: [{ type: String, lowercase: true }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  contentBlocks: [contentBlockSchema],  // Ordered array of mixed content
  views: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Auto-generate slug from title if not provided
analysisSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

module.exports = mongoose.model('Analysis', analysisSchema);