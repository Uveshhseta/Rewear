import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, RefreshCw, HeartHandshake, Lock } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-forest text-ivory pt-16 pb-12 border-t border-forest-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Core Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-white/10">
          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-full bg-white/10 text-sage">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white">Zero Monetary Waste</h4>
              <p className="text-xs text-ivory/70 mt-1 leading-relaxed">
                100% peer-to-peer wardrobe swapping. Zero monetary markups, keeping garments in continuous circulation.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-full bg-white/10 text-sage">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white">Smart Value Parity</h4>
              <p className="text-xs text-ivory/70 mt-1 leading-relaxed">
                Our rule-based calculator assesses fabric, brand, and condition to ensure equitable and transparent trades.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5">
            <div className="p-2.5 rounded-full bg-white/10 text-sage">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold tracking-wide text-white">Community Moderated</h4>
              <p className="text-xs text-ivory/70 mt-1 leading-relaxed">
                Active dispute moderation, in-person safety protocols, and courier tracking verification.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 py-12">

          {/* Brand Info */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center space-x-2">
              <span className="w-9 h-9 rounded-full bg-ivory text-forest flex items-center justify-center font-serif text-lg font-bold">
                R
              </span>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Re<span className="text-earth-light italic font-normal">Wear</span>
              </span>
            </Link>
            <p className="text-xs text-ivory/80 mt-4 max-w-sm leading-relaxed">
              Unified Mentor Full-Stack Internship Capstone. Championing sustainable circular fashion across India by giving pre-loved garments new lives.
            </p>
            <div className="mt-4 flex items-center space-x-2 text-xs text-sage">
              <HeartHandshake className="w-4 h-4" />
              <span>Dedicated to zero textile landfill waste.</span>
            </div>
          </div>

          {/* Wardrobe Categories */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-sage mb-3">Wardrobe</h5>
            <ul className="space-y-2 text-xs text-ivory/80">
              <li><Link to="/listings?category=women" className="hover:text-white transition-colors">Women's Collection</Link></li>
              <li><Link to="/listings?category=men" className="hover:text-white transition-colors">Men's Wardrobe</Link></li>
              <li><Link to="/listings?category=ethnic_wear" className="hover:text-white transition-colors">Ethnic & Handloom</Link></li>
              <li><Link to="/listings?category=shoes" className="hover:text-white transition-colors">Footwear & Sneakers</Link></li>
              <li><Link to="/listings?category=accessories" className="hover:text-white transition-colors">Bags & Accessories</Link></li>
            </ul>
          </div>

          {/* Platform & Tools */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-sage mb-3">Platform</h5>
            <ul className="space-y-2 text-xs text-ivory/80">
              <li><Link to="/calculator" className="hover:text-white transition-colors">Swap Value Calculator</Link></li>
              <li><Link to="/listings" className="hover:text-white transition-colors">Explore All Pieces</Link></li>
              <li><Link to="/create-listing" className="hover:text-white transition-colors">List a Garment</Link></li>
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Customer Dashboard</Link></li>
            </ul>
          </div>

          {/* Hubs & Cities */}
          <div>
            <h5 className="text-xs font-semibold uppercase tracking-wider text-sage mb-3">Active Hubs</h5>
            <ul className="space-y-2 text-xs text-ivory/80">
              <li><Link to="/listings?city=Mumbai" className="hover:text-white transition-colors">Mumbai Circle</Link></li>
              <li><Link to="/listings?city=Delhi" className="hover:text-white transition-colors">Delhi NCR</Link></li>
              <li><Link to="/listings?city=Bengaluru" className="hover:text-white transition-colors">Bengaluru</Link></li>
              <li><Link to="/listings?city=Pune" className="hover:text-white transition-colors">Pune Community</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar with Admin Portal Access */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ivory/60">
          <p>© {new Date().getFullYear()} ReWear Marketplace.</p>

          <div className="flex items-center space-x-6 mt-4 sm:mt-0">
            <span>Sustainable Fashion Protocol</span>
            <span>Zero Monetary Fees</span>
            {/* Discreet Admin Login route for administrative auditors */}
            <Link
              to="/admin/login"
              className="flex items-center space-x-1.5 text-sage/80 hover:text-white hover:underline transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Portal</span>
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

