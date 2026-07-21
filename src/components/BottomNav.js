'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getProposals, getUser } from '@/lib/store';

const ICONS = {
  discover: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 9l-2 6-6 2 2-6 6-2z"/></svg>
  ),
  inbox: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
  ),
  post: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path strokeLinecap="round" d="M12 5v14M5 12h14"/></svg>
  ),
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="4"/><path strokeLinecap="round" d="M4 20c0-4 3.6-6 8-6s8 2 8 6"/></svg>
  ),
};

const ITEMS = [
  { href: '/', label: 'Discover', icon: 'discover' },
  { href: '/inbox', label: 'Inbox', icon: 'inbox' },
  { href: '/bikes/create', label: 'Post', icon: 'post' },
  { href: '/profile', label: 'Profile', icon: 'profile' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    function refreshCount() {
      const me = getUser();
      const count = getProposals().filter((p) => p.toUserId === me?.id && p.status === 'pending').length;
      setPendingCount(count);
    }
    refreshCount();
    const poll = setInterval(refreshCount, 3000);
    return () => clearInterval(poll);
  }, []);

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t z-40 pb-[env(safe-area-inset-bottom)]" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-around py-2">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-1 px-3 py-1"
              style={{ color: active ? 'var(--accent)' : 'var(--ink-soft)' }}
            >
              {ICONS[item.icon]}
              <span className="text-[10px] uppercase tracking-[0.1em] font-medium">{item.label}</span>
              {item.href === '/inbox' && pendingCount > 0 && (
                <span className="absolute top-0 right-1 w-3.5 h-3.5 text-white text-[9px] rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--accent)' }}>
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
