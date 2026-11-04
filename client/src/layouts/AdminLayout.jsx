import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Repeat,
  AlertTriangle,
  BarChart3,
  LogOut,
  ExternalLink,
  ShieldAlert,
  Menu,
  X,
  Server,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Listing Moderation', path: '/admin/listings', icon: Package },
    { name: 'Swap Transactions', path: '/admin/swaps', icon: Repeat },
    { name: 'Reports & Disputes', path: '/admin/reports', icon: AlertTriangle },
    { name: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-charcoal text-ivory flex flex-col lg:flex-row selection:bg-sage selection:text-charcoal font-sans">
      
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-charcoal-dark border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-sage" />
          <span className="font-serif font-bold text-white text-base">ReWear Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-ivory/80 hover:text-white"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-charcoal-dark border-r border-white/10 flex flex-col justify-between transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand & Security Status */}
          <div className="p-6 border-b border-white/10">
            <Link to="/admin/dashboard" className="flex items-center space-x-2.5">
              <span className="w-9 h-9 rounded-xl bg-forest text-sage flex items-center justify-center font-serif text-lg font-bold border border-sage/30 shadow-md">
                R
              </span>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight text-white block">
                  ReWear <span className="text-sage italic font-normal text-xs font-mono">GOV</span>
                </span>
                <span className="text-[10px] font-mono text-sage tracking-widest uppercase">
                  Staff Command
                </span>
              </div>
            </Link>

            <div className="mt-4 px-3 py-1.5 rounded-xl bg-charcoal border border-white/10 flex items-center space-x-2 text-[10px] font-mono text-ivory/70">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Cluster: MongoDB 4.4</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-forest text-white shadow-md border border-sage/20 font-bold'
                        : 'text-ivory/70 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-sage" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: View Public Site & Logout */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-ivory text-xs font-medium transition-colors"
          >
            <span>Marketplace Frontend</span>
            <ExternalLink className="w-3.5 h-3.5 text-sage" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-950/40 text-xs font-medium transition-colors text-left"
          >
            <LogOut className="w-4 h-4" />
            <span>End Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Administrative Work Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* Admin Top Bar */}
        <header className="bg-charcoal border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-mono text-ivory/60">
            <Database className="w-3.5 h-3.5 text-sage" />
            <span>Live MongoDB Aggregation Engine</span>
          </div>

          <div className="flex items-center space-x-3">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover border border-sage/40"
            />
            <div className="hidden sm:block text-right">
              <span className="block text-xs font-bold text-white leading-none">{user?.name}</span>
              <span className="text-[10px] font-mono text-sage uppercase leading-none">
                Platform Moderator
              </span>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>

      </div>

    </div>
  );
};

