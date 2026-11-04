import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AdminRoute } from './components/common/AdminRoute';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Public & Customer Pages
import { Home } from './pages/Home';
import { Listings } from './pages/Listings';
import { ListingDetails } from './pages/ListingDetails';
import { CreateListing } from './pages/CreateListing';
import { EditListing } from './pages/EditListing';
import { Swaps } from './pages/Swaps';
import { Chat } from './pages/Chat';
import { Dashboard } from './pages/Dashboard';
import { CalculatorPage } from './pages/Calculator';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';

// Administrator Portal Pages
import { AdminLogin } from './pages/AdminLogin';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminListings } from './pages/admin/AdminListings';
import { AdminSwaps } from './pages/admin/AdminSwaps';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminAnalytics } from './pages/admin/AdminAnalytics';

// Public Layout Wrapper with Navbar & Footer
const MainLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public & Customer Marketplace Routes */}
          <Route
            path="/"
            element={
              <MainLayout>
                <Home />
              </MainLayout>
            }
          />
          <Route
            path="/listings"
            element={
              <MainLayout>
                <Listings />
              </MainLayout>
            }
          />
          <Route
            path="/listings/:id"
            element={
              <MainLayout>
                <ListingDetails />
              </MainLayout>
            }
          />
          <Route
            path="/calculator"
            element={
              <MainLayout>
                <CalculatorPage />
              </MainLayout>
            }
          />

          {/* Customer Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Customer Routes */}
          <Route
            path="/create-listing"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CreateListing />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/listings/:id/edit"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <EditListing />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/swaps"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Swaps />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Chat />
                </MainLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* DEDICATED SEPARATE ADMINISTRATOR AUTHENTICATION */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* PROTECTED ADMINISTRATOR COMMAND CENTER */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="swaps" element={<AdminSwaps />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          {/* 404 Catch All */}
          <Route
            path="*"
            element={
              <MainLayout>
                <div className="py-24 text-center">
                  <h1 className="font-serif text-4xl font-bold text-forest">404 — Page Not Found</h1>
                  <p className="text-xs text-charcoal/70 mt-2">The page you requested does not exist.</p>
                  <a
                    href="/"
                    className="mt-4 inline-block px-6 py-2.5 bg-forest text-white text-xs font-semibold rounded-full"
                  >
                    Return Home
                  </a>
                </div>
              </MainLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

