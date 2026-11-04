import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Repeat,
  ArrowRightLeft,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Truck,
  MapPin,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Swaps = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [swaps, setSwaps] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // all, incoming, outgoing, accepted, completed
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Exchange logistics modal state
  const [logisticsModalSwap, setLogisticsModalSwap] = useState(null);
  const [logisticsType, setLogisticsType] = useState('in_person');
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');

  const fetchSwaps = async () => {
    setLoading(true);
    setError('');
    try {
      let url = '/api/swaps';
      if (activeTab === 'incoming') url = '/api/swaps?type=incoming';
      else if (activeTab === 'outgoing') url = '/api/swaps?type=outgoing';
      else if (activeTab === 'accepted') url = '/api/swaps?status=accepted';
      else if (activeTab === 'completed') url = '/api/swaps?status=completed';

      const res = await api.get(url);
      if (res.data.success) {
        setSwaps(res.data.swaps);
      }
    } catch (err) {
      setError('Failed to load swap requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSwaps();
  }, [activeTab]);

  // Accept swap
  const handleAccept = async (swapId) => {
    if (!window.confirm('Accept this clothing exchange? Both items will be reserved for this swap.')) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/api/swaps/${swapId}/accept`);
      if (res.data.success) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#263C31', '#B8C9B4', '#B88C70'],
        });
        fetchSwaps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept swap.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject swap
  const handleReject = async (swapId) => {
    if (!window.confirm('Decline this swap request?')) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/api/swaps/${swapId}/reject`);
      if (res.data.success) {
        fetchSwaps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline swap.');
    } finally {
      setActionLoading(false);
    }
  };

  // Cancel outgoing request
  const handleCancel = async (swapId) => {
    if (!window.confirm('Cancel your swap proposal?')) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/api/swaps/${swapId}/cancel`);
      if (res.data.success) {
        fetchSwaps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel swap.');
    } finally {
      setActionLoading(false);
    }
  };

  // Complete swap
  const handleComplete = async (swapId) => {
    if (!window.confirm('Confirm that the garment exchange has completed successfully? Both items will be marked as swapped.')) return;
    setActionLoading(true);
    try {
      const res = await api.put(`/api/swaps/${swapId}/complete`);
      if (res.data.success) {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#263C31', '#B8C9B4', '#B88C70'],
        });
        fetchSwaps();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to complete swap.');
    } finally {
      setActionLoading(false);
    }
  };

  // Save exchange details
  const handleSaveLogistics = async (e) => {
    e.preventDefault();
    if (!logisticsModalSwap) return;
    setActionLoading(true);

    try {
      const payload = {
        exchangeMethod: logisticsType,
        meetingDetails: {
          locationName: meetingLocation,
          notes: meetingNotes,
        },
        courierDetails: {
          carrier,
          trackingNumber,
          status: trackingNumber ? 'dispatched' : 'not_dispatched',
          dispatchedAt: trackingNumber ? new Date() : undefined,
        },
      };

      const res = await api.put(`/api/swaps/${logisticsModalSwap._id}/exchange-details`, payload);
      if (res.data.success) {
        setLogisticsModalSwap(null);
        fetchSwaps();
      }
    } catch (err) {
      alert('Failed to update logistics.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pending Review</span>;
      case 'accepted':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Accepted & Active</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">Exchange Completed</span>;
      case 'rejected':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">Declined</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-ivory-light py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <span className="text-xs uppercase font-bold tracking-widest text-earth">
            Direct Wardrobe Exchanges
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
            Swap Management Portal
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            Review incoming proposals, manage active exchanges, coordinate handover logistics, and mark completed swaps.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex space-x-2 border-b border-forest/15 pb-4 mb-8 overflow-x-auto">
          {[
            { id: 'all', label: 'All Requests' },
            { id: 'incoming', label: 'Incoming Requests' },
            { id: 'outgoing', label: 'My Proposals' },
            { id: 'accepted', label: 'Active Swaps' },
            { id: 'completed', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-forest text-white shadow-sm'
                  : 'bg-white text-charcoal border border-forest/15 hover:bg-ivory'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Swaps List Deck */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 rounded-3xl bg-ivory animate-pulse"></div>
            ))}
          </div>
        ) : swaps.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-forest/10 p-8">
            <ArrowRightLeft className="w-12 h-12 text-forest/40 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-charcoal">No Swap Requests Found</h3>
            <p className="text-xs text-charcoal/70 mt-1 max-w-sm mx-auto">
              You do not have any requests in this section. Browse the marketplace or list garments to initiate exchanges.
            </p>
            <Link
              to="/listings"
              className="mt-4 inline-block px-6 py-2.5 bg-forest text-white rounded-full text-xs font-semibold"
            >
              Explore Clothes
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {swaps.map((swap) => {
              const isIncoming = user && swap.recipient?._id === user._id;
              const otherUser = isIncoming ? swap.requester : swap.recipient;

              return (
                <div
                  key={swap._id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/10 shadow-sm hover:shadow-float transition-all"
                >
                  {/* Top Meta Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-ivory gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-charcoal">
                        {isIncoming ? 'Incoming Request from' : 'Outgoing Proposal to'}{' '}
                        <span className="text-forest underline">{otherUser?.name}</span>
                      </span>
                      <span className="text-[11px] text-charcoal/50">• {otherUser?.city}</span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] text-charcoal/60">
                        {new Date(swap.createdAt).toLocaleDateString()}
                      </span>
                      {getStatusBadge(swap.status)}
                    </div>
                  </div>

                  {/* Side-by-Side Items Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 items-center">
                    
                    {/* Item A (Requested Item) */}
                    <div className="md:col-span-5 flex items-center space-x-4 p-4 rounded-2xl bg-ivory-light border border-forest/10">
                      <img
                        src={swap.requestedListing?.images?.[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80'}
                        alt={swap.requestedListing?.title}
                        className="w-20 h-24 object-cover rounded-xl"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-charcoal/50">
                          {isIncoming ? 'Your Garment' : 'Target Garment'}
                        </span>
                        <h4 className="text-xs font-bold text-charcoal truncate mt-0.5">
                          {swap.requestedListing?.title}
                        </h4>
                        <p className="text-[11px] text-charcoal/60">
                          {swap.requestedListing?.brand} • Size {swap.requestedListing?.size}
                        </p>
                        <p className="text-xs font-bold text-forest mt-1">
                          Est. ₹{swap.recipientItemValue?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                    {/* Middle Trade Indicator */}
                    <div className="md:col-span-2 text-center flex flex-col items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center shadow-sm">
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60 mt-2">
                        Diff: ₹{swap.valueDifference?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Item B (Offered Item) */}
                    <div className="md:col-span-5 flex items-center space-x-4 p-4 rounded-2xl bg-ivory-light border border-forest/10">
                      <img
                        src={swap.offeredListing?.images?.[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80'}
                        alt={swap.offeredListing?.title}
                        className="w-20 h-24 object-cover rounded-xl"
                      />
                      <div className="overflow-hidden">
                        <span className="text-[10px] uppercase font-bold text-charcoal/50">
                          {isIncoming ? 'Offered in Exchange' : 'Your Garment'}
                        </span>
                        <h4 className="text-xs font-bold text-charcoal truncate mt-0.5">
                          {swap.offeredListing?.title}
                        </h4>
                        <p className="text-[11px] text-charcoal/60">
                          {swap.offeredListing?.brand} • Size {swap.offeredListing?.size}
                        </p>
                        <p className="text-xs font-bold text-forest mt-1">
                          Est. ₹{swap.requesterItemValue?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Proposal Note */}
                  {swap.message && (
                    <div className="p-3.5 rounded-xl bg-ivory text-xs text-charcoal/80 mb-6 italic">
                      "{swap.message}"
                    </div>
                  )}

                  {/* Courier / Handover Logistics Banner if Accepted */}
                  {swap.status === 'accepted' && (
                    <div className="mb-6 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-blue-900 block">
                          Exchange Logistics: {swap.exchangeMethod === 'in_person' ? 'Local Handover' : 'Courier Postal'}
                        </span>
                        {swap.courierDetails?.trackingNumber ? (
                          <p className="text-blue-800 mt-0.5">
                            Carrier: <strong>{swap.courierDetails.carrier}</strong> | Tracking No:{' '}
                            <strong className="underline">{swap.courierDetails.trackingNumber}</strong>
                          </p>
                        ) : swap.meetingDetails?.locationName ? (
                          <p className="text-blue-800 mt-0.5">
                            Meeting Spot: <strong>{swap.meetingDetails.locationName}</strong>
                          </p>
                        ) : (
                          <p className="text-blue-700 mt-0.5">
                            No dispatch or meeting location confirmed yet. Click "Logistics" to set.
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setLogisticsModalSwap(swap);
                          setLogisticsType(swap.exchangeMethod || 'in_person');
                          setCarrier(swap.courierDetails?.carrier || '');
                          setTrackingNumber(swap.courierDetails?.trackingNumber || '');
                          setMeetingLocation(swap.meetingDetails?.locationName || '');
                          setMeetingNotes(swap.meetingDetails?.notes || '');
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-blue-700 text-white font-semibold text-xs hover:bg-blue-800 self-start sm:self-auto"
                      >
                        Set Handover / Courier Info
                      </button>
                    </div>
                  )}

                  {/* Bottom Action Deck */}
                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    
                    {/* Chat Action */}
                    <Link
                      to={`/chat?swapId=${swap._id}`}
                      className="px-4 py-2 rounded-full border border-forest/20 text-xs font-semibold text-charcoal hover:bg-ivory flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-forest" />
                      <span>Negotiate in Chat</span>
                    </Link>

                    {/* Pending Actions for Recipient */}
                    {isIncoming && swap.status === 'pending' && (
                      <>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleReject(swap._id)}
                          className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                        >
                          Decline
                        </button>
                        <button
                          disabled={actionLoading}
                          onClick={() => handleAccept(swap._id)}
                          className="px-5 py-2 rounded-full bg-forest text-white hover:bg-forest-light text-xs font-semibold flex items-center space-x-1.5 shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5 text-sage" />
                          <span>Accept Swap</span>
                        </button>
                      </>
                    )}

                    {/* Pending Action for Requester */}
                    {!isIncoming && swap.status === 'pending' && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleCancel(swap._id)}
                        className="px-4 py-2 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold"
                      >
                        Cancel Proposal
                      </button>
                    )}

                    {/* Accepted Actions */}
                    {swap.status === 'accepted' && (
                      <button
                        disabled={actionLoading}
                        onClick={() => handleComplete(swap._id)}
                        className="px-5 py-2 rounded-full bg-green-700 text-white hover:bg-green-800 text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Confirm Swap Completed</span>
                      </button>
                    )}

                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Logistics Update Modal */}
      {logisticsModalSwap && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-forest/10 relative">
            <h3 className="font-serif text-lg font-bold text-charcoal mb-4">
              Exchange Logistics & Handover
            </h3>

            <form onSubmit={handleSaveLogistics} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase mb-1">Exchange Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLogisticsType('in_person')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      logisticsType === 'in_person' ? 'bg-forest text-white border-forest' : 'bg-ivory text-charcoal'
                    }`}
                  >
                    Local Meetup
                  </button>
                  <button
                    type="button"
                    onClick={() => setLogisticsType('courier')}
                    className={`py-2 text-xs font-semibold rounded-xl border ${
                      logisticsType === 'courier' ? 'bg-forest text-white border-forest' : 'bg-ivory text-charcoal'
                    }`}
                  >
                    Courier Parcel
                  </button>
                </div>
              </div>

              {logisticsType === 'in_person' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Public Meetup Location</label>
                    <input
                      type="text"
                      value={meetingLocation}
                      onChange={(e) => setMeetingLocation(e.target.value)}
                      placeholder="e.g. Bandra Kurla Complex Metro Station Café"
                      className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Safety Notes</label>
                    <textarea
                      rows={2}
                      value={meetingNotes}
                      onChange={(e) => setMeetingNotes(e.target.value)}
                      placeholder="e.g. Meeting around 4 PM on Saturday at main lobby."
                      className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Courier Carrier</label>
                    <input
                      type="text"
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      placeholder="e.g. Blue Dart, Delhivery, India Post Speed Post"
                      className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal mb-1">Tracking Number / AWB</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. BD-982348719IN"
                      className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t border-ivory">
                <button
                  type="button"
                  onClick={() => setLogisticsModalSwap(null)}
                  className="px-4 py-2 text-xs font-semibold border rounded-full"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-semibold bg-forest text-white rounded-full hover:bg-forest-light"
                >
                  Save Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

