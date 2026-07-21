'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { getReceivedPendingCount } from '@/lib/store';

export default function Navbar() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const userIdRef = useRef(null);

  useEffect(() => {
    const supabase = getSupabase();

    async function refreshCount() {
      const userId = userIdRef.current;
      if (!userId) {
        setPendingCount(0);
        return;
      }
      try {
        setPendingCount(await getReceivedPendingCount(userId));
      } catch {
        // ignore transient count errors
      }
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user);
      userIdRef.current = user?.id || null;
      refreshCount();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      userIdRef.current = session?.user?.id || null;
      refreshCount();
    });

    const poll = setInterval(refreshCount, 5000);

    return () => {
      subscription.unsubscribe();
      clearInterval(poll);
    };
  }, []);

  async function handleSignOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-40 border-b" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
        <Link href="/" className="flex-shrink-0 mr-1">
          <div className="flex flex-col leading-none">
            <span className="font-logo text-2xl tracking-tight" style={{ color: 'var(--ink)' }}>Bvento</span>
            <span className="text-[10px] uppercase tracking-[0.18em] hidden sm:block mt-0.5" style={{ color: 'var(--ink-soft)' }}>A Better Way to Trade Up</span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-1 ml-6">
          <Link href="/" className="px-3 py-2 text-xs uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--ink-soft)' }}>Discover</Link>
          <Link href="/inbox" className="relative px-3 py-2 text-xs uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--ink-soft)' }}>
            Inbox
            {pendingCount > 0 && (
              <span className="absolute top-0.5 right-0 w-3.5 h-3.5 text-white text-[9px] rounded-full flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--accent)' }}>
                {pendingCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className="px-3 py-2 text-xs uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--ink-soft)' }}>Profile</Link>
        </div>

        <div className="flex items-center gap-4 ml-auto">
          <Link
            href="/bikes/create"
            className="hidden sm:flex items-center gap-1.5 text-white px-4 py-2 text-xs uppercase tracking-[0.12em] font-medium transition-colors"
            style={{ backgroundColor: 'var(--ink)' }}
          >
            Post a Bike
          </Link>

          {authUser ? (
            <button onClick={handleSignOut} className="text-xs uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--ink-soft)' }}>
              Sign out
            </button>
          ) : (
            <Link href="/login" className="text-xs uppercase tracking-[0.12em] font-medium" style={{ color: 'var(--accent)' }}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
