'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className ?? 'w-3 h-3'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function getPasswordStrength(password: string): {
  score: number; label: string; color: string; requirements: { text: string; met: boolean }[];
} {
  const requirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { text: 'One lowercase letter (a-z)', met: /[a-z]/.test(password) },
    { text: 'One number (0-9)', met: /[0-9]/.test(password) },
    { text: 'One special character (!@#$…)', met: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = requirements.filter((r) => r.met).length;
  const configs = [
    { label: '', color: '' },
    { label: 'Very weak', color: '#ef4444' },
    { label: 'Weak', color: '#f97316' },
    { label: 'Fair', color: '#f59e0b' },
    { label: 'Strong', color: '#22c55e' },
    { label: 'Very strong', color: '#16a34a' },
  ];
  return { score, ...configs[score], requirements };
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', companyName: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // OTP step
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer for resend cooldown
  const startCooldown = () => {
    setResendCooldown(60);
    const iv = setInterval(() => {
      setResendCooldown((c) => {
        if (c <= 1) { clearInterval(iv); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const blur = (field: string) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const strength = getPasswordStrength(form.password);
  const emailValid = validateEmail(form.email);

  const errors = {
    name: !form.name.trim() ? 'Full name is required' : form.name.trim().length < 2 ? 'Name must be at least 2 characters' : '',
    email: !form.email ? 'Email is required' : !emailValid ? 'Enter a valid email address' : '',
    companyName: !form.companyName.trim() ? 'Company name is required' : '',
    password: !form.password ? 'Password is required' : strength.score < 3 ? 'Password is too weak' : '',
  };

  const isValid = Object.values(errors).every((e) => !e) && agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, companyName: true, password: true });
    if (!isValid) { setError('Please fix the errors above.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create account');
      // Move to OTP step
      setOtpStep(true);
      startCooldown();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) { setOtpError('Please enter the 6-digit code.'); return; }
    setOtpError(''); setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      // Auto-login after verification
      const result = await signIn('credentials', { email: form.email, password: form.password, redirect: false });
      if (result?.ok) router.push('/dashboard');
      else router.push('/login?registered=true');
    } catch (err: any) {
      setOtpError(err.message || 'Something went wrong.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email }),
      });
      startCooldown();
    } catch {}
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    await signIn('google', { callbackUrl: '/dashboard' });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-600 via-purple-600 to-rose-500 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-16 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-800/30 rounded-full blur-3xl" />
        </div>

        <div className="relative flex items-center gap-3">
          <img src="/logo.png" alt="LynQ" className="w-9 h-9 object-contain rounded-xl" />
          <span className="text-xl font-extrabold text-white">LynQ</span>
        </div>

        <div className="relative">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Start for free.<br />Grow without limits.
          </h2>
          <p className="text-white/75 text-base mb-8">
            Join thousands of professionals sharing digital cards and capturing leads with LynQ.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '10k+', label: 'Active users' },
              { num: '500k+', label: 'Cards shared' },
              { num: '2M+', label: 'Leads captured' },
              { num: '99.9%', label: 'Uptime SLA' },
            ].map(({ num, label }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <p className="text-2xl font-extrabold text-white">{num}</p>
                <p className="text-white/70 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/40 text-xs">© {new Date().getFullYear()} LynQ</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-background overflow-y-auto">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <img src="/logo.png" alt="LynQ" className="w-8 h-8 object-contain" />
            <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">LynQ</span>
          </div>

          {/* ── OTP verification step ── */}
          {otpStep ? (
            <div>
              <div className="mb-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h1 className="text-2xl font-extrabold text-foreground mb-1">Check your email</h1>
                <p className="text-muted-foreground text-sm">
                  We sent a 6-digit code to<br/>
                  <span className="font-semibold text-foreground">{form.email}</span>
                </p>
              </div>

              {otpError && (
                <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-red-400 text-sm">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
                  {otpError}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Verification Code</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-center text-2xl font-bold tracking-[0.5em] placeholder:text-muted-foreground/40 placeholder:text-base placeholder:tracking-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otp.length !== 6}
                  className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-50"
                >
                  {otpLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Verifying…
                    </span>
                  ) : 'Verify Email'}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                Didn&apos;t receive it?{' '}
                <button
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0}
                  className="font-semibold text-primary hover:text-primary/80 disabled:text-muted-foreground disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                </button>
              </p>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Wrong email?{' '}
                <button onClick={() => { setOtpStep(false); setOtp(''); setOtpError(''); }} className="font-semibold text-primary hover:text-primary/80">
                  Go back
                </button>
              </p>
            </div>
          ) : (
            <>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">Create your account</h1>
          <p className="text-muted-foreground text-sm mb-6">Free forever. No credit card required.</p>

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
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-medium">or with email</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {[
              { field: 'name', label: 'Full Name', type: 'text', placeholder: 'Jane Smith', autoComplete: 'name' },
              { field: 'email', label: 'Work Email', type: 'email', placeholder: 'jane@company.com', autoComplete: 'email' },
              { field: 'companyName', label: 'Company Name', type: 'text', placeholder: 'Acme Inc.', autoComplete: 'organization' },
            ].map(({ field, label, type, placeholder, autoComplete }) => {
              const err = errors[field as keyof typeof errors];
              const hasErr = touched[field] && !!err;
              return (
                <div key={field}>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[field as keyof typeof form]}
                    onChange={set(field)}
                    onBlur={blur(field)}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors outline-none bg-background text-foreground placeholder:text-muted-foreground ${
                      hasErr
                        ? 'border-destructive/50 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                        : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                  {hasErr && <p className="mt-1 text-xs text-red-400">{err}</p>}
                </div>
              );
            })}

            {/* Password with strength meter */}
            <div>
              <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  onBlur={blur('password')}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm transition-colors outline-none bg-background text-foreground placeholder:text-muted-foreground ${
                    touched.password && errors.password
                      ? 'border-destructive/50 focus:border-destructive focus:ring-2 focus:ring-destructive/20'
                      : 'border-border focus:border-primary focus:ring-2 focus:ring-primary/20'
                  }`}
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

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1.5 rounded-full transition-all"
                        style={{ background: i <= strength.score ? strength.color : 'hsl(var(--border))' }}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className="text-xs font-medium" style={{ color: strength.color }}>{strength.label}</p>
                  )}

                  <ul className="mt-2 space-y-1">
                    {strength.requirements.map((req) => (
                      <li key={req.text} className={`flex items-center gap-1.5 text-xs transition-colors ${req.met ? 'text-green-400' : 'text-muted-foreground'}`}>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${req.met ? 'bg-green-500/20' : 'bg-muted'}`}>
                          <CheckIcon className="w-2.5 h-2.5" />
                        </div>
                        {req.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {touched.password && errors.password && !form.password && (
                <p className="mt-1 text-xs text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Terms */}
            <label className="flex items-start gap-2.5 cursor-pointer">
              <div
                onClick={() => setAgreed(!agreed)}
                className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors cursor-pointer ${
                  agreed ? 'bg-primary border-primary' : 'border-border bg-background'
                }`}
              >
                {agreed && <CheckIcon className="w-2.5 h-2.5 text-primary-foreground" />}
              </div>
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to LynQ&apos;s{' '}
                <a href="/terms" className="text-primary hover:text-primary/80">Terms of Service</a>{' '}
                and{' '}
                <a href="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</a>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading || !agreed}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-semibold rounded-xl hover:from-indigo-700 hover:to-indigo-600 transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create Free Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
          </>
          )}
        </div>
      </div>
    </div>
  );
}
