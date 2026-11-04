import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Heart,
  User as UserIcon,
  PlusCircle,
  Repeat,
  MessageSquare,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/listings?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchInput(false);
      setSearchQuery('');
    }
  };

  const categories = [
    { name: 'Women', path: '/listings?category=women' },
    { name: 'Men', path: '/listings?category=men' },
    { name: 'Ethnic Wear', path: '/listings?category=ethnic_wear' },
    { name: 'Shoes', path: '/listings?category=shoes' },
    { name: 'Accessories', path: '/listings?category=accessories' },
    { name: 'Discover', path: '/listings' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-nav transition-luxury">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 group">
              <span className="w-10 h-10 rounded-full bg-forest text-ivory flex items-center justify-center font-serif text-xl font-bold shadow-sm group-hover:bg-forest-light transition-all">
                R
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-forest">
                Re<span className="text-earth italic font-normal">Wear</span>
              </span>
            </Link>
          </div>

          {/* Center Navigation Categories */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-medium tracking-wide">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="text-charcoal hover:text-forest transition-colors py-1 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-forest hover:after:w-full after:transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Right Action Icons & Primary CTA */}
          <div className="flex items-center space-x-4">
            
            {/* Search Input / Icon */}
            <div className="relative">
              {showSearchInput ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search styles, brands..."
                    autoFocus
                    className="w-48 sm:w-64 text-sm bg-white/90 border border-forest/20 rounded-full px-4 py-1.5 focus:outline-none focus:border-forest text-charcoal shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSearchInput(false)}
                    className="ml-2 text-charcoal/60 hover:text-charcoal text-xs"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-2 text-charcoal hover:text-forest transition-colors rounded-full hover:bg-forest/5"
                  title="Search items"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Wishlist Link */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/dashboard?tab=wishlist"
                className="p-2 text-charcoal hover:text-forest transition-colors relative rounded-full hover:bg-forest/5"
                title="Saved Items"
              >
                <Heart className="w-5 h-5" />
                {user?.wishlist?.length > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-earth text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {user.wishlist.length}
                  </span>
                )}
              </Link>
            )}

            {/* Swap Requests Link */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/swaps"
                className="p-2 text-charcoal hover:text-forest transition-colors rounded-full hover:bg-forest/5"
                title="Swap Requests"
              >
                <Repeat className="w-5 h-5" />
              </Link>
            )}

            {/* Messages / Chat Link */}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/chat"
                className="p-2 text-charcoal hover:text-forest transition-colors rounded-full hover:bg-forest/5"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
              </Link>
            )}

            {/* User Profile / Login Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1 rounded-full border border-forest/15 hover:border-forest transition-all"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="hidden md:inline-block text-xs font-medium text-charcoal pr-2">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-float border border-forest/10 py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-ivory">
                      <p className="text-xs font-semibold text-charcoal truncate">{user.name}</p>
                      <p className="text-[11px] text-charcoal/60 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sage-light text-forest">
                        {user.role}
                      </span>
                    </div>

                    {!isAdmin ? (
                      <>
                        <Link
                          to="/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs text-charcoal hover:bg-ivory hover:text-forest"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>My Wardrobe & Swaps</span>
                        </Link>
                        <Link
                          to="/create-listing"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center space-x-2.5 px-4 py-2.5 text-xs text-charcoal hover:bg-ivory hover:text-forest"
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>List a New Item</span>
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2.5 px-4 py-2.5 text-xs text-forest font-semibold hover:bg-forest/5"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <span>Admin Command Center</span>
                      </Link>
                    )}

                    <div className="border-t border-ivory mt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="text-xs font-medium text-forest hover:text-charcoal px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Primary Action CTA: List an Item */}
            <Link
              to="/create-listing"
              className="inline-flex items-center space-x-1.5 bg-forest text-ivory text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-forest-light shadow-sm transition-all hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List an Item</span>
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-charcoal hover:text-forest"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 border-t border-forest/10 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-3 border-b border-ivory">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-medium text-charcoal hover:text-forest py-1.5 px-2 rounded-lg hover:bg-ivory"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-medium text-charcoal py-1.5"
                >
                  My Wardrobe Dashboard
                </Link>
                <Link
                  to="/swaps"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-medium text-charcoal py-1.5"
                >
                  My Swap Requests
                </Link>
                <Link
                  to="/chat"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xs font-medium text-charcoal py-1.5"
                >
                  Negotiation Chat
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="text-xs text-red-600 font-medium text-left py-1.5"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex space-x-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-medium border border-forest text-forest rounded-full"
                >
                  Customer Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-medium bg-forest text-white rounded-full"
                >
                  Join ReWear
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

