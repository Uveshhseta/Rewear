import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  X,
  RotateCcw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  PackageOpen,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ListingCard } from '../components/listing/ListingCard';
import { SwapModal } from '../components/listing/SwapModal';

export const Listings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [gender, setGender] = useState('all');
  const [size, setSize] = useState('all');
  const [condition, setCondition] = useState('all');
  const [brand, setBrand] = useState('');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minVal, setMinVal] = useState('');
  const [maxVal, setMaxVal] = useState('');
  const [exchangePreference, setExchangePreference] = useState('all');
  const [sort, setSort] = useState('newest');

  // Mobile sidebar drawer
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Swap modal
  const [selectedTargetItem, setSelectedTargetItem] = useState(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  // Fetch listings
  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      if (gender && gender !== 'all') params.append('gender', gender);
      if (size && size !== 'all') params.append('size', size);
      if (condition && condition !== 'all') params.append('condition', condition);
      if (brand) params.append('brand', brand);
      if (city) params.append('city', city);
      if (minVal) params.append('minVal', minVal);
      if (maxVal) params.append('maxVal', maxVal);
      if (exchangePreference && exchangePreference !== 'all') {
        params.append('exchangePreference', exchangePreference);
      }
      if (sort) params.append('sort', sort);
      params.append('page', page);
      params.append('limit', 12);

      const res = await api.get(`/api/listings?${params.toString()}`);
      if (res.data.success) {
        setListings(res.data.listings);
        setTotal(res.data.total);
        setPages(res.data.pages);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, gender, size, condition, city, sort, page]);

  // Sync URL search params
  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setCategory(urlCategory);
    const urlSearch = searchParams.get('search');
    if (urlSearch) setSearch(urlSearch);
    const urlCity = searchParams.get('city');
    if (urlCity) setCity(urlCity);
  }, [searchParams]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchListings();
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('all');
    setGender('all');
    setSize('all');
    setCondition('all');
    setBrand('');
    setCity('');
    setMinVal('');
    setMaxVal('');
    setExchangePreference('all');
    setSort('newest');
    setPage(1);
    setSearchParams({});
  };

  const handleSwapClick = (listing) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/listings/${listing._id}` } } });
      return;
    }
    setSelectedTargetItem(listing);
    setSwapModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-ivory-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb & Title */}
        <div className="mb-8">
          <span className="text-[11px] uppercase tracking-widest font-bold text-earth">
            Sustainable Marketplace
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-forest mt-1">
            Discover Wearable Pieces
          </h1>
          <p className="text-xs sm:text-sm text-charcoal/70 mt-1">
            Browse {total} pre-loved clothing listings available for cashless exchange across India.
          </p>
        </div>

        {/* Search & Mobile Filter Toggle Bar */}
        <div className="bg-white p-4 rounded-2xl border border-forest/10 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, brand, fabric..."
              className="w-full text-xs bg-ivory border border-forest/20 rounded-full pl-10 pr-4 py-2.5 text-charcoal focus:outline-none focus:border-forest"
            />
            <Search className="w-4 h-4 text-charcoal/50 absolute left-3.5 top-3" />
            <button
              type="submit"
              className="ml-2 px-4 py-2 bg-forest text-white rounded-full text-xs font-semibold hover:bg-forest-light"
            >
              Search
            </button>
          </form>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-end">
            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-charcoal/70 hidden sm:inline">Sort:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
                className="text-xs bg-ivory border border-forest/20 rounded-xl px-3 py-2 text-charcoal focus:outline-none focus:border-forest font-medium"
              >
                <option value="newest">Newest First</option>
                <option value="value_asc">Swap Value: Low to High</option>
                <option value="value_desc">Swap Value: High to Low</option>
                <option value="popular">Most Viewed</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-1.5 px-4 py-2 bg-ivory text-charcoal text-xs font-semibold rounded-xl border border-forest/15"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Main Layout: Filters Sidebar + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-forest/10 shadow-sm space-y-6 h-fit sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-ivory">
              <div className="flex items-center space-x-2 text-forest">
                <SlidersHorizontal className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Refine Wardrobe</h3>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-semibold text-earth hover:underline flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5 text-charcoal"
              >
                <option value="all">All Categories</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="ethnic_wear">Ethnic Wear</option>
                <option value="shoes">Shoes</option>
                <option value="accessories">Accessories</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            {/* Size */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Size</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['all', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => { setSize(sz); setPage(1); }}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      size === sz
                        ? 'bg-forest text-white border-forest'
                        : 'bg-ivory text-charcoal border-forest/10 hover:border-forest/30'
                    }`}
                  >
                    {sz === 'all' ? 'All' : sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Condition</label>
              <select
                value={condition}
                onChange={(e) => { setCondition(e.target.value); setPage(1); }}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5 text-charcoal"
              >
                <option value="all">Any Condition</option>
                <option value="new_with_tags">New with tags</option>
                <option value="like_new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            {/* Location / City */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Delhi, Pune..."
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5 text-charcoal"
              />
            </div>

            {/* Estimated Swap Value Range */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">
                Swap Value (₹ INR)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minVal}
                  onChange={(e) => setMinVal(e.target.value)}
                  className="w-1/2 text-xs bg-ivory border border-forest/20 rounded-xl p-2 text-charcoal"
                />
                <span className="text-charcoal/40 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxVal}
                  onChange={(e) => setMaxVal(e.target.value)}
                  className="w-1/2 text-xs bg-ivory border border-forest/20 rounded-xl p-2 text-charcoal"
                />
              </div>
              <button
                onClick={() => { setPage(1); fetchListings(); }}
                className="w-full mt-2 py-1.5 bg-forest/10 hover:bg-forest text-forest hover:text-white rounded-lg text-xs font-semibold transition-all"
              >
                Apply Range
              </button>
            </div>

            {/* Handover Preference */}
            <div>
              <label className="block text-xs font-bold text-charcoal uppercase tracking-wider mb-2">Exchange Method</label>
              <select
                value={exchangePreference}
                onChange={(e) => { setExchangePreference(e.target.value); setPage(1); }}
                className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5 text-charcoal"
              >
                <option value="all">Any Handover</option>
                <option value="in_person">In-Person Only</option>
                <option value="courier">Courier Only</option>
              </select>
            </div>

          </aside>

          {/* Listings Grid Area */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 rounded-2xl bg-ivory animate-pulse"></div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-forest/10 p-8">
                <PackageOpen className="w-12 h-12 text-forest/40 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-charcoal">No Clothes Match Your Filters</h3>
                <p className="text-xs text-charcoal/70 mt-1 max-w-sm mx-auto">
                  Try widening your search terms, resetting filters, or listing a garment yourself to kickstart swapping in your city.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-6 py-2.5 bg-forest text-white rounded-full text-xs font-semibold hover:bg-forest-light"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item) => (
                    <ListingCard
                      key={item._id}
                      listing={item}
                      onSwapClick={handleSwapClick}
                    />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pages > 1 && (
                  <div className="mt-12 flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                      className="p-2 rounded-xl bg-white border border-forest/15 text-charcoal disabled:opacity-40 hover:bg-ivory"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {[...Array(pages)].map((_, idx) => {
                      const pageNumber = idx + 1;
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setPage(pageNumber)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                            page === pageNumber
                              ? 'bg-forest text-white shadow-sm'
                              : 'bg-white border border-forest/15 text-charcoal hover:bg-ivory'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}

                    <button
                      onClick={() => setPage((p) => Math.min(p + 1, pages))}
                      disabled={page === pages}
                      className="p-2 rounded-xl bg-white border border-forest/15 text-charcoal disabled:opacity-40 hover:bg-ivory"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </main>

        </div>

      </div>

      {/* Mobile Drawer Filter */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-sm h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-ivory">
                <h3 className="font-serif text-lg font-bold text-charcoal">Filter Wardrobe</h3>
                <button onClick={() => setMobileFilterOpen(false)} className="p-2 text-charcoal/60">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5"
                  >
                    <option value="all">All Categories</option>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="ethnic_wear">Ethnic Wear</option>
                    <option value="shoes">Shoes</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Delhi"
                    className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-2.5"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-ivory flex space-x-3">
              <button
                onClick={handleClearFilters}
                className="w-1/2 py-2.5 rounded-full border border-forest/20 text-xs font-medium"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  setMobileFilterOpen(false);
                  setPage(1);
                  fetchListings();
                }}
                className="w-1/2 py-2.5 rounded-full bg-forest text-white text-xs font-semibold"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Request Modal */}
      <SwapModal
        targetListing={selectedTargetItem}
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
      />

    </div>
  );
};

