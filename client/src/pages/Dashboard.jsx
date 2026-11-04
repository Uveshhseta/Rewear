import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Repeat,
  Heart,
  User as UserIcon,
  PlusCircle,
  Edit3,
  Trash2,
  MapPin,
  CheckCircle2,
  Clock,
  Sparkles,
  Settings,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { ListingCard } from '../components/listing/ListingCard';

export const Dashboard = () => {
  const { user, logout, updateUserData, toggleWishlist } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'wardrobe'; // wardrobe, wishlist, swaps, settings

  const [myListings, setMyListings] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Profile edit states
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [postalCode, setPostalCode] = useState(user?.postalCode || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Fetch user wardrobe & wishlist
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [listingsRes, profileRes] = await Promise.all([
        api.get(`/api/listings?owner=${user._id}`),
        api.get('/api/auth/me'),
      ]);

      if (listingsRes.data.success) {
        setMyListings(listingsRes.data.listings);
      }
      if (profileRes.data.success) {
        setWishlistItems(profileRes.data.user.wishlist || []);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to remove this garment from your wardrobe?')) return;

    try {
      const res = await api.delete(`/api/listings/${listingId}`);
      if (res.data.success) {
        setMyListings((prev) => prev.filter((item) => item._id !== listingId));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess('');
    setProfileError('');

    try {
      const res = await api.put('/api/auth/profile', {
        name,
        bio,
        city,
        postalCode,
        phone,
        avatar,
      });

      if (res.data.success) {
        updateUserData(res.data.user);
        setProfileSuccess('Profile updated successfully.');
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ivory-light py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Welcome Hero Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-forest/10 shadow-float mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={user?.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-forest/20 shadow-sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">{user?.name}</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-sage-light text-forest">
                  Verified Swapper
                </span>
              </div>
              <p className="text-xs text-charcoal/70 flex items-center mt-1">
                <MapPin className="w-3.5 h-3.5 text-earth mr-1" />
                {user?.city} • Member since {new Date(user?.createdAt || Date.now()).getFullYear()}
              </p>
              <p className="text-xs text-charcoal/80 mt-2 max-w-lg italic line-clamp-2">
                "{user?.bio || 'Conscious fashion lover swapping clothes to promote circular style.'}"
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto">
            <Link
              to="/create-listing"
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1.5 px-6 py-3 rounded-full bg-forest text-white text-xs font-semibold hover:bg-forest-light shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List a Garment</span>
            </Link>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="p-3 rounded-full border border-forest/15 hover:bg-red-50 text-charcoal hover:text-red-600 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-forest/10 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60 block">
              My Wardrobe Items
            </span>
            <span className="font-serif text-3xl font-bold text-forest mt-1 block">
              {myListings.length}
            </span>
            <span className="text-[11px] text-charcoal/50">Pieces listed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-forest/10 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60 block">
              Active Swaps
            </span>
            <span className="font-serif text-3xl font-bold text-forest mt-1 block">
              {myListings.filter((i) => i.status === 'in_swap').length}
            </span>
            <span className="text-[11px] text-charcoal/50">In negotiation</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-forest/10 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60 block">
              Completed Swaps
            </span>
            <span className="font-serif text-3xl font-bold text-forest mt-1 block">
              {myListings.filter((i) => i.status === 'swapped').length}
            </span>
            <span className="text-[11px] text-charcoal/50">Recirculated pieces</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-forest/10 shadow-sm">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/60 block">
              Saved Items
            </span>
            <span className="font-serif text-3xl font-bold text-forest mt-1 block">
              {wishlistItems.length}
            </span>
            <span className="text-[11px] text-charcoal/50">Wishlist pieces</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-3 border-b border-forest/15 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setSearchParams({ tab: 'wardrobe' })}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'wardrobe'
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white text-charcoal border border-forest/15 hover:bg-ivory'
            }`}
          >
            My Wardrobe ({myListings.length})
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'wishlist' })}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'wishlist'
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white text-charcoal border border-forest/15 hover:bg-ivory'
            }`}
          >
            Wishlist ({wishlistItems.length})
          </button>

          <button
            onClick={() => navigate('/swaps')}
            className="px-5 py-2.5 rounded-full text-xs font-bold bg-white text-charcoal border border-forest/15 hover:bg-ivory"
          >
            Swap Requests Portal →
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'settings' })}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'settings'
                ? 'bg-forest text-white shadow-sm'
                : 'bg-white text-charcoal border border-forest/15 hover:bg-ivory'
            }`}
          >
            Account Settings
          </button>
        </div>

        {/* Tab 1: Wardrobe */}
        {activeTab === 'wardrobe' && (
          <div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl bg-ivory animate-pulse"></div>
                ))}
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-forest/10 p-8">
                <Package className="w-12 h-12 text-forest/40 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-charcoal">Your Wardrobe is Empty</h3>
                <p className="text-xs text-charcoal/70 mt-1 max-w-sm mx-auto">
                  List pieces you no longer wear to earn swap credits and propose trades with other members.
                </p>
                <Link
                  to="/create-listing"
                  className="mt-4 inline-block px-6 py-2.5 bg-forest text-white rounded-full text-xs font-semibold"
                >
                  List Your First Garment
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl border border-forest/10 overflow-hidden shadow-sm flex flex-col justify-between"
                  >
                    <div className="relative aspect-[4/3] bg-ivory">
                      <img
                        src={item.images?.[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-forest text-white">
                        {item.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-charcoal/60 mb-1">
                          <span className="font-semibold uppercase text-forest">{item.brand}</span>
                          <span className="font-bold">Size {item.size}</span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-charcoal truncate">
                          {item.title}
                        </h4>
                        <p className="text-xs font-bold text-forest mt-1">
                          Swap Value: ₹{item.estimatedSwapValue?.toLocaleString('en-IN')}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-ivory flex items-center justify-between">
                        <Link
                          to={`/listings/${item._id}/edit`}
                          className="text-xs font-semibold text-forest hover:underline flex items-center space-x-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>

                        <button
                          onClick={() => handleDeleteListing(item._id)}
                          className="text-xs font-semibold text-red-600 hover:underline flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-forest/10 p-8">
                <Heart className="w-12 h-12 text-forest/40 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-bold text-charcoal">No Saved Pieces</h3>
                <p className="text-xs text-charcoal/70 mt-1 max-w-sm mx-auto">
                  Click the heart icon on any garment in the marketplace to save it here for later.
                </p>
                <Link
                  to="/listings"
                  className="mt-4 inline-block px-6 py-2.5 bg-forest text-white rounded-full text-xs font-semibold"
                >
                  Explore Clothes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlistItems.map((item) => (
                  <div key={item._id} className="bg-white rounded-2xl border border-forest/10 overflow-hidden p-4 shadow-sm">
                    <img
                      src={item.images?.[0]}
                      alt={item.title}
                      className="w-full aspect-[3/4] object-cover rounded-xl mb-3"
                    />
                    <h4 className="font-serif text-sm font-bold text-charcoal truncate">{item.title}</h4>
                    <p className="text-xs font-bold text-forest mt-0.5">
                      ₹{item.estimatedSwapValue?.toLocaleString('en-IN')}
                    </p>
                    <div className="mt-3 pt-2 border-t border-ivory flex space-x-2">
                      <Link
                        to={`/listings/${item._id}`}
                        className="flex-1 py-1.5 bg-forest text-white rounded-xl text-center text-xs font-semibold"
                      >
                        View Piece
                      </Link>
                      <button
                        onClick={() => toggleWishlist(item._id)}
                        className="p-1.5 border border-forest/20 rounded-xl text-red-600 hover:bg-red-50 text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Account Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-forest/10 shadow-float max-w-2xl">
            <h3 className="font-serif text-xl font-bold text-charcoal mb-4">Edit Profile & City</h3>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-xs font-semibold">
                {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                {profileError}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase mb-1">Bio / Fashion Ethos</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal uppercase mb-1">PIN / Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="For handover coordination"
                  className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal uppercase mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full text-xs bg-ivory border border-forest/20 rounded-xl p-3"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-6 py-2.5 bg-forest text-white text-xs font-semibold rounded-full hover:bg-forest-light"
                >
                  {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

