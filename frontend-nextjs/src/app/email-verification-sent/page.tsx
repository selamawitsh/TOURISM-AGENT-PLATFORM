import Link from 'next/link';

export default function EmailVerificationSentPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 flex items-center">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-700 shadow-sm">
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-slate-950">Check your email</h2>
          <p className="mt-3 text-slate-600">We sent a verification link to your inbox. Click it to confirm your account.</p>
          <div className="mt-8 space-y-4">
            <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
              Didn't receive the email? Check your spam folder or{' '}
              <Link href="/resend-verification" className="font-semibold text-sky-600 hover:text-sky-700">request a new one</Link>.
            </div>
            <Link href="/auth/login" className="inline-flex w-full items-center justify-center rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-700">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
