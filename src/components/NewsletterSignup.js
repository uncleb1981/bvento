'use client';

import { useState } from 'react';

// Posts to /api/newsletter, which inserts into newsletter_subscribers on
// bvento's own Supabase project and emails a signup notification.
export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setStatus('error');
        return;
      }
    } catch {
      setStatus('error');
      return;
    }
    setStatus('done');
  }

  if (status === 'done') {
    return <p className="text-xs w-full sm:w-auto text-right sm:text-left" style={{ color: 'var(--ink-soft)' }}>You&apos;re subscribed.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
        placeholder={status === 'error' ? 'Try again' : 'Email'}
        required
        className="text-xs px-2.5 py-1.5 flex-1 sm:w-40"
        style={{ border: `1px solid ${status === 'error' ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--ink)', backgroundColor: 'var(--surface)' }}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="text-white text-xs uppercase tracking-[0.1em] font-medium px-3 py-1.5 whitespace-nowrap transition-colors disabled:opacity-60"
        style={{ backgroundColor: 'var(--accent)' }}
      >
        {status === 'loading' ? '...' : 'Subscribe'}
      </button>
    </form>
  );
}
