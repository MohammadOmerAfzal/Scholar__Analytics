import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const fetchUsers = () => {
    api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role to "${newRole}"?`)) return;
    try {
      const { data } = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? data : u));
      toast.success(`Role updated to ${newRole}`);
    } catch { toast.error('Failed to update role'); }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Delete user "${username}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <AdminLayout title="Users">
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">All Users ({users.length})</h2>
          <div style={{ fontSize: '12px', color: '#8898aa', fontFamily: 'JetBrains Mono, monospace' }}>
            {users.filter(u => u.role === 'admin').length} admin · {users.filter(u => u.role === 'user').length} user
          </div>
        </div>

        {loading ? (
          <p style={{ padding: 24, color: '#8898aa' }}>Loading users...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Bookmarks</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #5cc1d0, #1e2331)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 13, fontWeight: 700, color: '#ffffff'
                      }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#1e2331' }}>{u.username}</div>
                        {u._id === currentUser?.id && (
                          <div style={{ fontSize: 11, color: '#5cc1d0', fontFamily: 'JetBrains Mono, monospace' }}>You</div>
                        )}
                      </div>
                    </div>
                   </td>
                  <td style={{ color: '#4a5568', fontSize: 13 }}>{u.email}</td>
                  <td>
                    <span style={{
                      padding: '3px 10px', borderRadius: 12, fontSize: 11,
                      fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                      background: u.role === 'admin' ? 'rgba(92, 193, 208, 0.12)' : 'rgba(100, 100, 100, 0.1)',
                      color: u.role === 'admin' ? '#5cc1d0' : '#8898aa'
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#4a5568' }}>
                    {u.bookmarks?.length ?? 0}
                  </td>
                  <td style={{ fontSize: 12, color: '#8898aa' }}>
                    {new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td>
                    {u._id !== currentUser?.id ? (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => toggleRole(u._id, u.role)}
                        >
                          {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                        </button>
                        <button
                          className="btn btn-danger"
                          style={{ padding: '5px 10px', fontSize: 12 }}
                          onClick={() => deleteUser(u._id, u.username)}
                        >
                          Delete
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#8898aa' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}