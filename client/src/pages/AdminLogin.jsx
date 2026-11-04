import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Server,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginAdmin(email, password);
      if (data.success && data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Administrative authentication failed: Access denied.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-dark text-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-sage selection:text-charcoal">
      
      {/* Admin Command Center Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-forest border border-sage/30 shadow-2xl mb-4">
          <ShieldAlert className="w-7 h-7 text-sage" />
        </div>
        <h1 className="font-serif text-3xl font-extrabold tracking-wider uppercase text-white">
          ReWear Command Center
        </h1>
        <p className="mt-2 text-xs text-ivory/60 font-mono tracking-wide">
          RESTRICTED ADMINISTRATIVE GOVERNANCE CONSOLE
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-charcoal py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-white/10 relative overflow-hidden">
          
          {/* Subtle top indicator bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-forest via-sage to-earth"></div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-xs text-red-200 flex items-start space-x-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Authentication Refused</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono font-bold text-ivory/80 uppercase tracking-wider mb-1.5">
                Administrator Identifier
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@domain.com"
                  className="w-full text-xs sm:text-sm bg-charcoal-dark border border-white/15 rounded-xl pl-10 pr-4 py-3 text-white placeholder-ivory/30 focus:outline-none focus:border-sage font-mono"
                />
                <Mail className="w-4 h-4 text-ivory/40 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-ivory/80 uppercase tracking-wider mb-1.5">
                Passphrase
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs sm:text-sm bg-charcoal-dark border border-white/15 rounded-xl pl-10 pr-10 py-3 text-white placeholder-ivory/30 focus:outline-none focus:border-sage font-mono"
                />
                <Lock className="w-4 h-4 text-ivory/40 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-ivory/40 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-forest hover:bg-forest-light text-white text-xs font-mono font-bold tracking-wider uppercase border border-sage/30 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <KeyRound className="w-4 h-4 text-sage" />
              <span>{loading ? 'Verifying Authorization...' : 'Authenticate & Enter'}</span>
            </button>
          </form>

          {/* Security notice & back to public site link */}
          <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-ivory/50">
            <span className="flex items-center space-x-1">
              <Database className="w-3 h-3 text-sage" />
              <span>MongoDB Encrypted Audit</span>
            </span>
            <Link to="/" className="text-ivory/80 hover:text-white hover:underline">
              ← Public Marketplace
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

