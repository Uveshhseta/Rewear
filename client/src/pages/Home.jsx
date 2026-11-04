import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Repeat,
  ShieldCheck,
  Leaf,
  MapPin,
  TrendingUp,
  Heart,
  Droplets,
  Wind,
  CheckCircle2,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ListingCard } from '../components/listing/ListingCard';
import { SwapModal } from '../components/listing/SwapModal';
import { ValueCalculatorWidget } from '../components/common/ValueCalculatorWidget';

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [featuredListings, setFeaturedListings] = useState([]);
  const [nearbyListings, setNearbyListings] = useState([]);
  const [activeCity, setActiveCity] = useState('Mumbai');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Swap modal state
  const [selectedTargetItem, setSelectedTargetItem] = useState(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
        const [featuredRes, nearbyRes] = await Promise.all([
          api.get('/api/listings/featured?limit=16'),
          api.get(`/api/listings/nearby?city=${activeCity}`),
        ]);

        if (featuredRes.data.success) {
          setFeaturedListings(featuredRes.data.listings);
        }
        if (nearbyRes.data.success) {
          setNearbyListings(nearbyRes.data.listings);
        }
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepageData();
  }, [activeCity]);

  const handleSwapClick = (listing) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/listings/${listing._id}` } } });
      return;
    }
    setSelectedTargetItem(listing);
    setSwapModalOpen(true);
  };

  const categories = [
    {
      name: 'Women',
      slug: 'women',
      image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80',
      description: 'Vintage denim, silk blouses & tailored coats',
    },
    {
      name: 'Men',
      slug: 'men',
      image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80',
      description: 'Selvedge jeans, overshirts & heavy hoodies',
    },
    {
      name: 'Ethnic Wear',
      slug: 'ethnic_wear',
      image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80',
      description: 'Chanderi silks, handloom kurtis & festive waistcoats',
    },
    {
      name: 'Shoes',
      slug: 'shoes',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
      description: 'Classic court sneakers, boots & leather loafers',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
      description: 'Artisan leather bags, silk scarves & sunglasses',
    },
  ];

  const cityList = ['Mumbai', 'Delhi', 'Bengaluru', 'Pune'];

  return (
    <div className="min-h-screen bg-ivory-light">
      
      {/* 1. HERO SECTION: Editorial fashion layout matching reference aesthetic */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-32 bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Headline & Editorial Copy */}
            <div className="lg:col-span-7 z-10 space-y-6">
              
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-forest/10 border border-forest/15 text-forest text-xs font-semibold tracking-wide">
                <Leaf className="w-3.5 h-3.5 text-forest" />
                <span>India's Premier Zero-Cash Wardrobe Exchange</span>
              </div>

              <div className="space-y-2">
                <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-forest uppercase leading-[1.05]">
                  GOOD STYLE.<br />
                  <span className="italic font-normal text-charcoal font-serif">NEW LIFE.</span>
                </h1>
                <p className="font-serif text-xl sm:text-2xl text-earth italic">
                  Swap More. Waste Less.
                </p>
              </div>

              <p className="text-sm sm:text-base text-charcoal/80 max-w-xl leading-relaxed">
                Give your pre-loved clothes a new home. Discover unique vintage and contemporary styles, compare fair trade values, and exchange garments directly with your conscious fashion community.
              </p>

              {/* Functional CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <Link
                  to="/listings"
                  className="inline-flex items-center justify-center space-x-2 bg-forest text-ivory px-8 py-4 rounded-full text-sm font-semibold hover:bg-forest-light shadow-float transition-all group"
                >
                  <span>Explore Clothes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/create-listing"
                  className="inline-flex items-center justify-center space-x-2 bg-white text-forest border border-forest/20 px-8 py-4 rounded-full text-sm font-semibold hover:bg-ivory transition-all shadow-sm"
                >
                  <Repeat className="w-4 h-4 text-earth" />
                  <span>List an Item</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-forest/15 grid grid-cols-3 gap-4 text-charcoal/80">
                <div>
                  <span className="block font-serif text-2xl font-bold text-forest">₹0</span>
                  <span className="text-[11px] text-charcoal/60">Zero Currency Fees</span>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-bold text-forest">100%</span>
                  <span className="text-[11px] text-charcoal/60">Peer-to-Peer Trades</span>
                </div>
                <div>
                  <span className="block font-serif text-2xl font-bold text-forest">2,700L</span>
                  <span className="text-[11px] text-charcoal/60">Water Saved Per Garment</span>
                </div>
              </div>

            </div>

            {/* Right Editorial Photography Composition with Layered Floating Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Main Cinematic Fashion Photography */}
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85"
                    alt="Sustainable Fashion Model"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-[11px] uppercase tracking-widest font-semibold text-sage-light">
                      Curated Piece
                    </span>
                    <h3 className="font-serif text-xl font-bold">1980s Vintage Trench</h3>
                    <p className="text-xs text-ivory/80">Owner: Aanya • Mumbai</p>
                  </div>
                </div>

                {/* Floating Translucent Product Card 1 (Top Left) */}
                <div className="absolute -top-6 -left-6 sm:-left-10 bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-float border border-forest/10 hidden sm:flex items-center space-x-3 animate-float max-w-xs">
                  <img
                    src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=200&q=80"
                    alt="Denim Jacket"
                    className="w-12 h-14 object-cover rounded-xl"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-sage-light px-2 py-0.5 rounded-full">
                      Swap Match
                    </span>
                    <p className="text-xs font-bold text-charcoal mt-0.5 truncate">Levi's Denim Jacket</p>
                    <p className="text-xs font-semibold text-earth">Est. ₹3,150</p>
                  </div>
                </div>

                {/* Floating Translucent Product Card 2 (Bottom Right) */}
                <div className="absolute -bottom-8 -right-4 sm:-right-8 bg-forest text-ivory p-4 rounded-2xl shadow-float border border-white/20 hidden sm:block max-w-[210px]">
                  <div className="flex items-center space-x-2 text-sage text-xs font-semibold">
                    <Sparkles className="w-4 h-4" />
                    <span>Equitable Parity</span>
                  </div>
                  <p className="text-[11px] text-ivory/80 mt-1">
                    Value match algorithm ensures balanced garment exchanges.
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. BROWSE BY WARDROBE CATEGORY */}
      <section className="py-16 bg-white border-y border-forest/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-earth">
                Curated Collections
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
                Browse by Category
              </h2>
            </div>
            <Link
              to="/listings"
              className="mt-4 md:mt-0 text-xs font-bold text-forest hover:text-earth flex items-center space-x-1 uppercase tracking-wider transition-colors"
            >
              <span>View All Pieces</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/listings?category=${cat.slug}`}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm hover:shadow-float transition-all"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent group-hover:from-forest/90 transition-colors"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-serif text-lg font-bold">{cat.name}</h3>
                  <p className="text-[11px] text-ivory/80 line-clamp-1 mt-0.5">{cat.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED LISTINGS (LIVE FROM MONGODB) */}
      <section className="py-20 bg-ivory-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-bold tracking-widest text-earth">
              Community Wardrobe
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
              Featured Garments Available to Swap
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/70 mt-2">
              Every item has an estimated swap credit calculated from original value, fabric, and condition.
            </p>

            {/* Quick Filter Tabs for Featured Collection */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                { label: 'All Featured', value: 'all' },
                { label: "Women's Wear", value: 'women' },
                { label: "Men's Wear", value: 'men' },
                { label: 'Ethnic Wear', value: 'ethnic_wear' },
                { label: 'Shoes', value: 'shoes' },
                { label: 'Bags & Accessories', value: 'accessories' },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveCategoryFilter(tab.value)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    activeCategoryFilter === tab.value
                      ? 'bg-forest text-white shadow-sm'
                      : 'bg-white text-charcoal/80 border border-forest/15 hover:border-forest/40'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-96 rounded-2xl bg-ivory animate-pulse"></div>
              ))}
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-forest/10 p-8">
              <p className="text-sm font-semibold text-charcoal">No featured garments found.</p>
              <Link
                to="/create-listing"
                className="mt-4 inline-block px-6 py-2.5 bg-forest text-white text-xs font-semibold rounded-full"
              >
                Be the first to list a piece
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredListings
                .filter(
                  (listing) =>
                    activeCategoryFilter === 'all' || listing.category === activeCategoryFilter
                )
                .map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    onSwapClick={handleSwapClick}
                  />
                ))}
            </div>
          )}

          <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/listings"
              className="inline-flex items-center space-x-2 bg-forest text-white px-8 py-3.5 rounded-full text-xs font-semibold hover:bg-forest-light shadow-sm transition-all"
            >
              <span>Explore All {featuredListings.length > 0 ? `${featuredListings.length}+ Available Pieces` : 'Listings'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/create-listing"
              className="inline-flex items-center space-x-2 bg-white text-forest border border-forest/20 px-8 py-3.5 rounded-full text-xs font-semibold hover:bg-ivory shadow-sm transition-all"
            >
              <Repeat className="w-4 h-4 text-earth" />
              <span>List a Garment for Swap</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE VALUE CALCULATOR SECTION */}
      <section className="py-20 bg-ivory border-t border-forest/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs uppercase font-bold tracking-widest text-earth">
              Transparent Valuation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
              Test Our Swap Value Calculator
            </h2>
            <p className="text-xs sm:text-sm text-charcoal/70 mt-2 max-w-xl mx-auto">
              Wondering what your jacket or silk kurti is worth in the swap community? Select its condition and brand to see the fair credit estimate.
            </p>
          </div>

          <ValueCalculatorWidget />
        </div>
      </section>

      {/* 5. NEARBY DISCOVERY SECTION */}
      <section className="py-20 bg-white border-t border-forest/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-earth">
                Local Exchange Hubs
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
                Swaps Near You
              </h2>
            </div>

            {/* City Selector Tabs */}
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              {cityList.map((city) => (
                <button
                  key={city}
                  onClick={() => setActiveCity(city)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    activeCity === city
                      ? 'bg-forest text-white shadow-sm'
                      : 'bg-ivory text-charcoal hover:bg-ivory-dark'
                  }`}
                >
                  <MapPin className="w-3 h-3 inline-block mr-1" />
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyListings.length === 0 ? (
              <div className="col-span-full py-12 text-center bg-ivory rounded-2xl">
                <p className="text-xs text-charcoal/70">No current listings in {activeCity}. Be the first in your city!</p>
              </div>
            ) : (
              nearbyListings.map((listing) => (
                <ListingCard
                  key={listing._id}
                  listing={listing}
                  onSwapClick={handleSwapClick}
                />
              ))
            )}
          </div>
        </div>
      </section>

      {/* 6. HOW REWEAR WORKS (CIRCULAR LIFECYCLE) */}
      <section className="py-20 bg-forest text-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-widest text-sage">
              Simple 4-Step Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mt-1">
              How Clothing Swapping Works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative">
              <span className="font-serif text-4xl font-bold text-sage/40">01</span>
              <h3 className="font-serif text-lg font-bold text-white mt-4">List Your Wardrobe</h3>
              <p className="text-xs text-ivory/70 mt-2 leading-relaxed">
                Snap photos of wearable garments you no longer wear. Our rule-based calculator estimates fair swap parity.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative">
              <span className="font-serif text-4xl font-bold text-sage/40">02</span>
              <h3 className="font-serif text-lg font-bold text-white mt-4">Discover & Request</h3>
              <p className="text-xs text-ivory/70 mt-2 leading-relaxed">
                Filter through verified pieces across India. Pick a garment from your closet to propose in direct exchange.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative">
              <span className="font-serif text-4xl font-bold text-sage/40">03</span>
              <h3 className="font-serif text-lg font-bold text-white mt-4">Negotiate in Chat</h3>
              <p className="text-xs text-ivory/70 mt-2 leading-relaxed">
                Discuss sizing, fabric fit, and choose between a local public handover or courier parcel dispatch.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 relative">
              <span className="font-serif text-4xl font-bold text-sage/40">04</span>
              <h3 className="font-serif text-lg font-bold text-white mt-4">Confirm & Celebrate</h3>
              <p className="text-xs text-ivory/70 mt-2 leading-relaxed">
                Confirm receipt to finalize the exchange. Give pre-loved clothing a vibrant new life without monetary waste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ENVIRONMENTAL IMPACT COUNTERS */}
      <section className="py-16 bg-sage-light text-forest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6 rounded-2xl bg-white/80 border border-forest/10 shadow-sm">
              <Droplets className="w-8 h-8 text-forest mx-auto mb-2" />
              <span className="font-serif text-4xl font-bold text-forest">2,700 Litres</span>
              <p className="text-xs font-medium text-charcoal/80 mt-1">
                Average clean water saved per swapped garment instead of buying new cotton
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 border border-forest/10 shadow-sm">
              <Wind className="w-8 h-8 text-forest mx-auto mb-2" />
              <span className="font-serif text-4xl font-bold text-forest">3.6 Kilograms</span>
              <p className="text-xs font-medium text-charcoal/80 mt-1">
                Carbon emissions averted per recirculated textile piece
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/80 border border-forest/10 shadow-sm">
              <Leaf className="w-8 h-8 text-forest mx-auto mb-2" />
              <span className="font-serif text-4xl font-bold text-forest">100% Circular</span>
              <p className="text-xs font-medium text-charcoal/80 mt-1">
                Wardrobe longevity extended, preventing usable fashion from Indian landfills
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Swap Request Modal */}
      <SwapModal
        targetListing={selectedTargetItem}
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
      />

    </div>
  );
};

