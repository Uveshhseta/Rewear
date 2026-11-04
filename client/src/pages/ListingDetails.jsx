import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MapPin,
  Repeat,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ArrowLeft,
  Calendar,
  Eye,
  Check,
  Send,
  Truck,
  UserCheck,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ListingCard } from '../components/listing/ListingCard';
import { SwapModal } from '../components/listing/SwapModal';
import { ReportModal } from '../components/listing/ReportModal';

export const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, toggleWishlist } = useAuth();

  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/api/listings/${id}`);
        if (res.data.success) {
          setListing(res.data.listing);
          setSimilarListings(res.data.similarListings || []);
          if (res.data.listing.images && res.data.listing.images.length > 0) {
            setSelectedImage(res.data.listing.images[0]);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load listing.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-light">
        <div className="w-10 h-10 border-4 border-forest border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen py-20 px-4 text-center bg-ivory-light">
        <h2 className="font-serif text-2xl font-bold text-charcoal">Garment Not Found</h2>
        <p className="text-xs text-charcoal/70 mt-2">{error || 'This item may have been swapped or removed.'}</p>
        <Link
          to="/listings"
          className="mt-6 inline-flex items-center space-x-2 px-6 py-2.5 bg-forest text-white rounded-full text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>
    );
  }

  const isOwner = user && user._id === (listing.owner?._id || listing.owner);
  const isWishlisted = user?.wishlist?.some(
    (item) => (typeof item === 'string' ? item : item?._id) === listing._id
  );

  const formatCondition = (cond) => {
    switch (cond) {
      case 'new_with_tags':
        return 'New with tags';
      case 'like_new':
        return 'Like new (worn 1-2 times)';
      case 'good':
        return 'Good condition';
      case 'fair':
        return 'Fair (gently loved)';
      default:
        return cond;
    }
  };

  return (
    <div className="min-h-screen bg-ivory-light py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          to="/listings"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-charcoal/70 hover:text-forest mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Garment Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white rounded-3xl p-6 sm:p-10 border border-forest/10 shadow-float">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Main Showcase Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-ivory border border-forest/10 shadow-sm">
              <img
                src={selectedImage || listing.images?.[0]}
                alt={listing.title}
                className="w-full h-full object-cover object-center"
              />

              {listing.status === 'in_swap' && (
                <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="px-4 py-1.5 rounded-full bg-earth text-white text-xs font-semibold uppercase tracking-wider">
                    Swap in Negotiation
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Row */}
            {listing.images && listing.images.length > 1 && (
              <div className="flex space-x-3 overflow-x-auto pb-2">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === img ? 'border-forest shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Environmental Savings Info Pill */}
            <div className="p-4 rounded-2xl bg-sage-light border border-forest/10 flex items-center space-x-3 text-xs text-forest">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-forest" />
              <p>
                By swapping this garment instead of buying retail, you prevent approximately <strong>2,700 litres</strong> of clean water consumption.
              </p>
            </div>

          </div>

          {/* Right Column: Garment Specs & Action Deck */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            
            <div>
              {/* Category & Status */}
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-widest text-earth">
                  {listing.category?.replace('_', ' ')}
                </span>

                <div className="flex items-center space-x-3 text-xs text-charcoal/60">
                  <span className="flex items-center">
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    {listing.viewsCount} views
                  </span>
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Title & Brand */}
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal mt-2">
                {listing.title}
              </h1>
              <p className="text-sm font-semibold uppercase tracking-wider text-forest mt-1">
                {listing.brand || 'Artisan Garment'}
              </p>

              {/* Estimated Swap Value Banner */}
              <div className="mt-6 p-4 rounded-2xl bg-ivory border border-forest/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60 block">
                    Estimated Fair Swap Value
                  </span>
                  <span className="font-serif text-3xl font-extrabold text-forest">
                    ₹{listing.estimatedSwapValue?.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-charcoal/60 ml-2">
                    (Est. Original Retail: ₹{listing.referencePrice?.toLocaleString('en-IN')})
                  </span>
                </div>

                <button
                  onClick={() => toggleWishlist(listing._id)}
                  className={`p-3 rounded-full border transition-all ${
                    isWishlisted
                      ? 'bg-earth text-white border-earth shadow-sm'
                      : 'bg-white text-charcoal border-forest/15 hover:border-forest'
                  }`}
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 text-xs">
                <div className="p-3 rounded-xl bg-ivory-light border border-forest/10">
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Size</span>
                  <span className="font-bold text-charcoal text-sm">{listing.size}</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-light border border-forest/10">
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Condition</span>
                  <span className="font-semibold text-charcoal">{formatCondition(listing.condition)}</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-light border border-forest/10">
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Color</span>
                  <span className="font-semibold text-charcoal">{listing.color || 'Unspecified'}</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-light border border-forest/10">
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Material</span>
                  <span className="font-semibold text-charcoal">{listing.material || 'Cotton blend'}</span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-light border border-forest/10">
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Location</span>
                  <span className="font-semibold text-charcoal flex items-center mt-0.5">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-earth" />
                    {listing.city}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-ivory-light border border-forest/10">
                  <span className="text-[10px] uppercase font-bold text-charcoal/50 block">Handover</span>
                  <span className="font-semibold text-charcoal">
                    {listing.exchangePreference === 'both' ? 'In-Person & Courier' : listing.exchangePreference}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-charcoal/70 mb-2">
                  Garment Story & Details
                </h3>
                <p className="text-xs sm:text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Owner Public Card */}
              <div className="mt-6 pt-6 border-t border-forest/10 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={listing.owner?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={listing.owner?.name}
                    className="w-12 h-12 rounded-full object-cover border border-forest/10"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-charcoal">{listing.owner?.name}</h4>
                    <p className="text-[11px] text-charcoal/60">{listing.owner?.city} • Circular Fashion Member</p>
                  </div>
                </div>

                <button
                  onClick={() => setReportModalOpen(true)}
                  className="text-[11px] text-charcoal/50 hover:text-earth flex items-center space-x-1 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Report</span>
                </button>
              </div>

            </div>

            {/* Bottom Primary Actions */}
            <div className="pt-4 border-t border-forest/10">
              {isOwner ? (
                <div className="p-3 rounded-xl bg-ivory text-center text-xs font-medium text-charcoal">
                  This garment belongs to your wardrobe. You can manage or edit it from your dashboard.
                </div>
              ) : listing.status === 'available' ? (
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: { pathname: `/listings/${id}` } } });
                      return;
                    }
                    setSwapModalOpen(true);
                  }}
                  className="w-full py-4 rounded-full bg-forest hover:bg-forest-light text-white text-sm font-semibold flex items-center justify-center space-x-2 shadow-float transition-all"
                >
                  <Repeat className="w-5 h-5 text-sage" />
                  <span>Request Clothing Swap</span>
                </button>
              ) : (
                <div className="w-full py-3.5 rounded-full bg-gray-100 text-gray-500 text-center text-xs font-semibold">
                  This item is currently reserved in an ongoing swap
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Similar Listings Section */}
        {similarListings.length > 0 && (
          <div className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-forest mb-6">
              Similar Pieces You Might Love
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {similarListings.map((simItem) => (
                <ListingCard
                  key={simItem._id}
                  listing={simItem}
                  onSwapClick={() => {
                    navigate(`/listings/${simItem._id}`);
                  }}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Modals */}
      <SwapModal
        targetListing={listing}
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
      />

      <ReportModal
        listing={listing}
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

    </div>
  );
};

