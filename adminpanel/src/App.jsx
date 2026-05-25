import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/admin/LoginPage';
import RegisterPage from './pages/admin/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAnalyses from './pages/admin/AdminAnalyses';
import AdminAnalysisEditor from './pages/admin/AdminAnalysisEditor';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCategories from './pages/admin/AdminCategories';

const AdminGuard = ({ children }) => {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
          <Route path="/admin/analyses" element={<AdminGuard><AdminAnalyses /></AdminGuard>} />
          <Route path="/admin/analyses/new" element={<AdminGuard><AdminAnalysisEditor /></AdminGuard>} />
          <Route path="/admin/analyses/:id/edit" element={<AdminGuard><AdminAnalysisEditor /></AdminGuard>} />
          <Route path="/admin/users" element={<AdminGuard><AdminUsers /></AdminGuard>} />
          <Route path="/admin/categories" element={<AdminGuard><AdminCategories /></AdminGuard>} />
        </Routes>

        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          theme="dark"
          toastStyle={{ background: '#181c27', border: '1px solid #222840' }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;