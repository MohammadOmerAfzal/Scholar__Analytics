import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const EMPTY_FORM = { name: '', slug: '', description: '', order: 0 };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchCats = () => {
    api.get('/categories').then(r => setCategories(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchCats(); }, []);

  const handleNameChange = (name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
    setForm(f => ({ ...f, name, slug }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.description) {
      toast.error('Name, slug, and description are required'); 
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        const { data } = await api.put(`/categories/${editId}`, form);
        setCategories(prev => prev.map(c => c._id === editId ? data : c));
        toast.success('Category updated');
      } else {
        const { data } = await api.post('/categories', form);
        setCategories(prev => [...prev, data]);
        toast.success('Category created');
      }
      setForm(EMPTY_FORM);
      setEditId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
    setSaving(false);
  };

  const startEdit = (cat) => {
    setForm({ name: cat.name, slug: cat.slug, description: cat.description, order: cat.order });
    setEditId(cat._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteCategory = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? This won't delete analyses inside it.`)) return;
    try {
      await api.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success('Category deleted');
    } catch { 
      toast.error('Delete failed'); 
    }
  };

  const seedCategories = async () => {
    try {
      const { data } = await api.post('/admin/seed');
      toast.success(data.message);
      fetchCats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Seed failed');
    }
  };

  return (
    <AdminLayout title="Categories">
      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, alignItems: 'start' }}>

        {/* FORM */}
        <div className="admin-section" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h3 style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 700, color: '#1e2331' }}>
            {editId ? 'Edit Category' : 'New Category'}
          </h3>

          <div className="form-group">
            <label>Name *</label>
            <input 
              value={form.name} 
              onChange={e => handleNameChange(e.target.value)} 
              placeholder="Machine Learning" 
            />
          </div>
          
          <div className="form-group">
            <label>Slug</label>
            <input 
              value={form.slug} 
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }} 
            />
          </div>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea 
              rows={3} 
              value={form.description} 
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What analyses are in this category?" 
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
            <div className="form-group">
              <label>Order (display order)</label>
              <input 
                type="number" 
                value={form.order} 
                onChange={e => setForm(f => ({ ...f, order: Number(e.target.value) }))} 
                min={0} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, paddingTop: 8, borderTop: '1px solid #e4e8ee' }}>
            <button 
              className="btn btn-primary" 
              onClick={handleSubmit} 
              disabled={saving} 
              style={{ flex: 1, justifyContent: 'center' }}
            >
              {saving ? '...' : editId ? 'Update' : 'Create'}
            </button>
            {editId && (
              <button 
                className="btn btn-ghost" 
                onClick={() => { setForm(EMPTY_FORM); setEditId(null); }}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* LIST */}
        <div>
          <div className="admin-section-header" style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: 'Fraunces, Georgia, serif', fontSize: 16, fontWeight: 700, color: '#1e2331' }}>
              Categories ({categories.length})
            </div>
            <button className="btn btn-ghost" style={{ fontSize: 12 }} onClick={seedCategories}>
              ⬇ Seed Defaults
            </button>
          </div>

          {loading ? (
            <p style={{ color: '#8898aa' }}>Loading...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {categories.map(cat => (
                <div key={cat._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
                  {/* Removed icon - using teal badge instead */}
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: 12, 
                    background: '#5cc1d0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontFamily: 'Fraunces, Georgia, serif',
                    fontSize: 20,
                    fontWeight: 700,
                    color: '#1e2331'
                  }}>
                    {cat.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#1e2331' }}>{cat.name}</div>
                    <div style={{ fontSize: 12, color: '#8898aa', fontFamily: 'JetBrains Mono, monospace' }}>{cat.slug}</div>
                    <div style={{ fontSize: 13, color: '#4a5568', marginTop: 4 }}>{cat.description}</div>
                    <div style={{ fontSize: 11, color: '#8898aa', marginTop: 6, fontFamily: 'JetBrains Mono, monospace' }}>
                      {cat.analysisCount ?? 0} analyses · order {cat.order}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button 
                      className="btn btn-ghost" 
                      style={{ padding: '6px 12px', fontSize: 12 }} 
                      onClick={() => startEdit(cat)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '6px 12px', fontSize: 12 }} 
                      onClick={() => deleteCategory(cat._id, cat.name)}
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p style={{ color: '#8898aa', textAlign: 'center', padding: 32 }}>
                  No categories yet. Click "Seed Defaults" to add default categories.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}