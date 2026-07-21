'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import { getProposals, getUser } from '@/lib/store';

export default function Navbar() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getUser().then(({ data: { user } }) => setAuthUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
    });

    function refreshCount() {
      const me = getUser();
      const count = getProposals().filter((p) => p.toUserId === me?.id && p.status === 'pending').length;
      setPendingCount(count);
    }
    refreshCount();
    const poll = setInterval(refreshCount, 3000);

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
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
        <Link href="/" className="flex-shrink-0 mr-1">
          <div className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tight" style={{ color: 'var(--brand-dark)' }}>Bvento</span>
            <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--brand)' }}>Swipe. Match. Ride.</span>
          </div>
        </Link>

        <div className="hidden sm:flex items-center gap-1 ml-4">
          <Link href="/" className="px-3 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50">Discover</Link>
          <Link href="/inbox" className="relative px-3 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50">
            Inbox
            {pendingCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            )}
          </Link>
          <Link href="/profile" className="px-3 py-2 rounded-full text-sm font-semibold text-gray-600 hover:bg-gray-50">Profile</Link>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Link
            href="/bikes/create"
            className="hidden sm:flex items-center gap-1.5 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            + Post a Bike
          </Link>

          {authUser ? (
            <button onClick={handleSignOut} className="text-sm font-medium text-gray-500 hover:text-gray-800">
              Sign out
            </button>
          ) : (
            <Link href="/login" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
