import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import api from '../../api/client';

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Selected report resolution modal
  const [activeReport, setActiveReport] = useState(null);
  const [newStatus, setNewStatus] = useState('resolved');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionOnListing, setActionOnListing] = useState('none');
  const [submitting, setSubmitting] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let url = '/api/reports';
      if (status !== 'all') url += `?status=${status}`;

      const res = await api.get(url);
      if (res.data.success) {
        setReports(res.data.reports);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [status]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!activeReport) return;
    setSubmitting(true);

    try {
      const res = await api.put(`/api/reports/${activeReport._id}`, {
        status: newStatus,
        adminNotes,
        actionOnListing: actionOnListing !== 'none' ? actionOnListing : undefined,
      });

      if (res.data.success) {
        setActiveReport(null);
        fetchReports();
      }
    } catch (err) {
      alert('Failed to update report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Reports & Dispute Resolution</h1>
          <p className="text-xs text-ivory/60 font-mono mt-1">
            {total} RECORDED ALERTS ACROSS COMMUNITY
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-ivory/60">Status:</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-xs bg-charcoal border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      <div className="bg-charcoal-dark rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal border-b border-white/10 font-mono text-ivory/60 uppercase text-[11px]">
              <tr>
                <th className="p-4">Reporter</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Details</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ivory/50">
                    Loading reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-ivory/50">
                    No reports filed under this category.
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono text-white">{r.reporter?.name}</td>
                    <td className="p-4">
                      {r.reportedListing ? (
                        <span className="text-sage font-medium block truncate max-w-xs">
                          Item: {r.reportedListing.title}
                        </span>
                      ) : r.reportedUser ? (
                        <span className="text-earth font-medium block">User: {r.reportedUser.name}</span>
                      ) : (
                        <span className="text-ivory/50">General Dispute</span>
                      )}
                    </td>
                    <td className="p-4 font-mono text-amber-300">
                      {r.reason?.replace('_', ' ')}
                    </td>
                    <td className="p-4 text-ivory/70 max-w-xs truncate">{r.description}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                          r.status === 'resolved'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                            : r.status === 'pending'
                            ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                            : 'bg-white/10 text-ivory/70'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setActiveReport(r);
                          setNewStatus(r.status === 'pending' ? 'resolved' : r.status);
                          setAdminNotes(r.adminNotes || '');
                        }}
                        className="px-3 py-1 bg-forest hover:bg-forest-light text-white rounded font-mono text-xs font-bold"
                      >
                        Review & Resolve
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolution Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-charcoal border border-white/20 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-ivory">
            <h3 className="font-serif text-xl font-bold text-white mb-2">Resolve Dispute / Report</h3>
            <p className="text-xs font-mono text-amber-300 mb-4">Reason: {activeReport.reason}</p>

            <div className="p-3 rounded-xl bg-charcoal-dark border border-white/10 text-xs text-ivory/80 mb-4">
              <strong className="block text-white mb-1">User Statement:</strong>
              "{activeReport.description}"
            </div>

            <form onSubmit={handleResolve} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-ivory/80 mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-charcoal-dark border border-white/20 rounded-xl p-2.5 text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="investigating">Investigating</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              {activeReport.reportedListing && (
                <div>
                  <label className="block text-ivory/80 mb-1">Automated Action on Reported Garment</label>
                  <select
                    value={actionOnListing}
                    onChange={(e) => setActionOnListing(e.target.value)}
                    className="w-full bg-charcoal-dark border border-white/20 rounded-xl p-2.5 text-white"
                  >
                    <option value="none">No action on listing</option>
                    <option value="remove">Remove listing from marketplace (Hide)</option>
                    <option value="approve">Approve listing (Clear flag)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-ivory/80 mb-1">Administrative Resolution Notes</label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record resolution rationale for audit log..."
                  className="w-full bg-charcoal-dark border border-white/20 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="px-4 py-2 border border-white/20 rounded-full text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-forest text-white rounded-full font-bold hover:bg-forest-light"
                >
                  Save Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

