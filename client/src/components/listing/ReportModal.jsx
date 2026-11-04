import React, { useState } from 'react';
import { X, AlertTriangle, ShieldCheck } from 'lucide-react';
import api from '../../api/client';

export const ReportModal = ({ listing, isOpen, onClose }) => {
  const [reason, setReason] = useState('misrepresented_condition');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !listing) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide details for the report.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/api/reports', {
        reportedListing: listing._id,
        reportedUser: listing.owner?._id || listing.owner,
        reason,
        description,
      });

      if (res.data.success) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setDescription('');
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-forest/10 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-ivory text-charcoal/60 hover:text-charcoal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center">
            <ShieldCheck className="w-12 h-12 text-forest mx-auto mb-3 animate-bounce" />
            <h3 className="font-serif text-xl font-bold text-charcoal">Report Submitted</h3>
            <p className="text-xs text-charcoal/70 mt-1">
              Thank you for keeping our sustainable community trustworthy. Our moderation team has received the alert.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 text-earth">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-charcoal">Report Listing</h3>
            </div>
            <p className="text-xs text-charcoal/70">
              Flagging: <span className="font-semibold text-charcoal">{listing.title}</span>
            </p>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs">{error}</div>
            )}

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5 text-charcoal"
              >
                <option value="misrepresented_condition">Condition does not match description</option>
                <option value="counterfeit_or_fake">Counterfeit or replica piece</option>
                <option value="inappropriate_content">Inappropriate photo or description</option>
                <option value="scam_or_harassment">Suspicious behavior or scam</option>
                <option value="prohibited_item">Prohibited or unhygienic item</option>
                <option value="other">Other issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal mb-1">Detailed Description</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe why this listing violates community standards..."
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3 text-charcoal"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium border border-forest/20 rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 text-xs font-semibold bg-earth text-white rounded-full hover:bg-earth-dark disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

