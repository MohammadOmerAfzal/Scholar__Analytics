import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AnalysisCard from '../components/AnalysisCard';
import api from '../utils/api';
import '../styles/CategoryPage.css';

const DIFFICULTY_OPTIONS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('All');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    setLoading(true);
    api.get(`/analyses/by-category/${slug}`)
      .then(({ data }) => {
        setCategory(data.category);
        setAnalyses(data.analyses);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const filtered = analyses
    .filter(a => difficulty === 'All' || a.difficulty === difficulty)
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sort === 'popular') return b.views - a.views;
      return a.title.localeCompare(b.title);
    });

  // Loading skeleton
  if (loading) {
    return (
      <div className="cat-page">
        <div className="cat-skeleton">
          <div className="cat-skeleton-hero">
            <div className="container">
              <div className="skeleton-back-link" />
              <div className="skeleton-title" />
              <div className="skeleton-desc" />
              <div className="skeleton-stats" />
            </div>
          </div>
          <div className="container">
            <div className="skeleton-filters" />
            <div className="grid-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="cat-page">
        <div className="container cat-not-found">
          <h2>Category not found</h2>
          <p>The category you're looking for doesn't exist or has been moved.</p>
          <Link to="/" className="btn btn-primary">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cat-page">
      {/* CATEGORY HEADER */}
      <div className="cat-page-hero">
        <div className="container">
          <Link to="/" className="cat-back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            All Categories
          </Link>
          <h1 className="cat-page-title">{category.name}</h1>
          <p className="cat-page-desc">{category.description}</p>
          {/* <div className="cat-page-stats"> */}
            {/* <div className="cat-stat">
              <span className="cat-stat-num">{analyses.length}</span>
              <span className="cat-stat-label">Analyses</span>
            </div> */}
            {/* <div className="cat-stat"> */}
              {/* <span className="cat-stat-num">
                {analyses.reduce((s, a) => s + a.views, 0).toLocaleString()}
              </span>
              <span className="cat-stat-label">Total Views</span> */}
            {/* </div> */}
          {/* </div> */}
        </div>
      </div>

      {/* FILTERS + LIST */}
      <div className="container cat-page-body">
        <div className="cat-filters">
          <div className="filter-group">
            <span className="filter-label">Difficulty</span>
            <div className="filter-buttons">
              {DIFFICULTY_OPTIONS.map(d => (
                <button
                  key={d}
                  className={`filter-btn ${difficulty === d ? 'active' : ''}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <span className="filter-label">Sort by</span>
            <select 
              value={sort} 
              onChange={e => setSort(e.target.value)} 
              className="cat-select"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Viewed</option>
              <option value="az">A → Z</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="cat-empty">
            <h3>No analyses found</h3>
            <p>Try adjusting your filters or check back later for new content.</p>
            <button 
              className="btn btn-ghost" 
              onClick={() => setDifficulty('All')}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="cat-results-count">
              Showing {filtered.length} {filtered.length === 1 ? 'analysis' : 'analyses'}
            </div>
            <div className="grid-3">
              {filtered.map(a => <AnalysisCard key={a._id} analysis={a} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}