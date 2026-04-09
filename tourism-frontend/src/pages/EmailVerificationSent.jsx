import React from 'react';
import { Link } from 'react-router-dom';

const EmailVerificationSent = () => {
  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
        <p className="text-gray-600 mb-6">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Didn't receive the email? Check your spam folder or{' '}
            <Link to="/resend-verification" className="text-blue-600 hover:underline">
              request a new one
            </Link>
          </p>
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

export default EmailVerificationSent;