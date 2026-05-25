import React, { useState, useRef, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import './VideoUploader.css';

const MAX_SIZE_MB = 200;
const ACCEPTED_MIME = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const ACCEPTED_ATTR = ACCEPTED_MIME.join(',');

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ── Helpers ───────────────────────────────────────────────────

function getYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

function getYouTubeThumbnail(url) {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

function isYouTubeUrl(url) { return Boolean(getYouTubeId(url)); }

// ── Tab: Upload ───────────────────────────────────────────────
function UploadTab({ onUploaded }) {
  const [dragging,    setDragging]    = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [pendingFile, setPendingFile] = useState(null);
  const [preview,     setPreview]     = useState(null);
  const [progress,    setProgress]    = useState(0);
  const inputRef = useRef();

  const validate = (file) => {
    if (!ACCEPTED_MIME.includes(file.type)) {
      toast.error('Unsupported format. Use MP4, WebM, OGG, or MOV.'); return false;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Max ${MAX_SIZE_MB} MB.`); return false;
    }
    return true;
  };

  const selectFile = (file) => {
    if (!validate(file)) return;
    setPendingFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) selectFile(file);
  };

  const handleUpload = async () => {
    if (!pendingFile) return;
    setUploading(true); setProgress(0);
    const formData = new FormData();
    formData.append('video', pendingFile);
    try {
      const { data } = await api.post('/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total))
      });
      toast.success('Video uploaded!');
      onUploaded(data.url, data.filename);
      setPendingFile(null); setPreview(null); setProgress(0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    }
    setUploading(false);
  };

  const clear = () => { setPendingFile(null); setPreview(null); setProgress(0); };

  return (
    <div className="vupload-tab">
      {!pendingFile ? (
        <div
          className={`vdrop-zone ${dragging ? 'dragging' : ''}`}
          onDrop={onDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept={ACCEPTED_ATTR} style={{ display: 'none' }}
            onChange={e => e.target.files[0] && selectFile(e.target.files[0])} />
          <div className="vdrop-icon">{dragging ? '📂' : '🎬'}</div>
          <p className="vdrop-main">{dragging ? 'Drop to select' : 'Drag & drop a video here'}</p>
          <p className="vdrop-sub">or click to browse · MP4, WebM, OGG, MOV · max {MAX_SIZE_MB} MB</p>
        </div>
      ) : (
        <div className="vpending">
          <video src={preview} className="vpending-preview" controls muted />
          <div className="vpending-info">
            <div className="vpending-name">{pendingFile.name}</div>
            <div className="vpending-size">{formatBytes(pendingFile.size)}</div>
            {uploading && (
              <div className="vupload-progress">
                <div className="vprogress-bar"><div className="vprogress-fill" style={{ width: `${progress}%` }} /></div>
                <span className="vprogress-pct">{progress}%</span>
              </div>
            )}
            <div className="vpending-actions">
              <button className="btn btn-primary" onClick={handleUpload} disabled={uploading} style={{ fontSize: 13 }}>
                {uploading ? 'Uploading...' : '⬆ Upload Video'}
              </button>
              <button className="btn btn-ghost" onClick={clear} disabled={uploading} style={{ fontSize: 13 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: URL (YouTube + direct) ───────────────────────────────
function UrlTab({ currentUrl, onSelect }) {
  const [url, setUrl] = useState(currentUrl || '');

  const thumbnail = url ? getYouTubeThumbnail(url) : null;
  const isYT      = isYouTubeUrl(url);

  return (
    <div className="vurl-tab">
      <label>YouTube URL, embed URL, or direct video link</label>
      <input
        type="url"
        placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
        value={url}
        onChange={e => setUrl(e.target.value)}
        autoFocus
      />
      <p className="field-hint">Supports YouTube watch links, youtu.be short links, and direct MP4/WebM URLs.</p>

      {url && (
        <div className="vurl-preview">
          {isYT && thumbnail ? (
            <div className="vurl-yt-preview">
              <img src={thumbnail} alt="YouTube thumbnail" />
              <div className="vurl-yt-badge">▶ YouTube</div>
            </div>
          ) : (
            <video src={url} className="vurl-video-preview" controls muted
              onError={e => e.target.style.opacity = '0.3'} />
          )}
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={() => onSelect(url)}
        disabled={!url.trim()}
        style={{ fontSize: 13, alignSelf: 'flex-start' }}
      >
        Use this URL
      </button>
    </div>
  );
}

// ── Tab: Library ─────────────────────────────────────────────
function LibraryTab({ onSelect }) {
  const [videos,   setVideos]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const fetchVideos = () => {
    setLoading(true);
    api.get('/upload/videos')
      .then(r => setVideos(r.data))
      .catch(() => toast.error('Failed to load video library'))
      .finally(() => setLoading(false));
  };
  useEffect(() => { fetchVideos(); }, []);

  const handleDelete = async (e, filename) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${filename}"?`)) return;
    setDeleting(filename);
    try {
      await api.delete(`/upload/video/${filename}`);
      setVideos(prev => prev.filter(v => v.filename !== filename));
      if (selected?.filename === filename) setSelected(null);
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
    setDeleting(null);
  };

  return (
    <div className="vlibrary-tab">
      <div className="vlibrary-toolbar">
        <span className="vlibrary-count">{videos.length} video{videos.length !== 1 ? 's' : ''} uploaded</span>
        <button className="btn btn-ghost" onClick={fetchVideos} style={{ fontSize: 12, padding: '5px 10px' }}>↻ Refresh</button>
      </div>

      {loading ? (
        <div className="vlibrary-empty">Loading library...</div>
      ) : videos.length === 0 ? (
        <div className="vlibrary-empty">No videos uploaded yet. Use the Upload tab to add videos.</div>
      ) : (
        <div className="vlibrary-grid">
          {videos.map(vid => (
            <div
              key={vid.filename}
              className={`vlibrary-item ${selected?.filename === vid.filename ? 'selected' : ''}`}
              onClick={() => setSelected(vid)}
            >
              <video src={vid.url} muted preload="metadata" className="vlibrary-thumb" />
              <div className="vlibrary-overlay">
                <span className="vlibrary-size">{formatBytes(vid.size)}</span>
                <button
                  className="vlibrary-del"
                  onClick={e => handleDelete(e, vid.filename)}
                  disabled={deleting === vid.filename}
                >
                  {deleting === vid.filename ? '...' : '✕'}
                </button>
              </div>
              <div className="vlibrary-play">▶</div>
              {selected?.filename === vid.filename && <div className="vlibrary-check">✓</div>}
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="vlibrary-selection-bar">
          <video src={selected.url} muted className="vselection-thumb" />
          <div className="vselection-info">
            <span className="vselection-name">{selected.filename}</span>
            <span className="vselection-size">{formatBytes(selected.size)}</span>
          </div>
          <button className="btn btn-primary" onClick={() => onSelect(selected.url)} style={{ fontSize: 13 }}>
            Use this video
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main VideoUploader ────────────────────────────────────────
const TABS = [
  { id: 'upload',  label: '⬆ Upload' },
  { id: 'url',     label: '🔗 URL / YouTube' },
  { id: 'library', label: '🗃 Library' },
];

export default function VideoUploader({ currentUrl, onSelect }) {
  const [activeTab, setActiveTab] = useState(currentUrl ? 'url' : 'upload');

  const handleSelect = (url) => {
    onSelect(url);
    toast.success('Video selected');
  };

  return (
    <div className="video-uploader">
      <div className="vuploader-tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`vuploader-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="vuploader-body">
        {activeTab === 'upload'  && <UploadTab  onUploaded={handleSelect} />}
        {activeTab === 'url'     && <UrlTab     currentUrl={currentUrl} onSelect={handleSelect} />}
        {activeTab === 'library' && <LibraryTab onSelect={handleSelect} />}
      </div>
    </div>
  );
}