import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, Repeat, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../../api/client';

export const AdminSwaps = () => {
  const [swaps, setSwaps] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchSwaps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status !== 'all') params.append('status', status);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/api/admin/swaps?${params.toString()}`);
      if (res.data.success) {
        setSwaps(res.data.swaps);
        setTotal(res.data.total);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [status, page]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Swap Transaction Audit Trail</h1>
          <p className="text-xs text-ivory/60 font-mono mt-1">
            {total} MONITORED CASHLESS WARDROBE EXCHANGES
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-ivory/60">Status Filter:</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-charcoal border border-white/15 rounded-xl px-3 py-2 text-white font-mono"
          >
            <option value="all">All Transactions</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted / In-Flight</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-charcoal-dark rounded-3xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-charcoal border-b border-white/10 font-mono text-ivory/60 uppercase text-[11px]">
              <tr>
                <th className="p-4">Swap Parties</th>
                <th className="p-4">Target Piece</th>
                <th className="p-4">Offered Piece</th>
                <th className="p-4">Value Parity</th>
                <th className="p-4">Method</th>
                <th className="p-4">Status</th>
                <th className="p-4">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ivory/50">
                    Loading swap transactions...
                  </td>
                </tr>
              ) : swaps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ivory/50">
                    No transactions recorded under this status.
                  </td>
                </tr>
              ) : (
                swaps.map((s) => (
                  <tr key={s._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white block">Req: {s.requester?.name}</span>
                        <span className="text-[11px] font-mono text-ivory/50">To: {s.recipient?.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium block max-w-xs truncate">{s.requestedListing?.title}</span>
                      <span className="text-[11px] font-mono text-sage">₹{s.recipientItemValue}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-white font-medium block max-w-xs truncate">{s.offeredListing?.title}</span>
                      <span className="text-[11px] font-mono text-sage">₹{s.requesterItemValue}</span>
                    </td>
                    <td className="p-4 font-mono text-ivory/70">
                      <span>Diff: ₹{s.valueDifference}</span>
                      <span className="block text-[10px] uppercase text-emerald-400">{s.fairnessMatch}</span>
                    </td>
                    <td className="p-4 font-mono uppercase text-ivory/70">
                      {s.exchangeMethod === 'in_person' ? 'In-Person' : 'Courier'}
                    </td>
                    <td className="p-4 font-mono">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${
                          s.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                            : s.status === 'accepted'
                            ? 'bg-blue-950 text-blue-300 border border-blue-500/30'
                            : s.status === 'pending'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                            : 'bg-red-950 text-red-300 border border-red-500/30'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-ivory/50 text-[11px]">
                      {new Date(s.updatedAt).toLocaleDateString()}
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

