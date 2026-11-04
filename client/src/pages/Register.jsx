import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, MapPin, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerCustomer({
        name,
        email,
        password,
        city,
        postalCode,
        phone,
      });

      if (data.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <span className="w-12 h-12 rounded-full bg-forest text-ivory flex items-center justify-center font-serif text-2xl font-bold shadow-md">
            R
          </span>
          <span className="font-serif text-3xl font-bold tracking-tight text-forest">
            Re<span className="text-earth italic font-normal">Wear</span>
          </span>
        </Link>
        <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight text-charcoal">
          Create Customer Account
        </h2>
        <p className="mt-2 text-xs text-charcoal/70">
          Join thousands of fashion lovers trading garments cashless
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-float rounded-3xl border border-forest/10">
          
          {error && (
            <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diya Sengupta"
                  className="w-full text-xs sm:text-sm bg-ivory-light border border-forest/20 rounded-xl pl-10 pr-4 py-2.5 text-charcoal focus:outline-none focus:border-forest"
                />
                <UserIcon className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. diya@example.com"
                  className="w-full text-xs sm:text-sm bg-ivory-light border border-forest/20 rounded-xl pl-10 pr-4 py-2.5 text-charcoal focus:outline-none focus:border-forest"
                />
                <Mail className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  City *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru"
                    className="w-full text-xs sm:text-sm bg-ivory-light border border-forest/20 rounded-xl pl-10 pr-4 py-2.5 text-charcoal focus:outline-none focus:border-forest"
                  />
                  <MapPin className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  PIN / Postal Code
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 400001"
                  className="w-full text-xs sm:text-sm bg-ivory-light border border-forest/20 rounded-xl px-4 py-2.5 text-charcoal focus:outline-none focus:border-forest"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full text-xs sm:text-sm bg-ivory-light border border-forest/20 rounded-xl pl-10 pr-8 py-2.5 text-charcoal focus:outline-none focus:border-forest"
                  />
                  <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full text-xs sm:text-sm bg-ivory-light border border-forest/20 rounded-xl pl-10 pr-8 py-2.5 text-charcoal focus:outline-none focus:border-forest"
                  />
                  <Lock className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-3 text-charcoal/40 hover:text-charcoal"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 px-4 rounded-full bg-forest text-white text-xs font-bold hover:bg-forest-light transition-all shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-ivory text-center text-xs text-charcoal/70">
            Already registered on ReWear?{' '}
            <Link to="/login" className="font-bold text-forest hover:underline">
              Log in here
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

