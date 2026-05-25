import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AnalysisCard.css';

const DIFFICULTY_COLOR = {
  Beginner: 'var(--accent-green)',
  Intermediate: 'var(--accent-amber)',
  Advanced: 'var(--accent-red)'
};

const DIFFICULTY_BG = {
  Beginner: 'rgba(92, 193, 208, 0.12)',
  Intermediate: 'rgba(245, 158, 11, 0.12)',
  Advanced: 'rgba(239, 68, 68, 0.12)'
};

export default function AnalysisCard({ analysis }) {
  const { title, summary, slug, category, tags = [], difficulty, views, createdAt } = analysis;

  return (
    <Link to={`/analysis/${slug}`} className="analysis-card">
      <div className="analysis-card-top">
        {category && (
          <span className="analysis-cat-badge">
            {category.name}
          </span>
        )}
        <span 
          className="analysis-difficulty" 
          style={{ 
            color: DIFFICULTY_COLOR[difficulty],
            background: DIFFICULTY_BG[difficulty]
          }}
        >
          {difficulty}
        </span>
      </div>

      <h3 className="analysis-card-title">{title}</h3>
      <p className="analysis-card-summary">{summary}</p>

      <div className="analysis-card-footer">
        <div className="analysis-tags">
          {tags.slice(0, 3).map(tag => (
            <span key={tag} className="analysis-tag">#{tag}</span>
          ))}
        </div>
        <div className="analysis-meta">
          {/* <span>👁 {views.toLocaleString()}</span> */}
          <span>{new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </Link>
  );
}