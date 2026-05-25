import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ContentBlock from '../components/ContentBlock';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { toast } from 'react-toastify';
import '../styles/AnalysisPage.css';

const DIFFICULTY_COLOR = {
  Beginner: '#22c55e',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
};

const DIFFICULTY_BG = {
  Beginner: 'rgba(34,197,94,0.12)',
  Intermediate: 'rgba(245,158,11,0.12)',
  Advanced: 'rgba(239,68,68,0.12)',
};

const BLOCK_ICON = {
  text: '¶',
  code: '{}',
  image: '◻',
  video: '▶',
  table: '⊟',
};

const BLOCK_LABEL = {
  text: 'Text',
  code: 'Code',
  image: 'Image',
  video: 'Video',
  table: 'Table',
};

function estimateReadTime(blocks = []) {
  const words = blocks
    .filter(b => b.type === 'text')
    .map(b => (b.textContent || '').split(/\s+/).length)
    .reduce((a, b) => a + b, 0);

  return Math.max(1, Math.ceil(words / 200));
}

function SkeletonLoader() {
  return (
    <div className="analysis-page">
      <div className="ap-skeleton-screen">
        <div className="ap-skel ap-title-skel" />
        <div className="ap-skel ap-line" />
        <div className="ap-skel ap-line" />
        <div className="ap-skel ap-line short" />
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  const { slug } = useParams();
  const { user, refreshUser } = useAuth();

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);
  const [readProgress, setReadProgress] = useState(0);
  const [activeBlock, setActiveBlock] = useState(0);

  /* ── FETCH ANALYSIS ── */
  useEffect(() => {
    const controller = new AbortController();

    // 🔥 reset state on slug change
    setAnalysis(null);
    setLoading(true);
    setActiveBlock(0);
    setReadProgress(0);

    const fetchAnalysis = async () => {
      try {
        const { data } = await api.get(`/analyses/${slug}`, {
          signal: controller.signal,
        });
        setAnalysis(data);
      } catch (err) {
        if (err.name !== 'CanceledError') {
          console.error('Fetch error:', err);
          setAnalysis(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();

    return () => controller.abort();
  }, [slug]);

  /* ── BOOKMARK SYNC ── */
  useEffect(() => {
    if (analysis && user) {
      setBookmarked(user.bookmarks?.includes(analysis._id) || false);
    }
  }, [analysis, user]);

  /* ── SCROLL RESET ── */
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  /* ── SCROLL PROGRESS ── */
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const top = el.scrollTop || document.body.scrollTop;
      const height = el.scrollHeight - el.clientHeight;

      setReadProgress(height ? (top / height) * 100 : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ── BOOKMARK ACTION ── */
  const handleBookmark = async () => {
    if (!user) {
      toast.info('Please login first');
      return;
    }

    try {
      const { data } = await api.post(`/auth/bookmark/${analysis._id}`);
      setBookmarked(data.bookmarked);
      await refreshUser();
      toast.success(data.bookmarked ? 'Saved!' : 'Removed');
    } catch {
      toast.error('Error updating bookmark');
    }
  };

  /* ── LOADING ── */
  if (loading) return <SkeletonLoader />;

  if (!analysis) {
    return (
      <div className="analysis-page">
        <div className="ap-not-found">
          <h2>Analysis not found</h2>
          <p>The analysis you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn btn-primary">← Back to Home</Link>
        </div>
      </div>
    );
  }

  const sortedBlocks = [...(analysis.contentBlocks || [])].sort(
    (a, b) => a.order - b.order
  );

  const readTime = estimateReadTime(sortedBlocks);

  return (
    <div className="analysis-page">

      {/* Progress Bar */}
      <div
        className="ap-progress-bar"
        style={{ '--progress': `${readProgress}%` }}
      />

      {/* Breadcrumb */}
      <div className="ap-breadcrumb-bar">
        <div className="ap-breadcrumb">
          <Link to="/">Home</Link>

          {analysis.category && (
            <>
              <span className="ap-breadcrumb-sep">›</span>
              <Link to={`/category/${analysis.category.slug}`}>
                {analysis.category.name}
              </Link>
            </>
          )}

          <span className="ap-breadcrumb-sep">›</span>
          <span>{analysis.title}</span>
        </div>
      </div>

      <div className="ap-article-layout">

        {/* ARTICLE */}
        <article className="ap-article">

          <header className="ap-header">

            {analysis.category && (
              <Link 
                to={`/category/${analysis.category.slug}`} 
                className="ap-cat-badge"
              >
                {analysis.category.name}
              </Link>
            )}

            {analysis.difficulty && (
              <span
                className="ap-diff-badge"
                style={{
                  color: DIFFICULTY_COLOR[analysis.difficulty],
                  background: DIFFICULTY_BG[analysis.difficulty],
                }}
              >
                {analysis.difficulty}
              </span>
            )}

            <h1 className="ap-title">{analysis.title}</h1>

            <p className="ap-summary">{analysis.summary}</p>

            <div className="ap-meta">
              <span>
                Last Updated: {new Date(analysis.createdAt).toLocaleDateString()}
              </span>
              <span> · {readTime} min read</span>
              <span> · {analysis.views || 0} views</span>
            </div>

            <div className="ap-tags">
              {analysis.tags?.map(t => (
                <Link key={t} to={`/tag/${t}`} className="ap-tag">
                  #{t}
                </Link>
              ))}
            </div>

            {/* <button
              className={`ap-bookmark-btn ${bookmarked ? 'active' : ''}`}
              onClick={handleBookmark}
            >
              🔖 {bookmarked ? 'Saved' : 'Save'}
            </button> */}

            <hr />
          </header>

          {/* CONTENT */}
          <div className="ap-content">
            {sortedBlocks.map((block, i) => (
              <div key={i} id={`block-${i}`} className="ap-block">
                {block.type !== 'text' && (
                  <div className="ap-block-label">
                    {BLOCK_ICON[block.type]} {BLOCK_LABEL[block.type]}
                  </div>
                )}
                <ContentBlock block={block} />
              </div>
            ))}
          </div>

        </article>

        {/* TOC */}
        <aside className="ap-toc">
          <div className="ap-toc-title">Table of Contents</div>

          {sortedBlocks.map((block, i) => (
            <a
              key={i}
              href={`#block-${i}`}
              className={`ap-toc-item ${activeBlock === i ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                setActiveBlock(i);
                document.getElementById(`block-${i}`)?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              {BLOCK_ICON[block.type]} Section {i + 1}
            </a>
          ))}
        </aside>

      </div>
    </div>
  );
}