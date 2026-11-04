import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api/client';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      setSubmitted(true);
      setMessage(res.data.message || 'Recovery instructions have been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2">
          <span className="w-12 h-12 rounded-full bg-forest text-ivory flex items-center justify-center font-serif text-2xl font-bold">
            R
          </span>
          <span className="font-serif text-3xl font-bold tracking-tight text-forest">
            Re<span className="text-earth italic font-normal">Wear</span>
          </span>
        </Link>
        <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight text-charcoal">
          Reset Your Password
        </h2>
        <p className="mt-2 text-xs text-charcoal/70">
          Enter your registered email to receive a secure recovery link
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-float rounded-3xl border border-forest/10">
          {submitted ? (
            <div className="text-center py-4 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-forest mx-auto" />
              <h3 className="font-serif text-lg font-bold text-charcoal">Instructions Sent</h3>
              <p className="text-xs text-charcoal/80 leading-relaxed">{message}</p>
              <Link
                to="/login"
                className="inline-block mt-4 text-xs font-semibold text-forest underline"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. yourname@example.com"
                    className="w-full text-xs sm:text-sm bg-ivory-light border border-forest/20 rounded-xl pl-10 pr-4 py-3 text-charcoal"
                  />
                  <Mail className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-forest text-white text-xs font-bold rounded-full hover:bg-forest-light disabled:opacity-50"
              >
                {loading ? 'Sending Request...' : 'Send Recovery Link'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="text-xs text-charcoal/70 hover:text-forest inline-flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

