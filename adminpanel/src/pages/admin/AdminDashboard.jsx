import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import './AdminLayout.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {loading ? (
        <p style={{ color: 'var(--text-muted)' }}>Loading stats...</p>
      ) : (
        <>
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <div className="admin-stat-num" style={{ color: 'var(--accent-green)' }}>{stats?.totalAnalyses}</div>
              <div className="admin-stat-label">Total Analyses</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-num" style={{ color: 'var(--accent-blue)' }}>{stats?.publishedAnalyses}</div>
              <div className="admin-stat-label">Published</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-num" style={{ color: 'var(--accent-purple)' }}>{stats?.totalUsers}</div>
              <div className="admin-stat-label">Users</div>
            </div>
            <div className="admin-stat-card">
              <div className="admin-stat-num" style={{ color: 'var(--accent-amber)' }}>{stats?.totalCategories}</div>
              <div className="admin-stat-label">Categories</div>
            </div>
          </div>

          <div className="admin-section">
            <div className="admin-section-header">
              <h2 className="admin-section-title">Top Analyses by Views</h2>
              <Link to="/admin/analyses" className="btn btn-ghost" style={{ fontSize: '12px', padding: '6px 12px' }}>View all</Link>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Views</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats?.topAnalyses?.map(a => (
                  <tr key={a._id}>
                    <td style={{ fontWeight: 500 }}>{a.title}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{a.category?.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>{a.views.toLocaleString()}</td>
                    <td>
                      <Link to={`/analysis/${a.slug}`} style={{ color: 'var(--text-muted)', fontSize: '12px' }}>View →</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Link to="/admin/analyses/new" className="btn btn-primary" style={{ justifyContent: 'center', padding: 16, fontSize: 15 }}>
              + New Analysis
            </Link>
            <Link to="/admin/categories" className="btn btn-ghost" style={{ justifyContent: 'center', padding: 16, fontSize: 15 }}>
              Manage Categories
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  );
}