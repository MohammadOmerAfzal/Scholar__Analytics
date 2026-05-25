const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect, adminOnly } = require('../middleware/auth');

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'images');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer config — disk storage with sanitized filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 40);
    const unique = `${base}-${Date.now()}${ext}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp, svg)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 8 * 1024 * 1024 } // 8 MB max
});

// POST /api/upload/image — admin only
router.post('/image', protect, adminOnly, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Maximum size is 8 MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    // Return the public URL
    const url = `${req.protocol}://${req.get('host')}/uploads/images/${req.file.filename}`;
    res.status(201).json({
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// DELETE /api/upload/image/:filename — admin only
router.delete('/image/:filename', protect, adminOnly, (req, res) => {
  // Sanitize — no path traversal
  const filename = path.basename(req.params.filename);
  const filepath = path.join(UPLOAD_DIR, filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ message: 'File not found' });
  }
  fs.unlink(filepath, (err) => {
    if (err) return res.status(500).json({ message: 'Failed to delete file' });
    res.json({ message: 'File deleted', filename });
  });
});

// GET /api/upload/images — list all uploaded images (admin)
router.get('/images', protect, adminOnly, (req, res) => {
  fs.readdir(UPLOAD_DIR, (err, files) => {
    if (err) return res.status(500).json({ message: 'Could not list files' });
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/images/`;
    const images = files
      .filter(f => /\.(jpe?g|png|gif|webp|svg)$/i.test(f))
      .map(f => {
        const stat = fs.statSync(path.join(UPLOAD_DIR, f));
        return { filename: f, url: baseUrl + f, size: stat.size, createdAt: stat.birthtime };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
    res.json(images);
  });
});

// ── VIDEO UPLOAD ─────────────────────────────────────────────

const VIDEO_DIR = path.join(__dirname, '..', 'uploads', 'videos');
if (!fs.existsSync(VIDEO_DIR)) fs.mkdirSync(VIDEO_DIR, { recursive: true });

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEO_DIR),
  filename: (req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40);
    cb(null, `${base}-${Date.now()}${ext}`);
  }
});

const videoFilter = (req, file, cb) => {
  const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Only video files allowed (mp4, webm, ogg, mov)'), false);
};

const uploadVideo = multer({
  storage: videoStorage,
  fileFilter: videoFilter,
  limits: { fileSize: 200 * 1024 * 1024 } // 200 MB
});

// POST /api/upload/video
router.post('/video', protect, adminOnly, (req, res) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ message: 'File too large. Max 200 MB.' });
      return res.status(400).json({ message: err.message });
    }
    if (err)       return res.status(400).json({ message: err.message });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const url = `${req.protocol}://${req.get('host')}/uploads/videos/${req.file.filename}`;
    res.status(201).json({
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});

// DELETE /api/upload/video/:filename
router.delete('/video/:filename', protect, adminOnly, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(VIDEO_DIR, filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ message: 'File not found' });
  fs.unlink(filepath, (err) => {
    if (err) return res.status(500).json({ message: 'Failed to delete file' });
    res.json({ message: 'File deleted', filename });
  });
});

// GET /api/upload/videos
router.get('/videos', protect, adminOnly, (req, res) => {
  fs.readdir(VIDEO_DIR, (err, files) => {
    if (err) return res.status(500).json({ message: 'Could not list files' });
    const baseUrl = `${req.protocol}://${req.get('host')}/uploads/videos/`;
    const videos = files
      .filter(f => /\.(mp4|webm|ogg|mov)$/i.test(f))
      .map(f => {
        const stat = fs.statSync(path.join(VIDEO_DIR, f));
        return { filename: f, url: baseUrl + f, size: stat.size, createdAt: stat.birthtime };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
    res.json(videos);
  });
});

module.exports = router;