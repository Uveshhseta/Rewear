import React, { useState, useEffect } from 'react';
import { BarChart3, PieChart, TrendingUp, Layers, CheckCircle2, Repeat } from 'lucide-react';
import api from '../../api/client';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/api/admin/analytics');
        if (res.data.success) {
          setAnalytics(res.data.analytics);
        }
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const categoryStats = analytics?.categoryStats || [];
  const swapStats = analytics?.swapStatusStats || [];
  const conditionStats = analytics?.conditionStats || [];
  const userGrowth = analytics?.userGrowth || [];

  const maxCategoryCount = Math.max(...categoryStats.map((c) => c.count), 1);
  const maxSwapCount = Math.max(...swapStats.map((s) => s.count), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white">Platform Aggregation Analytics</h1>
        <p className="text-xs text-ivory/60 font-mono mt-1">
          MONGODB PIPELINE INSIGHTS • CIRCULAR FASHION VELOCITY
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 1. Category Volume Breakdown */}
        <div className="bg-charcoal-dark p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-sage">
            <Layers className="w-5 h-5" />
            <h3 className="font-serif text-lg font-bold text-white">Garments by Category</h3>
          </div>

          <div className="space-y-4">
            {categoryStats.length === 0 ? (
              <p className="text-xs text-ivory/50">No category data recorded.</p>
            ) : (
              categoryStats.map((item) => {
                const pct = Math.round((item.count / maxCategoryCount) * 100);
                return (
                  <div key={item._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="capitalize text-white">{item._id?.replace('_', ' ')}</span>
                      <span className="text-sage font-bold">
                        {item.count} items (Avg ₹{Math.round(item.avgValue || 0)})
                      </span>
                    </div>
                    <div className="w-full h-3 bg-charcoal rounded-full overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-forest rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. Swap Conversion Funnel */}
        <div className="bg-charcoal-dark p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-sage">
            <Repeat className="w-5 h-5" />
            <h3 className="font-serif text-lg font-bold text-white">Swap Status Conversion Funnel</h3>
          </div>

          <div className="space-y-4">
            {swapStats.length === 0 ? (
              <p className="text-xs text-ivory/50">No swap transactions recorded yet.</p>
            ) : (
              swapStats.map((item) => {
                const pct = Math.round((item.count / maxSwapCount) * 100);
                return (
                  <div key={item._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="uppercase text-white">{item._id}</span>
                      <span className="text-emerald-400 font-bold">{item.count} Swaps</span>
                    </div>
                    <div className="w-full h-3 bg-charcoal rounded-full overflow-hidden border border-white/10">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          item._id === 'completed'
                            ? 'bg-emerald-500'
                            : item._id === 'accepted'
                            ? 'bg-blue-500'
                            : item._id === 'pending'
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. Condition Distribution */}
        <div className="bg-charcoal-dark p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-sage">
            <PieChart className="w-5 h-5" />
            <h3 className="font-serif text-lg font-bold text-white">Condition Distribution</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {conditionStats.map((c) => (
              <div key={c._id} className="p-4 rounded-2xl bg-charcoal border border-white/10 text-center">
                <span className="text-[10px] font-mono uppercase text-ivory/60 block">
                  {c._id?.replace(/_/g, ' ')}
                </span>
                <span className="font-serif text-3xl font-extrabold text-white mt-1 block">
                  {c.count}
                </span>
                <span className="text-[10px] font-mono text-sage">Garments</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. User Registration Cohorts */}
        <div className="bg-charcoal-dark p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl space-y-6">
          <div className="flex items-center space-x-2 text-sage">
            <TrendingUp className="w-5 h-5" />
            <h3 className="font-serif text-lg font-bold text-white">Member Growth Timeline</h3>
          </div>

          <div className="space-y-3">
            {userGrowth.length === 0 ? (
              <p className="text-xs text-ivory/50">Recent cohort registration active.</p>
            ) : (
              userGrowth.map((g, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-charcoal border border-white/10">
                  <span className="font-mono text-xs text-ivory/80">
                    Cohort {g._id.month}/{g._id.year}
                  </span>
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    +{g.count} Members
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

