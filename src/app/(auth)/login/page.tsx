'use client';

import { useState, useEffect, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered')) setInfo('Account created! You can now sign in.');
    if (searchParams.get('error') === 'OAuthAccountNotLinked') {
      setError('This email is already registered with a password. Please sign in with your email and password.');
    }
  }, [searchParams]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid || !password) { setError('Please enter a valid email and password.'); return; }
    setError(''); setInfo(''); setLoading(true);
    try {
      const result = await signIn('credentials', { email, password, redirect: false });
      if (result?.error) {
        setError('Invalid email or password. Please try again.');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    setError('');
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="5" width="20" height="14" rx="2" /><path d="M16 10h2M16 14h2M6 10h6M6 14h4" />
              </svg>
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">LynQ</span>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Your digital card,<br />always in your pocket.
            </h2>
            <p className="text-white/75 text-lg">
              Share your contact with a tap, track every lead, and book meetings — all from one beautiful card.
            </p>
          </div>

          <div className="space-y-3">
            {[
              'QR code + NFC digital business cards',
              'AI secretary that captures leads automatically',
              'Calendar booking built right in',
              'Stripe-powered subscriptions',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-white/90 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {feat}
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-white/50 text-xs">
          © {new Date().getFullYear()} LynQ. Built for modern professionals.
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="2" y="5" width="20" height="14" rx="2" />
              </svg>
            </div>
            <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">LynQ</span>
          </div>

          <h1 className="text-2xl font-extrabold text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground text-sm mb-8">Sign in to your account</p>

          {/* Banners */}
          {info && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {info}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-red-400 text-sm">
              <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
              {error}
            </div>
          )}

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-secondary border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-all disabled:opacity-60"
          >
            {googleLoading ? (
              <svg className="w-5 h-5 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : <GoogleIcon />}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or sign in with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setEmailTouched(true)}
                placeholder="you@company.com"
                autoComplete="email"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-background text-foreground placeholder:text-muted-foreground
                  ${emailTouched && email && !emailValid
                    ? 'border-destructive/50 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                    : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
              />
              {emailTouched && email && !emailValid && (
                <p className="mt-1 text-xs text-red-400">Please enter a valid email address</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground/80">Password</label>
                <Link href="/forgot-password" className="text-xs text-primary hover:text-primary/80 font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm transition-colors outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:text-primary/80">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginForm />
    </Suspense>
  );
}
