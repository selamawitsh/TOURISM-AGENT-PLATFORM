import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  
  const [status, setStatus] = useState('verifying'); 
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const handleVerification = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        // Countdown to redirect
        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              navigate('/dashboard');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. The token may be invalid or expired.');
      }
    };

    handleVerification();
  }, [searchParams, verifyEmail, navigate]);

  if (status === 'verifying') {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Verifying your email...</h2>
          <p className="text-gray-600 mt-2">Please wait while we confirm your email address.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Email Verified!</h2>
          <p className="text-gray-600 mb-4">{message}</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard in {countdown} seconds...</p>
          <Link to="/dashboard" className="mt-4 inline-block text-blue-600 hover:underline">
            Go to Dashboard now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Failed</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="space-y-3">
          <Link
            to="/resend-verification"
            className="block w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Request New Verification Email
          </Link>
          <Link
            to="/login"
            className="block w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;