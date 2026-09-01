'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState('input'); // input | google | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  async function handleGoogleSignIn() {
    setPhase('google');
    setErrorMsg('');
    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
        setPhase('error');
      }
      // on success, Supabase redirects the browser to Google — nothing more to do here
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setPhase('error');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setPhase('sending');
    setErrorMsg('');

    try {
      const supabase = getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setPhase('error');
      } else {
        setPhase('sent');
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setPhase('error');
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="font-serif italic text-4xl" style={{ color: 'var(--ink)' }}>bvento</div>
        </div>

        <div className="p-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          {!showEmailForm && (phase === 'input' || phase === 'google' || phase === 'error') && (
            <>
              <h1 className="font-serif text-2xl mb-2" style={{ color: 'var(--ink)' }}>Sign in</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
                Continue with Google, or use a magic link instead.
              </p>

              <button
                onClick={handleGoogleSignIn}
                disabled={phase === 'google'}
                className="w-full flex items-center justify-center gap-3 py-3 font-medium disabled:opacity-60"
                style={{ border: '1px solid var(--border)', color: 'var(--ink)' }}
              >
                <GoogleIcon />
                {phase === 'google' ? 'Redirecting to Google…' : 'Continue with Google'}
              </button>

              {phase === 'error' && errorMsg && (
                <p className="text-sm mt-3" style={{ color: '#8A2A1F' }}>{errorMsg}</p>
              )}

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                <span className="text-xs uppercase tracking-[0.1em]" style={{ color: 'var(--ink-soft)' }}>Or</span>
                <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
              </div>

              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full py-3 font-medium"
                style={{ border: '1px solid var(--border)', color: 'var(--ink-soft)' }}
              >
                Send me a magic link
              </button>
            </>
          )}

          {showEmailForm && (phase === 'input' || phase === 'error') && (
            <>
              <h1 className="font-serif text-2xl mb-2" style={{ color: 'var(--ink)' }}>Sign in with email</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
                Enter your email and we&apos;ll send you a magic link to sign in instantly.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Email address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 text-sm"
                    style={{ border: '1px solid var(--border)' }}
                  />
                </div>
                {phase === 'error' && errorMsg && (
                  <p className="text-sm" style={{ color: '#8A2A1F' }}>{errorMsg}</p>
                )}
                <button
                  type="submit"
                  className="w-full text-white py-3 font-medium transition-colors"
                  style={{ backgroundColor: 'var(--ink)' }}
                >
                  Send magic link
                </button>
              </form>
              <p className="text-xs text-center mt-4" style={{ color: 'var(--ink-soft)' }}>
                No password needed. No spam. Just a link.
              </p>
              <button
                onClick={() => setShowEmailForm(false)}
                className="text-xs w-full text-center mt-4"
                style={{ color: 'var(--ink-soft)' }}
              >
                ← Back to Google sign-in
              </button>
            </>
          )}

          {phase === 'sending' && (
            <div className="text-center py-4">
              <div
                className="w-10 h-10 border-4 rounded-full animate-spin mx-auto mb-4"
                style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
              />
              <div className="font-medium" style={{ color: 'var(--ink)' }}>Sending your magic link...</div>
            </div>
          )}

          {phase === 'sent' && (
            <div className="text-center py-4">
              <h2 className="font-serif text-2xl mb-2" style={{ color: 'var(--ink)' }}>Check your email</h2>
              <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>
                We sent a link to <strong style={{ color: 'var(--ink)' }}>{email}</strong>.<br />
                Click it to sign in automatically.
              </p>
              <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>
                Didn&apos;t get it? Check your spam folder or{' '}
                <button onClick={() => setPhase('input')} className="underline" style={{ color: 'var(--accent)' }}>
                  try again
                </button>.
              </p>
            </div>
          )}
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm" style={{ color: 'var(--ink-soft)' }}>
            ← Continue browsing without signing in
          </Link>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 01-1.8 2.72v2.26h2.9c1.7-1.57 2.68-3.87 2.68-6.62z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.83.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.98v2.33A9 9 0 009 18z"/>
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 013.68 9c0-.59.1-1.17.27-1.7V4.97H.98A9 9 0 000 9c0 1.45.35 2.83.98 4.03l2.97-2.33z"/>
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 00.98 4.97l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
    </svg>
  );
}
