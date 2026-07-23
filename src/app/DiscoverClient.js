'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SwipeDeck from '@/components/SwipeDeck';
import {
  getFeedBikes,
  getMyBikes,
  getCurrentUser,
  passBike,
  addProposal,
} from '@/lib/store';

export default function DiscoverClient({ initialBikes }) {
  const router = useRouter();
  const [bikes, setBikes] = useState(initialBikes);
  const [myBikes, setMyBikes] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        const feedBikes = await getFeedBikes(currentUser?.id);
        const mine = currentUser ? await getMyBikes(currentUser.id) : [];
        if (cancelled) return;
        setUser(currentUser);
        setBikes(feedBikes);
        setMyBikes(mine);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load bikes.');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function handlePass(bike) {
    passBike(bike.id);
  }

  async function handlePropose(targetBike, offer) {
    if (!user) return;
    await addProposal({
      fromUserId: user.id,
      targetBike,
      myBike: offer.myBike,
      cashAmount: offer.cashAmount,
      cashDirection: offer.cashDirection,
      message: offer.message,
    });
  }

  function handleRequireAuth() {
    router.push('/login?next=/');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-10">
      <div className="text-center mb-2 sm:mb-6">
        <h1 className="font-serif text-3xl sm:text-5xl" style={{ color: 'var(--ink)' }}>Swipe right to say yes</h1>
      </div>
      {error && <p className="text-center text-sm mb-6" style={{ color: '#8A2A1F' }}>{error}</p>}
      {bikes.length === 0 && !error ? (
        <div className="max-w-sm mx-auto text-center px-6 py-14" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="font-serif text-2xl mb-2" style={{ color: 'var(--ink)' }}>No bikes posted yet</p>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Be the first rider in Northwest Arkansas to list one.</p>
        </div>
      ) : (
        <SwipeDeck
          bikes={bikes}
          myBikes={myBikes}
          authed={!!user}
          onPass={handlePass}
          onPropose={handlePropose}
          onRequireAuth={handleRequireAuth}
        />
      )}
    </div>
  );
}
