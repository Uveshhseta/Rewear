import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize and check current authentication state
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('rewear_token');
        if (!token) {
          setLoading(false);
          return;
        }

        const res = await api.get('/api/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
        } else {
          localStorage.removeItem('rewear_token');
          localStorage.removeItem('rewear_user');
          setUser(null);
        }
      } catch (err) {
        localStorage.removeItem('rewear_token');
        localStorage.removeItem('rewear_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Customer Login
  const loginCustomer = async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('rewear_token', res.data.token);
      localStorage.setItem('rewear_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  // Administrator Login (Separate endpoint & validation)
  const loginAdmin = async (email, password) => {
    const res = await api.post('/api/auth/admin/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('rewear_token', res.data.token);
      localStorage.setItem('rewear_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  // Customer Registration
  const registerCustomer = async (data) => {
    const res = await api.post('/api/auth/register', data);
    if (res.data.success) {
      localStorage.setItem('rewear_token', res.data.token);
      localStorage.setItem('rewear_user', JSON.stringify(res.data.user));
      setUser(res.data.user);
    }
    return res.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (err) {
      // Continue client cleanup even if request fails
    } finally {
      localStorage.removeItem('rewear_token');
      localStorage.removeItem('rewear_user');
      setUser(null);
    }
  };

  // Update profile in state
  const updateUserData = (updatedFields) => {
    setUser((prev) => {
      const nextUser = { ...prev, ...updatedFields };
      localStorage.setItem('rewear_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  // Wishlist toggle
  const toggleWishlist = async (listingId) => {
    if (!user) return false;
    try {
      const res = await api.post(`/api/listings/${listingId}/wishlist`);
      if (res.data.success) {
        setUser((prev) => {
          const nextWishlist = res.data.wishlist;
          const nextUser = { ...prev, wishlist: nextWishlist };
          localStorage.setItem('rewear_user', JSON.stringify(nextUser));
          return nextUser;
        });
        return res.data.isWishlisted;
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loginCustomer,
        loginAdmin,
        registerCustomer,
        logout,
        updateUserData,
        toggleWishlist,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

