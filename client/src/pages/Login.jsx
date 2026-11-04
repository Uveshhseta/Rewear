import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { loginCustomer, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginCustomer(email, password);
      if (data.success) {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        
        {/* ReWear Circular Logo */}
        <Link to="/" className="inline-flex items-center space-x-2">
          <span className="w-12 h-12 rounded-full bg-forest text-ivory flex items-center justify-center font-serif text-2xl font-bold shadow-md">
            R
          </span>
          <span className="font-serif text-3xl font-bold tracking-tight text-forest">
            Re<span className="text-earth italic font-normal">Wear</span>
          </span>
        </Link>

        <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight text-charcoal">
          Welcome to Circular Style
        </h2>
        <p className="mt-2 text-xs text-charcoal/70">
          Sign in to your customer wardrobe account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-float rounded-3xl border border-forest/10">
          
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full text-xs sm:text-sm bg-ivory-light border border-forest/20 rounded-xl pl-10 pr-4 py-3 text-charcoal focus:outline-none focus:border-forest"
                />
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-earth hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm bg-ivory-light border border-forest/20 rounded-xl pl-10 pr-10 py-3 text-charcoal focus:outline-none focus:border-forest"
                />
                <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-charcoal/40 hover:text-charcoal"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-6 border-t border-ivory text-center text-xs text-charcoal/70">
            Don't have a ReWear account?{' '}
            <Link to="/register" className="font-bold text-forest hover:underline">
              Join the Circular Movement
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

