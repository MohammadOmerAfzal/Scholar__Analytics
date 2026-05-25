// components/LoginPopup.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import '../styles/LoginPopup.css';

export default function LoginPopup({ onClose, visible }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.username}!`);
      onClose();
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
    setLoading(false);
  };

  if (!visible) return null;

  return (
    <div className="login-popup-overlay" onClick={onClose}>
      <div className="login-popup-container" onClick={(e) => e.stopPropagation()}>
        <button className="login-popup-close" onClick={onClose}>
          ✕
        </button>
        
        <div className="login-popup-header">
          <h2>Welcome to Scholar Analytics</h2>
          <p>Sign in to access personalized features</p>
        </div>

        <form onSubmit={handleSubmit} className="login-popup-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="login-popup-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-popup-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" onClick={onClose}>
              Create one
            </Link>
          </p>
          {/* <p className="login-popup-note">
            Login is optional — all analyses are publicly accessible.
          </p> */}
        </div>
      </div>
    </div>
  );
}