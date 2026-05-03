import React, { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { FeatureContext } from './contexts/FeatureContext'; // Updated import
import ProtectedRoute from './components/ProtectedRoute';
import FeatureGuard from './components/FeatureGuard'; // Updated import
import Layout from './components/Layout';
import RoleRedirect from './components/RoleRedirect';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResendVerification from './pages/ResendVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CustomerDashboard from './pages/customer/Dashboard';
import AgentDashboard from './pages/agent/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import Profile from './pages/Profile';
import UserManagement from './pages/admin/UserManagement';

// Destination pages
import Destinations from './pages/Destinations';
import DestinationDetail from './pages/DestinationDetail';
import About from './pages/About';
import Guides from './pages/Guides';
import Tours from './pages/Tours';
import Cultures from './pages/Cultures';
import ManageDestinations from './pages/admin/ManageDestinations';

// Booking pages
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import AdminBookings from './components/admin/AdminBookings';

// favorites page
import Favorites from './pages/Favorites';

// Reviews page
import MyReviews from './pages/MyReviews';

// Booking confirmation page
import BookingConfirmation from './pages/BookingConfirmation';

// Analytics pages
import AdminAnalytics from './pages/admin/AdminAnalytics';
import rateLimitedFetch from './utils/rateLimitedFetch';

function App() {
  const [featuresData, setFeaturesData] = useState({});
  const [loadingFeatures, setLoadingFeatures] = useState(true);
  const [featureError, setFeatureError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const base = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8080/api/v1';

    const featuresToLoad = [
      { name: 'gatewayInfo', path: '/health' },
      { name: 'categories', path: '/destinations/categories' },
      { name: 'featuredDestinations', path: '/destinations/featured?limit=6' },
    ];

    (async () => {
      for (const feature of featuresToLoad) {
        if (cancelled) return;
        
        try {
          const url = `${base}${feature.path}`;
          const res = await rateLimitedFetch(url, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }
          
          const json = await res.json();
          if (cancelled) return;
          setFeaturesData((prev) => ({ ...prev, [feature.name]: json }));
        } catch (err) {
          console.error('Feature load failed', feature.name, err);
          if (!cancelled) {
            setFeaturesData((prev) => ({ ...prev, [feature.name]: null }));
            setFeatureError(err.message);
          }
        }
        // wait 1s between each feature load
        await new Promise((r) => setTimeout(r, 1000));
      }
      if (!cancelled) setLoadingFeatures(false);
    })();

    return () => { cancelled = true; };
  }, []);

  const contextValue = useMemo(() => ({ 
    featuresData, 
    loadingFeatures, 
    featureError 
  }), [featuresData, loadingFeatures, featureError]);

  return (
    <Router>
      <AuthProvider>
        <FeatureContext.Provider value={contextValue}>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/resend-verification" element={<ResendVerification />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Destination Routes (Public) */}
              <Route path="/destinations" element={
                <FeatureGuard features={['categories', 'featuredDestinations']} featuresData={featuresData}>
                  <Destinations />
                </FeatureGuard>
              } />
              <Route path="/destinations/:slug" element={
                <FeatureGuard features={['categories']} featuresData={featuresData}>
                  <DestinationDetail />
                </FeatureGuard>
              } />

              {/* Static preview pages (do not call backend) */}
              <Route path="/about" element={<About />} />
              <Route path="/guides" element={<Guides />} />
              <Route path="/tours" element={<Tours />} />
              <Route path="/cultures" element={<Cultures />} />
              
              {/* Booking Routes (Protected) */}
              <Route path="/book/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
              <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
              <Route path="/payment/confirmation" element={<ProtectedRoute><BookingConfirmation /></ProtectedRoute>} />
              
              {/* Profile Route */}
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/destinations" element={<ProtectedRoute allowedRoles={['admin']}><ManageDestinations /></ProtectedRoute>} />
              <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
              
              {/* Role-based Dashboard Routes */}
              <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer', 'agent', 'admin']}><CustomerDashboard /></ProtectedRoute>} />
              <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={['agent', 'admin']}><AgentDashboard /></ProtectedRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              
              {/* Favorites & Reviews */}
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/my-reviews" element={<ProtectedRoute><MyReviews /></ProtectedRoute>} />
              
              {/* Default redirect */}
              <Route path="/dashboard" element={<RoleRedirect />} />
            </Routes>
          </Layout>
        </FeatureContext.Provider>
      </AuthProvider>
    </Router>
  );
}

export default App;