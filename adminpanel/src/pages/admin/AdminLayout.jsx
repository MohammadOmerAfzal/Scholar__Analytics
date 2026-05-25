import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const NAV_ITEMS = [
  { path: '/admin', label: 'Dashboard', icon: '⊞' },
  { path: '/admin/analyses', label: 'Main Menu', icon: '📄' },
  { path: '/admin/categories', label: 'Categories', icon: '🗂' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
];

export default function AdminLayout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/" className="admin-logo">
            <span style={{ color: 'var(--accent-green)' }}></span>Scholar Analytics<span style={{ color: 'var(--accent-green)' }}></span>
          </Link>
          <span className="admin-badge">Admin</span>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div>
              <div className="admin-username">{user?.username}</div>
              <div className="admin-role">Administrator</div>
            </div>
          </div>
          <button className="admin-logout" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="admin-main">
        <div className="admin-topbar">
          <h1 className="admin-page-title">{title}</h1>
          {/* <Link to="/" className="btn btn-ghost" style={{ fontSize: '13px' }}>View Site →</Link> */}
        </div>
        <div className="admin-content">
          {children}
        </div>
      </main>
    </div>
  );
}