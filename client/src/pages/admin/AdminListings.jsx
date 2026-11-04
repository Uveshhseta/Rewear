import React, { useState, useEffect } from 'react';
import { Search, Package, Check, AlertTriangle, EyeOff, Eye } from 'lucide-react';
import api from '../../api/client';

export const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [category, setCategory] = useState('all');
  const [moderationStatus, setModerationStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category !== 'all') params.append('category', category);
      if (moderationStatus !== 'all') params.append('moderationStatus', moderationStatus);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/api/admin/listings?${params.toString()}`);
      if (res.data.success) {
        setListings(res.data.listings);
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
    fetchListings();
  }, [category, moderationStatus, page]);

  const handleModerate = async (listingId, status) => {
    const reason = status === 'removed' ? prompt('Enter reason for removing listing:') : '';
    if (status === 'removed' && reason === null) return;

    try {
      const res = await api.put(`/api/admin/listings/${listingId}/moderate`, {
        moderationStatus: status,
        reason: reason || '',
      });
      if (res.data.success) {
        setListings((prev) =>
          prev.map((l) => (l._id === listingId ? { ...l, moderationStatus: status } : l))
        );
      }
    } catch (err) {
      alert('Failed to update listing moderation.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Garment Listing Moderation</h1>
          <p className="text-xs text-ivory/60 font-mono mt-1">
            {total} REGISTERED TEXTILE PIECES IN SYSTEM
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-charcoal-dark p-4 rounded-2xl border border-white/10 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-ivory/60">Category:</span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-charcoal border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
          >
            <option value="all">All Categories</option>
            <option value="women">Women</option>
            <option value="men">Men</option>
            <option value="ethnic_wear">Ethnic Wear</option>
            <option value="shoes">Shoes</option>
            <option value="accessories">Accessories</option>
          </select>

          <span className="text-xs font-mono text-ivory/60">Moderation:</span>
          <select
            value={moderationStatus}
            onChange={(e) => {
              setModerationStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-charcoal border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-charcoal-dark rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal border-b border-white/10 font-mono text-ivory/60 uppercase text-[11px]">
              <tr>
                <th className="p-4">Garment</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Category</th>
                <th className="p-4">Swap Value</th>
                <th className="p-4">Status</th>
                <th className="p-4">Moderation</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ivory/50">
                    Loading listings...
                  </td>
                </tr>
              ) : listings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ivory/50">
                    No listings found.
                  </td>
                </tr>
              ) : (
                listings.map((l) => (
                  <tr key={l._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={l.images?.[0]}
                          alt={l.title}
                          className="w-10 h-12 rounded-lg object-cover"
                        />
                        <div>
                          <span className="font-bold text-white block max-w-xs truncate">{l.title}</span>
                          <span className="text-[11px] font-mono text-sage">{l.brand} • Size {l.size}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-ivory/80">{l.owner?.name}</td>
                    <td className="p-4 font-mono uppercase text-ivory/70">{l.category}</td>
                    <td className="p-4 font-mono font-bold text-sage">
                      ₹{l.estimatedSwapValue?.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 font-mono uppercase text-[11px] text-ivory/70">{l.status}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          l.moderationStatus === 'approved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : l.moderationStatus === 'flagged'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-red-950 text-red-400 border border-red-500/30'
                        }`}
                      >
                        {l.moderationStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {l.moderationStatus !== 'approved' && (
                        <button
                          onClick={() => handleModerate(l._id, 'approved')}
                          className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded font-mono text-xs"
                          title="Approve"
                        >
                          Approve
                        </button>
                      )}
                      {l.moderationStatus !== 'removed' && (
                        <button
                          onClick={() => handleModerate(l._id, 'removed')}
                          className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 rounded font-mono text-xs"
                          title="Remove listing"
                        >
                          Remove
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

