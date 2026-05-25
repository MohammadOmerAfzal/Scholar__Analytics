import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import AnalysisPage from './pages/AnalysisPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import Navbar from './components/Navbar';
import api from './utils/api';
import ContactForm from './components/ContactForm';
import CertificationsComingSoon from './pages/Certificates';

const AdminGuard = ({ children }) => {
  const { user, isAdmin } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return children;
};

function AppLayout() {
  const location = useLocation();
  
  // ── GLOBAL SEARCH STATE ──
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  // ── SEARCH HANDLER ──
  const handleSearch = async (query) => {
    if (!query || !query.trim()) {
      setSearchResults(null);
      return;
    }

    setSearching(true);

    try {
      const { data } = await api.get(
        `/analyses?search=${encodeURIComponent(query)}&limit=12`
      );

      setSearchResults(data.analyses || []);
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    }

    setSearching(false);
  };

  // Check if current route is login or register
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <>
      {/* Only show Navbar if not on login or register page */}
      {!isAuthPage && (
        <Navbar
          search={search}
          setSearch={setSearch}
          handleSearch={handleSearch}
          searching={searching}
        />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              searchResults={searchResults}
              setSearchResults={setSearchResults}
            />
          }
        />

        <Route path="/category/:slug" element={<CategoryPage />} />
        <Route path="/analysis/:slug" element={<AnalysisPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/get-analysis" element={<ContactForm />}></Route>
        <Route path="/trainings" element={<ContactForm />}></Route>
        <Route path="/certifications" element={<CertificationsComingSoon />} />
      </Routes>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{
          background: '#181c27',
          border: '1px solid #222840',
        }}
      />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;