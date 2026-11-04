import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, Shield, AlertCircle } from 'lucide-react';
import api from '../../api/client';

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== 'all') params.append('status', status);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/api/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [status, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const action = user.status === 'active' ? 'suspend' : 'reactivate';
    if (!window.confirm(`Are you sure you want to ${action} ${user.name}?`)) return;

    try {
      const res = await api.put(`/api/admin/users/${user._id}/status`);
      if (res.data.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, status: res.data.user.status } : u))
        );
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">User Directory & Governance</h1>
          <p className="text-xs text-ivory/60 font-mono mt-1">
            {total} REGISTERED PARTICIPANTS IN CIRCULAR ECONOMY
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-charcoal-dark p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or city..."
            className="w-full text-xs bg-charcoal border border-white/15 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-sage font-mono"
          />
          <Search className="w-4 h-4 text-ivory/40 absolute left-3 top-3" />
        </form>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <span className="text-xs font-mono text-ivory/60">Status:</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-charcoal border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
          >
            <option value="all">All Accounts</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Responsive Table */}
      <div className="bg-charcoal-dark rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal border-b border-white/10 font-mono text-ivory/60 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">City</th>
                <th className="p-4">Registered</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ivory/50">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ivory/50">
                    No users match your criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border border-white/15"
                        />
                        <div>
                          <span className="font-bold text-white block">{u.name}</span>
                          <span className="text-[11px] font-mono text-ivory/50">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-amber-950 text-amber-300 border border-amber-600/40'
                            : 'bg-white/10 text-ivory/80'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-ivory/80">{u.city}</td>
                    <td className="p-4 font-mono text-ivory/60">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                          u.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : 'bg-red-950 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-colors ${
                            u.status === 'active'
                              ? 'bg-red-950 hover:bg-red-900 text-red-300 border border-red-700/50'
                              : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/50'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend Account' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

