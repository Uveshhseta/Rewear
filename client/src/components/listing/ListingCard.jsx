import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MapPin, Repeat } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ListingCard = ({ listing, onSwapClick }) => {
  const { user, toggleWishlist } = useAuth();
  const isWishlisted = user?.wishlist?.some(
    (item) => (typeof item === 'string' ? item : item?._id) === listing._id
  );

  const formatCondition = (cond) => {
    switch (cond) {
      case 'new_with_tags':
        return 'New with Tags';
      case 'like_new':
        return 'Like New';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      default:
        return cond;
    }
  };

  const isOwner = user && user._id === (listing.owner?._id || listing.owner);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-forest/10 hover:border-forest/30 shadow-sm hover:shadow-float transition-all duration-300 flex flex-col justify-between">
      
      {/* Image & Overlay Badges */}
      <div className="relative aspect-[3/4] overflow-hidden bg-ivory">
        <img
          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80'}
          alt={listing.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-forest/85 backdrop-blur-md text-ivory shadow-sm">
            {listing.category?.replace('_', ' ')}
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-charcoal shadow-sm">
            {formatCondition(listing.condition)}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(listing._id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isWishlisted
              ? 'bg-earth text-white'
              : 'bg-white/80 text-charcoal hover:bg-white hover:text-earth'
          }`}
          title="Save to Wishlist"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
        </button>

        {/* Status Overlay if not available */}
        {listing.status === 'in_swap' && (
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-3 py-1 rounded-full bg-earth text-white text-xs font-semibold uppercase tracking-wider">
              Pending Swap
            </span>
          </div>
        )}
      </div>

      {/* Item Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-charcoal/70 mb-1">
            <span className="font-semibold uppercase tracking-wider text-forest truncate max-w-[65%]">
              {listing.brand || 'Artisan'}
            </span>
            <span className="font-bold text-charcoal bg-ivory px-2 py-0.5 rounded">
              Size {listing.size}
            </span>
          </div>

          <Link to={`/listings/${listing._id}`} className="block group-hover:text-forest transition-colors">
            <h3 className="font-serif text-base font-bold text-charcoal line-clamp-1">
              {listing.title}
            </h3>
          </Link>
        </div>

        {/* Value & Location */}
        <div className="mt-4 pt-3 border-t border-ivory flex items-center justify-between">
          <div>
            <span className="block text-[10px] uppercase font-bold text-charcoal/60 tracking-wider">
              Swap Value
            </span>
            <span className="text-base font-bold text-forest">
              ₹{listing.estimatedSwapValue?.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center text-xs text-charcoal/70">
            <MapPin className="w-3.5 h-3.5 mr-1 text-earth" />
            <span className="truncate max-w-[90px]">{listing.city}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-2">
          {listing.status === 'available' && !isOwner ? (
            <button
              onClick={() => (onSwapClick ? onSwapClick(listing) : null)}
              className="w-full py-2 px-3 rounded-xl bg-forest/5 hover:bg-forest text-forest hover:text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
            >
              <Repeat className="w-3.5 h-3.5" />
              <span>Propose Swap</span>
            </button>
          ) : isOwner ? (
            <Link
              to={`/dashboard`}
              className="w-full py-2 px-3 rounded-xl bg-ivory text-charcoal text-center text-xs font-medium block hover:bg-ivory-dark transition-all"
            >
              Your Garment
            </Link>
          ) : (
            <span className="w-full py-2 px-3 rounded-xl bg-gray-100 text-gray-500 text-center text-xs font-medium block">
              Currently In Negotiation
            </span>
          )}
        </div>

      </div>
    </div>
  );
};

