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

        const interval = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              navigate('/', { replace: true });
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
        <div className="rounded-[2rem] bg-white p-10 shadow-2xl text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-sky-600 mx-auto"></div>
          <h2 className="mt-6 text-2xl font-semibold text-slate-900">Verifying your email…</h2>
          <p className="mt-3 text-slate-600">Please wait while we confirm your email address.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
        <div className="rounded-[2rem] bg-white p-10 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-900">Email Verified!</h2>
          <p className="mt-3 text-slate-600">{message}</p>
          <p className="mt-4 text-sm text-slate-500">Redirecting to dashboard in {countdown} seconds...</p>
          <Link to="/customer/dashboard" className="mt-6 inline-block rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-700 transition">
            Go to Dashboard now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-20">
      <div className="rounded-[2rem] bg-white p-10 shadow-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-700 shadow-sm">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-slate-900">Verification Failed</h2>
        <p className="mt-3 text-slate-600">{message}</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            to="/resend-verification"
            className="rounded-2xl bg-sky-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-700 transition"
          >
            Request New Verification Email
          </Link>
          <Link
            to="/login"
            className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
