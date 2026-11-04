import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  Repeat,
  AlertTriangle,
  Leaf,
  Droplets,
  Wind,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import api from '../../api/client';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await api.get('/api/admin/metrics');
        if (res.data.success) {
          setMetrics(res.data.metrics);
        }
      } catch (err) {
        setError('Failed to fetch platform metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Platform Governance Overview</h1>
          <p className="text-xs text-ivory/60 mt-1 font-mono">
            LIVE DATABASE AGGREGATION • REWEAR CLUSTER 2026
          </p>
        </div>

        <Link
          to="/admin/analytics"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-forest border border-sage/30 text-xs font-semibold text-white hover:bg-forest-light transition-all"
        >
          <span>Detailed Aggregation Analytics</span>
          <ArrowRight className="w-4 h-4 text-sage" />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950 border border-red-500 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* Core Operational Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Users */}
        <div className="bg-charcoal-dark p-6 rounded-3xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-ivory/60 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Registered Users</span>
            <Users className="w-5 h-5 text-sage" />
          </div>
          <span className="font-serif text-4xl font-extrabold text-white block">
            {metrics?.totalUsers ?? 0}
          </span>
          <span className="text-[11px] font-mono text-emerald-400 mt-2 block">
            {metrics?.activeUsers ?? 0} Active accounts
          </span>
        </div>

        {/* Total Listings */}
        <div className="bg-charcoal-dark p-6 rounded-3xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-ivory/60 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Garments Listed</span>
            <Package className="w-5 h-5 text-sage" />
          </div>
          <span className="font-serif text-4xl font-extrabold text-white block">
            {metrics?.totalListings ?? 0}
          </span>
          <span className="text-[11px] font-mono text-sage mt-2 block">
            {metrics?.availableListings ?? 0} Available for swap
          </span>
        </div>

        {/* Swap Transactions */}
        <div className="bg-charcoal-dark p-6 rounded-3xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-ivory/60 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Swaps Conducted</span>
            <Repeat className="w-5 h-5 text-sage" />
          </div>
          <span className="font-serif text-4xl font-extrabold text-white block">
            {metrics?.completedSwaps ?? 0}
          </span>
          <span className="text-[11px] font-mono text-amber-400 mt-2 block">
            {metrics?.pendingSwaps ?? 0} Pending • {metrics?.acceptedSwaps ?? 0} In flight
          </span>
        </div>

        {/* Community Reports */}
        <div className="bg-charcoal-dark p-6 rounded-3xl border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-ivory/60 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Open Reports</span>
            <AlertTriangle className="w-5 h-5 text-earth" />
          </div>
          <span className="font-serif text-4xl font-extrabold text-white block">
            {metrics?.openReports ?? 0}
          </span>
          <span className="text-[11px] font-mono text-ivory/50 mt-2 block">
            Awaiting moderator review
          </span>
        </div>

      </div>

      {/* Circular Environmental Impact Calculations */}
      <div className="bg-gradient-to-br from-forest-dark to-forest p-8 rounded-3xl border border-sage/30 shadow-2xl">
        <div className="flex items-center space-x-2 text-sage mb-2">
          <Leaf className="w-5 h-5" />
          <span className="text-xs font-mono uppercase tracking-widest font-bold">
            Aggregated Circular Footprint Saved
          </span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-white mb-6">
          Real-World Textile Waste Prevention Impact
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
            <Droplets className="w-6 h-6 text-cyan-300 mb-2" />
            <span className="font-serif text-3xl font-extrabold text-white block">
              {(metrics?.environmentalImpact?.waterSavedLitres ?? 0).toLocaleString()} L
            </span>
            <span className="text-xs text-ivory/80 mt-1 block">
              Clean Water Saved in Textile Manufacturing
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
            <Wind className="w-6 h-6 text-emerald-300 mb-2" />
            <span className="font-serif text-3xl font-extrabold text-white block">
              {(metrics?.environmentalImpact?.co2SavedKg ?? 0).toLocaleString()} kg
            </span>
            <span className="text-xs text-ivory/80 mt-1 block">
              Carbon Emissions Averted
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
            <Package className="w-6 h-6 text-sage mb-2" />
            <span className="font-serif text-3xl font-extrabold text-white block">
              {metrics?.environmentalImpact?.itemsRecirculated ?? 0} Pieces
            </span>
            <span className="text-xs text-ivory/80 mt-1 block">
              Garments Kept Out of Landfills
            </span>
          </div>
        </div>
      </div>

      {/* Quick Access Control Panes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <Link
          to="/admin/users"
          className="bg-charcoal-dark p-6 rounded-3xl border border-white/10 hover:border-sage/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <Users className="w-6 h-6 text-sage" />
            <ArrowRight className="w-4 h-4 text-ivory/40 group-hover:translate-x-1 group-hover:text-white transition-all" />
          </div>
          <h3 className="font-serif text-lg font-bold text-white mt-4">User Oversight</h3>
          <p className="text-xs text-ivory/60 mt-1">
            Search customer records, investigate reported profiles, and manage account suspensions.
          </p>
        </Link>

        <Link
          to="/admin/listings"
          className="bg-charcoal-dark p-6 rounded-3xl border border-white/10 hover:border-sage/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <Package className="w-6 h-6 text-sage" />
            <ArrowRight className="w-4 h-4 text-ivory/40 group-hover:translate-x-1 group-hover:text-white transition-all" />
          </div>
          <h3 className="font-serif text-lg font-bold text-white mt-4">Listing Moderation</h3>
          <p className="text-xs text-ivory/60 mt-1">
            Audit newly posted clothing items, inspect fabric condition descriptions, and hide violations.
          </p>
        </Link>

        <Link
          to="/admin/reports"
          className="bg-charcoal-dark p-6 rounded-3xl border border-white/10 hover:border-sage/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <AlertTriangle className="w-6 h-6 text-earth" />
            <ArrowRight className="w-4 h-4 text-ivory/40 group-hover:translate-x-1 group-hover:text-white transition-all" />
          </div>
          <h3 className="font-serif text-lg font-bold text-white mt-4">Disputes & Flagged Content</h3>
          <p className="text-xs text-ivory/60 mt-1">
            Resolve member complaints regarding condition mismatches or unfulfilled swaps.
          </p>
        </Link>

      </div>

    </div>
  );
};

