'use client';

import { useState } from 'react';

export default function FeedbackForm() {
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState('idle');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim() || status === 'sending') return;
    setStatus('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, contact, website }),
      });
      if (!res.ok) throw new Error();
      setStatus('sent');
      setMessage('');
      setContact('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-16 mb-8 px-2">
      <div className="p-6 sm:p-8 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-serif text-2xl mb-2" style={{ color: 'var(--ink)' }}>Thanks for checking out Bvento</h2>
        <p className="text-sm max-w-md mx-auto mb-6" style={{ color: 'var(--ink-soft)' }}>
          We&apos;re building the first bike-trading app of its kind for Northwest Arkansas, and we&apos;re learning as we go.
          Something confusing, broken, or missing? Tell us. Love it? We&apos;d love to hear that too.
        </p>

        {status === 'sent' ? (
          <p className="text-sm font-medium" style={{ color: '#0F5132' }}>Thanks — your feedback is on its way to us.</p>
        ) : (
          <form onSubmit={handleSubmit} className="text-left space-y-3 max-w-md mx-auto">
            <input
              type="text"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              required
              className="w-full px-4 py-2.5 text-sm resize-none"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
            />
            <input
              type="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Your email (optional, if you'd like a reply)"
              className="w-full px-4 py-2.5 text-sm"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--background)' }}
            />
            {status === 'error' && (
              <p className="text-xs" style={{ color: '#8A2A1F' }}>Something went wrong — mind trying again?</p>
            )}
            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full py-3 font-medium text-white text-sm disabled:opacity-60"
              style={{ backgroundColor: 'var(--ink)' }}
            >
              {status === 'sending' ? 'Sending…' : 'Send feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
