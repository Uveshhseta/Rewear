import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRightLeft, AlertCircle, CheckCircle2, PackagePlus, Send } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export const SwapModal = ({ targetListing, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState('');
  const [exchangeMethod, setExchangeMethod] = useState('in_person');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch logged-in user's available listings
  useEffect(() => {
    if (isOpen && user) {
      const fetchMyWardrobe = async () => {
        setLoadingListings(true);
        setError('');
        try {
          const res = await api.get(`/api/listings?owner=${user._id}&status=available`);
          if (res.data.success) {
            setMyListings(res.data.listings);
            if (res.data.listings.length > 0) {
              setSelectedOfferId(res.data.listings[0]._id);
            }
          }
        } catch (err) {
          setError('Could not load your wardrobe items.');
        } finally {
          setLoadingListings(false);
        }
      };

      fetchMyWardrobe();
    }
  }, [isOpen, user]);

  if (!isOpen || !targetListing) return null;

  const selectedListing = myListings.find((item) => item._id === selectedOfferId);

  // Compute live value comparison
  const offeredVal = selectedListing?.estimatedSwapValue || 0;
  const requestedVal = targetListing?.estimatedSwapValue || 0;
  const absDiff = Math.abs(offeredVal - requestedVal);
  const higherVal = Math.max(offeredVal, requestedVal);
  const pctDiff = higherVal > 0 ? Math.round((absDiff / higherVal) * 100) : 0;

  let fairnessBadge = { text: 'Equitable Swap (High Parity)', color: 'bg-green-100 text-green-800 border-green-200' };
  if (pctDiff > 30) {
    fairnessBadge = { text: 'Value Variance (>30% Difference)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
  } else if (pctDiff > 15) {
    fairnessBadge = { text: 'Fair Match (Negotiable)', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOfferId) {
      setError('Please select an item from your wardrobe to offer.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/api/swaps', {
        requestedListingId: targetListing._id,
        offeredListingId: selectedOfferId,
        message: message || `Hello! I would love to swap my ${selectedListing.title} for your ${targetListing.title}.`,
        exchangeMethod,
      });

      if (res.data.success) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#263C31', '#B8C9B4', '#B88C70'],
        });

        if (onSuccess) onSuccess(res.data.swap);
        onClose();
        navigate('/swaps');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit swap request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-forest/10 relative animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-ivory text-charcoal/60 hover:text-charcoal transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-2 text-forest mb-2">
          <ArrowRightLeft className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Propose a Wardrobe Swap</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-charcoal">
          Exchange Pieces with {targetListing.owner?.name || 'Owner'}
        </h2>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Items Comparison Preview */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-ivory-light border border-forest/10">
          
          {/* Requested Item */}
          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-forest/10">
            <img
              src={targetListing.images?.[0]}
              alt={targetListing.title}
              className="w-16 h-20 object-cover rounded-lg"
            />
            <div className="overflow-hidden">
              <span className="text-[10px] uppercase font-bold text-charcoal/50">You Receive</span>
              <p className="text-xs font-bold text-charcoal truncate">{targetListing.title}</p>
              <p className="text-xs font-semibold text-forest mt-1">
                ₹{targetListing.estimatedSwapValue?.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-charcoal/60">{targetListing.city}</span>
            </div>
          </div>

          {/* Offered Item */}
          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-forest/10">
            {selectedListing ? (
              <>
                <img
                  src={selectedListing.images?.[0]}
                  alt={selectedListing.title}
                  className="w-16 h-20 object-cover rounded-lg"
                />
                <div className="overflow-hidden">
                  <span className="text-[10px] uppercase font-bold text-charcoal/50">You Offer</span>
                  <p className="text-xs font-bold text-charcoal truncate">{selectedListing.title}</p>
                  <p className="text-xs font-semibold text-forest mt-1">
                    ₹{selectedListing.estimatedSwapValue?.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[10px] text-charcoal/60">Your item</span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-2">
                <span className="text-xs text-charcoal/60">No item selected yet</span>
              </div>
            )}
          </div>

        </div>

        {/* Value Fairness Assessment Indicator */}
        {selectedListing && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between p-3 rounded-xl bg-ivory border border-forest/10 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-charcoal">Value Disparity:</span>
              <span className="font-bold text-forest">₹{absDiff.toLocaleString('en-IN')} ({pctDiff}%)</span>
            </div>
            <span className={`mt-2 sm:mt-0 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${fairnessBadge.color}`}>
              {fairnessBadge.text}
            </span>
          </div>
        )}

        {/* Wardrobe Item Selection Flow */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
              Select Garment From Your Wardrobe
            </label>

            {loadingListings ? (
              <div className="text-center py-4 text-xs text-charcoal/60">Loading your items...</div>
            ) : myListings.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <PackagePlus className="w-8 h-8 text-earth mx-auto mb-2" />
                <p className="text-xs font-semibold text-charcoal">You have no available listings in your wardrobe.</p>
                <p className="text-[11px] text-charcoal/70 mt-1">To request a clothing swap, you must first list a wearable garment.</p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/create-listing');
                  }}
                  className="mt-3 inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-forest text-white text-xs font-semibold hover:bg-forest-light"
                >
                  <PackagePlus className="w-3.5 h-3.5" />
                  <span>List a Garment Now</span>
                </button>
              </div>
            ) : (
              <select
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="w-full text-xs bg-ivory-light border border-forest/20 rounded-xl px-3 py-2.5 text-charcoal focus:outline-none focus:border-forest"
              >
                {myListings.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.title} — {item.category} (Size {item.size}) • Est. ₹{item.estimatedSwapValue}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Preferred Exchange Method */}
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
              Exchange Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExchangeMethod('in_person')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  exchangeMethod === 'in_person'
                    ? 'bg-forest text-white border-forest shadow-sm'
                    : 'bg-ivory text-charcoal border-forest/10 hover:border-forest/30'
                }`}
              >
                Local Handover (In-Person)
              </button>
              <button
                type="button"
                onClick={() => setExchangeMethod('courier')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all ${
                  exchangeMethod === 'courier'
                    ? 'bg-forest text-white border-forest shadow-sm'
                    : 'bg-ivory text-charcoal border-forest/10 hover:border-forest/30'
                }`}
              >
                Courier Delivery (Postal)
              </button>
            </div>
          </div>

          {/* Proposal Message */}
          <div>
            <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-1">
              Proposal Note
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi! I love this piece and would be thrilled to exchange it with mine..."
              className="w-full text-xs bg-ivory-light border border-forest/20 rounded-xl p-3 text-charcoal focus:outline-none focus:border-forest"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full border border-forest/20 text-xs font-medium text-charcoal hover:bg-ivory"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || myListings.length === 0}
              className="inline-flex items-center space-x-2 px-6 py-2.5 rounded-full bg-forest text-white text-xs font-semibold hover:bg-forest-light transition-all disabled:opacity-50 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting Proposal...' : 'Send Swap Request'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

