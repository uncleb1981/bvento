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
  const [phase, setPhase] = useState('input'); // input | sending | sent | error
  const [errorMsg, setErrorMsg] = useState('');

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
          <div className="font-logo text-4xl mb-1" style={{ color: 'var(--ink)' }}>Bvento</div>
          <div className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--ink-soft)' }}>A Better Way to Trade Up</div>
        </div>

        <div className="p-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          {(phase === 'input' || phase === 'error') && (
            <>
              <h1 className="font-serif text-2xl mb-2" style={{ color: 'var(--ink)' }}>Sign in</h1>
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
