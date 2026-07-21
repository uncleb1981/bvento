'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getProposals, getUser } from '@/lib/store';

const ITEMS = [
  { href: '/', label: 'Discover', icon: '🚲' },
  { href: '/inbox', label: 'Inbox', icon: '💬' },
  { href: '/bikes/create', label: 'Post', icon: '➕' },
  { href: '/profile', label: 'Profile', icon: '👤' },
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
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2">
        {ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl"
              style={{ color: active ? 'var(--brand)' : '#9CA3AF' }}
            >
              <span className="text-xl leading-none">{item.icon}</span>
              <span className="text-[10px] font-semibold">{item.label}</span>
              {item.href === '/inbox' && pendingCount > 0 && (
                <span className="absolute top-0 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
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
