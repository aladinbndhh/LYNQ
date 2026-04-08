'use client';

import { useState, useRef, useEffect } from 'react';

interface Props {
  username: string;
  ownerName: string;
  primaryColor: string;
  isDark: boolean;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
}

export function SaveContactModal({ username, ownerName, primaryColor, isDark }: Props) {
  const [open, setOpen]       = useState(false);
  const [form, setForm]       = useState<FormState>({ name: '', email: '', phone: '', company: '' });
  const [errors, setErrors]   = useState<Partial<FormState>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const overlayRef            = useRef<HTMLDivElement>(null);

  // Close on backdrop click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.target === overlayRef.current) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const cardBg   = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#1e293b';
  const subColor  = isDark ? '#94a3b8' : '#64748b';
  const inputBg   = isDark ? '#0f172a' : '#f8fafc';
  const borderCol = isDark ? '#334155' : '#e2e8f0';
  const chipBg    = isDark ? '#334155' : '#f1f5f9';

  function validate(): boolean {
    const errs: Partial<FormState> = {};
    if (!form.name.trim())  errs.name  = 'Your name is required';
    if (!form.email.trim()) errs.email = 'Your email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/contact/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong');
      }

      // Lead saved — now trigger the vCard download
      const link = document.createElement('a');
      link.href = `/api/contact/${username}`;
      link.download = `${username}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDone(true);
    } catch (err: any) {
      setErrors({ email: err.message });
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setDone(false);
    setForm({ name: '', email: '', phone: '', company: '' });
    setErrors({});
  }

  return (
    <>
      {/* ── Trigger button ───────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'block', width: '100%', padding: '14px', borderRadius: '14px',
          background: chipBg, color: textColor, border: 'none', cursor: 'pointer',
          fontSize: '15px', fontWeight: 600, boxSizing: 'border-box',
          textAlign: 'center',
        }}
      >
        👤 Save Contact
      </button>

      {/* ── Modal overlay ────────────────────────────────────────────── */}
      {open && (
        <div
          ref={overlayRef}
          style={{
            position: 'fixed', inset: 0, zIndex: 999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '100%', maxWidth: '520px',
              background: cardBg,
              borderRadius: '24px 24px 0 0',
              padding: '28px 24px 40px',
              boxSizing: 'border-box',
              animation: 'slideUp 0.25s ease',
            }}
          >
            {!done ? (
              <>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: textColor }}>
                      Quick intro 👋
                    </h2>
                    <p style={{ margin: '4px 0 0', fontSize: '13px', color: subColor }}>
                      Share your details with {ownerName.split(' ')[0]} and download their contact card.
                    </p>
                  </div>
                  <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: subColor, fontSize: '22px', lineHeight: 1, padding: 0 }}>
                    ×
                  </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Name */}
                    <Field
                      label="Your Name *"
                      type="text"
                      value={form.name}
                      error={errors.name}
                      inputBg={inputBg}
                      textColor={textColor}
                      borderCol={borderCol}
                      primaryColor={primaryColor}
                      placeholder="Mohammed Ali"
                      onChange={v => setForm(f => ({ ...f, name: v }))}
                    />
                    {/* Email */}
                    <Field
                      label="Email Address *"
                      type="email"
                      value={form.email}
                      error={errors.email}
                      inputBg={inputBg}
                      textColor={textColor}
                      borderCol={borderCol}
                      primaryColor={primaryColor}
                      placeholder="you@example.com"
                      onChange={v => setForm(f => ({ ...f, email: v }))}
                    />
                    {/* Phone */}
                    <Field
                      label="Phone (optional)"
                      type="tel"
                      value={form.phone}
                      inputBg={inputBg}
                      textColor={textColor}
                      borderCol={borderCol}
                      primaryColor={primaryColor}
                      placeholder="+974 5000 0000"
                      onChange={v => setForm(f => ({ ...f, phone: v }))}
                    />
                    {/* Company */}
                    <Field
                      label="Company (optional)"
                      type="text"
                      value={form.company}
                      inputBg={inputBg}
                      textColor={textColor}
                      borderCol={borderCol}
                      primaryColor={primaryColor}
                      placeholder="Acme Corp"
                      onChange={v => setForm(f => ({ ...f, company: v }))}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      marginTop: '22px', width: '100%', padding: '15px',
                      borderRadius: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                      background: primaryColor, color: '#fff',
                      fontSize: '15px', fontWeight: 700, opacity: loading ? 0.7 : 1,
                      transition: 'opacity 0.2s',
                    }}
                  >
                    {loading ? 'Saving…' : '📥 Save & Download Contact'}
                  </button>

                  <p style={{ margin: '10px 0 0', textAlign: 'center', fontSize: '11px', color: subColor }}>
                    Your info is shared only with {ownerName.split(' ')[0]} and is not sold to third parties.
                  </p>
                </form>
              </>
            ) : (
              /* ── Success state ── */
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: textColor }}>
                  Contact saved!
                </h2>
                <p style={{ margin: '8px 0 0', fontSize: '14px', color: subColor }}>
                  Your vCard has been downloaded. Import it in your Contacts app to add {ownerName.split(' ')[0]}.
                </p>
                <button
                  onClick={handleClose}
                  style={{
                    marginTop: '24px', padding: '12px 32px', borderRadius: '12px',
                    background: primaryColor, color: '#fff', border: 'none',
                    cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                  }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}

// ── Shared field component ─────────────────────────────────────────────────

interface FieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  inputBg: string;
  textColor: string;
  borderCol: string;
  primaryColor: string;
}

function Field({ label, type, value, onChange, placeholder, error, inputBg, textColor, borderCol, primaryColor }: FieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: textColor, marginBottom: '6px', opacity: 0.7 }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '12px 14px', borderRadius: '12px',
          background: inputBg, color: textColor,
          border: `1.5px solid ${error ? '#ef4444' : focused ? primaryColor : borderCol}`,
          fontSize: '14px', outline: 'none', boxSizing: 'border-box',
          transition: 'border-color 0.15s',
        }}
      />
      {error && (
        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#ef4444' }}>{error}</p>
      )}
    </div>
  );
}
