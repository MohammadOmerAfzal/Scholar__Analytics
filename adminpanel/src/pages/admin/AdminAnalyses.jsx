import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminAnalyses() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        admin: '1' // Get all analyses (published + drafts)
      });
      
      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }
      
      const { data } = await api.get(`/analyses?${params.toString()}`);
      setAnalyses(data.analyses || []);
      setTotalPages(data.pages || 1);
      setTotalAnalyses(data.total || 0);
    } catch (err) {
      toast.error('Failed to load analyses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, [currentPage, debouncedSearch]);

  const togglePublish = async (id) => {
    try {
      const { data } = await api.patch(`/analyses/${id}/publish`);
      setAnalyses(prev => prev.map(a => a._id === id ? { ...a, published: data.published } : a));
      toast.success(data.published ? 'Published' : 'Unpublished');
    } catch { 
      toast.error('Failed to update'); 
    }
  };

  const deleteAnalysis = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      await api.delete(`/analyses/${id}`);
      fetchAnalyses(); // Refresh the list
      toast.success('Deleted');
    } catch { 
      toast.error('Failed to delete'); 
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AdminLayout title="Analyses">
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">
            All Analysis ({totalAnalyses})
          </h2>
          <Link to="/admin/analyses/new" className="btn btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
            + New Analysis
          </Link>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 22px', borderBottom: '1px solid #e4e8ee', background: '#f7f8fa' }}>
          <input
            type="text"
            placeholder="Search by title, slug, or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #e4e8ee',
              fontSize: '13px',
              fontFamily: 'DM Sans, system-ui, sans-serif',
              background: '#ffffff'
            }}
          />
        </div>

        {loading ? (
          <p style={{ padding: 24, color: '#8898aa' }}>Loading...</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ minWidth: '800px' }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Blocks</th>
                    <th>Views</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#8898aa' }}>
                        No analyses found
                      </td>
                    </tr>
                  ) : (
                    analyses.map(a => (
                      <tr key={a._id}>
                        <td style={{ fontWeight: 500, maxWidth: 240 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#8898aa', fontFamily: 'JetBrains Mono, monospace', marginTop: 2 }}>
                            {a.slug}
                          </div>
                        </td>
                        <td>
                          {a.category && (
                            <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#5cc1d0' }}>
                              {a.category.name}
                            </span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: '#8898aa' }}>{a.difficulty}</td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', color: '#4a5568' }}>
                          {a.contentBlocks?.length ?? '—'}
                        </td>
                        <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#5cc1d0', fontSize: '13px' }}>
                          {a.views}
                        </td>
                        <td>
                          <button
                            onClick={() => togglePublish(a._id)}
                            style={{
                              padding: '3px 10px', borderRadius: '12px', fontSize: '11px', cursor: 'pointer',
                              border: 'none', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                              background: a.published ? 'rgba(92, 193, 208, 0.12)' : 'rgba(100, 100, 100, 0.1)',
                              color: a.published ? '#5cc1d0' : '#8898aa'
                            }}
                          >
                            {a.published ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <Link to={`/admin/analyses/${a._id}/edit`} className="btn btn-ghost" style={{ padding: '5px 12px', fontSize: '12px' }}>
                              Edit
                            </Link>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '5px 12px', fontSize: '12px' }}
                              onClick={() => deleteAnalysis(a._id, a.title)}
                            >
                              Del
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                padding: '20px',
                borderTop: '1px solid #e4e8ee',
                background: '#f7f8fa'
              }}>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-ghost"
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    opacity: currentPage === 1 ? 0.5 : 1,
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Previous
                </button>
                
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Show first, last, current, and neighbors
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      Math.abs(pageNum - currentPage) <= 1
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: currentPage === pageNum ? '1px solid #5cc1d0' : '1px solid #e4e8ee',
                            background: currentPage === pageNum ? '#5cc1d0' : '#ffffff',
                            color: currentPage === pageNum ? '#ffffff' : '#4a5568',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: currentPage === pageNum ? 600 : 400
                          }}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (
                      (pageNum === currentPage - 2 && currentPage > 3) ||
                      (pageNum === currentPage + 2 && currentPage < totalPages - 2)
                    ) {
                      return <span key={pageNum} style={{ padding: '0 4px', color: '#8898aa' }}>...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-ghost"
                  style={{
                    padding: '6px 12px',
                    fontSize: '13px',
                    opacity: currentPage === totalPages ? 0.5 : 1,
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}