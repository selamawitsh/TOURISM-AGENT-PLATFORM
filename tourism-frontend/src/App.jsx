import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
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
import ManageDestinations from './pages/admin/ManageDestinations';

// Booking pages
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import AdminBookings from './pages/admin/AdminBookings';

function App() {
  return (
    <Router>
      <AuthProvider>
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
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:slug" element={<DestinationDetail />} />
            
            {/* Booking Routes (Protected) */}
            <Route path="/book/:id" element={<ProtectedRoute><Booking /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            
            {/* Profile Route */}
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/destinations" element={<ProtectedRoute allowedRoles={['admin']}><ManageDestinations /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
            
            {/* Role-based Dashboard Routes */}
            <Route path="/customer/dashboard" element={<ProtectedRoute allowedRoles={['customer','agent','admin']}><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={['agent','admin']}><AgentDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            
            {/* Default redirect */}
            <Route path="/dashboard" element={<RoleRedirect />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}

export default App;