
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuth();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'verifying' : 'error');
  const [message, setMessage] = useState(token ? '' : 'No verification token provided');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!token) return undefined;

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
  }, [navigate, token, verifyEmail]);

  if (status === 'verifying') {
    return (
      <div className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-2xl overflow-hidden bg-[linear-gradient(145deg,rgba(19,57,45,0.98),rgba(43,87,68,0.92)_54%,rgba(166,75,34,0.94))] text-white">
          <div className="ethiopian-stripe h-1 w-full" />
          <CardHeader className="items-center text-center">
            <Badge variant="gold" className="border-white/10 bg-white/10 text-amber-100">
              Verification in progress
            </Badge>
            <CardTitle className="text-white">Verifying your email</CardTitle>
            <CardDescription className="text-white/72">
              Please wait while we confirm your Ethiopian journey account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-10">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-b-2 border-white/90" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-2xl overflow-hidden bg-white/95 text-center">
          <div className="ethiopian-stripe h-1 w-full" />
          <CardHeader className="items-center">
            <Badge variant="success">Verified</Badge>
            <div className="grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 shadow-sm">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle>Email verified</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-slate-500">Redirecting to homepage in {countdown} seconds...</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button asChild><Link to="/">Back to home</Link></Button>
              <Button asChild variant="secondary"><Link to="/login">Login</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-2xl overflow-hidden bg-white/95 text-center">
        <div className="ethiopian-stripe h-1 w-full" />
        <CardHeader className="items-center">
          <Badge variant="accent">Verification failed</Badge>
          <div className="grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-700 shadow-sm">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <CardTitle>Verification failed</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <Button asChild><Link to="/resend-verification">Request new link</Link></Button>
          <Button asChild variant="secondary"><Link to="/login">Back to login</Link></Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyEmail;
