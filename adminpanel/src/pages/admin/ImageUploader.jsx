import React, { useState, useRef, useCallback, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './ImageUploader.css';

const MAX_SIZE_MB = 8;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Tab: Upload ───────────────────────────────────────────────
function UploadTab({ onUploaded }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef();

  const validate = (file) => {
    if (!ACCEPTED.includes(file.type)) {
      toast.error('Unsupported format. Use JPEG, PNG, GIF, WebP, or SVG.');
      return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_SIZE_MB} MB.`);
      return false;
    }
    return true;
  };

  const selectFile = (file) => {
    if (!validate(file)) return;
    setPendingFile(file);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) selectFile(file);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', pendingFile);

    try {
      const { data } = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        }
      });
      toast.success('Image uploaded!');
      onUploaded(data.url);
      setPendingFile(null);
      setPreview(null);
      setProgress(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  const clearPending = () => { setPendingFile(null); setPreview(null); setProgress(0); };

  return (
    <div className="upload-tab">
      {!pendingFile ? (
        <div
          className={`drop-zone ${dragging ? 'dragging' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            style={{ display: 'none' }}
            onChange={e => e.target.files[0] && selectFile(e.target.files[0])}
          />
          <div className="drop-zone-icon">
            {dragging ? '📂' : '🖼️'}
          </div>
          <p className="drop-zone-main">
            {dragging ? 'Drop to select' : 'Drag & drop an image here'}
          </p>
          <p className="drop-zone-sub">or click to browse · JPEG, PNG, GIF, WebP, SVG · max {MAX_SIZE_MB} MB</p>
        </div>
      ) : (
        <div className="pending-preview">
          <img src={preview} alt="preview" className="pending-img" />
          <div className="pending-info">
            <div className="pending-filename">{pendingFile.name}</div>
            <div className="pending-size">{formatBytes(pendingFile.size)}</div>

            {uploading && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <span className="progress-pct">{progress}%</span>
              </div>
            )}

            <div className="pending-actions">
              <button className="btn btn-primary" onClick={handleUpload} disabled={uploading} style={{ fontSize: 13 }}>
                {uploading ? 'Uploading...' : '⬆ Upload Image'}
              </button>
              <button className="btn btn-ghost" onClick={clearPending} disabled={uploading} style={{ fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: URL ─────────────────────────────────────────────────
function UrlTab({ currentUrl, onSelect }) {
  const [url, setUrl] = useState(currentUrl || '');
  const [valid, setValid] = useState(Boolean(currentUrl));

  const handleChange = (val) => {
    setUrl(val);
    setValid(Boolean(val.match(/^https?:\/\/.+\.(jpe?g|png|gif|webp|svg)(\?.*)?$/i) || val.startsWith('http')));
  };

  return (
    <div className="url-tab">
      <label>Image URL</label>
      <input
        type="url"
        placeholder="https://example.com/chart.png"
        value={url}
        onChange={e => handleChange(e.target.value)}
        autoFocus
      />
      {url && (
        <div className="url-preview-wrap">
          <img
            src={url}
            alt="URL preview"
            className="url-preview-img"
            onLoad={() => setValid(true)}
            onError={() => setValid(false)}
          />
          {!valid && <p className="url-error">⚠ Could not load image from this URL</p>}
        </div>
      )}
      <button
        className="btn btn-primary"
        onClick={() => onSelect(url)}
        disabled={!url}
        style={{ fontSize: 13, alignSelf: 'flex-start' }}
      >
        Use this URL
      </button>
    </div>
  );
}

// ── Tab: Library ─────────────────────────────────────────────
function LibraryTab({ onSelect }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchImages = () => {
    setLoading(true);
    api.get('/upload/images')
      .then(r => setImages(r.data))
      .catch(() => toast.error('Failed to load image library'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const handleDelete = async (e, filename) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${filename}"?`)) return;
    setDeleting(filename);
    try {
      await api.delete(`/upload/image/${filename}`);
      setImages(prev => prev.filter(img => img.filename !== filename));
      if (selected?.filename === filename) setSelected(null);
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
    setDeleting(null);
  };

  return (
    <div className="library-tab">
      <div className="library-toolbar">
        <span className="library-count">{images.length} image{images.length !== 1 ? 's' : ''} uploaded</span>
        <button className="btn btn-ghost" onClick={fetchImages} style={{ fontSize: 12, padding: '5px 10px' }}>
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <div className="library-loading">Loading library...</div>
      ) : images.length === 0 ? (
        <div className="library-empty">No images uploaded yet. Use the Upload tab to add images.</div>
      ) : (
        <div className="library-grid">
          {images.map(img => (
            <div
              key={img.filename}
              className={`library-item ${selected?.filename === img.filename ? 'selected' : ''}`}
              onClick={() => setSelected(img)}
            >
              <img src={img.url} alt={img.filename} loading="lazy" />
              <div className="library-item-overlay">
                <span className="library-item-size">{formatBytes(img.size)}</span>
                <button
                  className="library-item-del"
                  onClick={(e) => handleDelete(e, img.filename)}
                  disabled={deleting === img.filename}
                  title="Delete image"
                >
                  {deleting === img.filename ? '...' : '✕'}
                </button>
              </div>
              {selected?.filename === img.filename && (
                <div className="library-item-check">✓</div>
              )}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="library-selection-bar">
          <img src={selected.url} alt="" className="selection-thumb" />
          <div className="selection-info">
            <span className="selection-name">{selected.filename}</span>
            <span className="selection-size">{formatBytes(selected.size)}</span>
          </div>
          <button className="btn btn-primary" onClick={() => onSelect(selected.url)} style={{ fontSize: 13 }}>
            Use this image
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main ImageUploader ────────────────────────────────────────
const TABS = [
  { id: 'upload', label: '⬆ Upload' },
  { id: 'url',    label: '🔗 URL' },
  { id: 'library', label: '🗃 Library' },
];

export default function ImageUploader({ currentUrl, onSelect }) {
  const [activeTab, setActiveTab] = useState(currentUrl ? 'url' : 'upload');

  const handleSelect = (url) => {
    onSelect(url);
    toast.success('Image selected');
  };

  return (
    <div className="image-uploader">
      <div className="uploader-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`uploader-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="uploader-body">
        {activeTab === 'upload'  && <UploadTab onUploaded={handleSelect} />}
        {activeTab === 'url'     && <UrlTab currentUrl={currentUrl} onSelect={handleSelect} />}
        {activeTab === 'library' && <LibraryTab onSelect={handleSelect} />}
      </div>
    </div>
  );
}