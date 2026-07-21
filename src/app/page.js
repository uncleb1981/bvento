'use client';

import { useState, useEffect } from 'react';
import SwipeDeck from '@/components/SwipeDeck';
import {
  getFeedBikes,
  getMyBikes,
  getUser,
  passBike,
  addProposalWithAutoResponse,
} from '@/lib/store';

export default function DiscoverPage() {
  const [ready, setReady] = useState(false);
  const [bikes, setBikes] = useState([]);
  const [myBikes, setMyBikes] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setBikes(getFeedBikes());
    setMyBikes(getMyBikes());
    setUser(getUser());
    setReady(true);
  }, []);

  function handlePass(bike) {
    passBike(bike.id);
  }

  function handlePropose(targetBike, offer) {
    if (!user) return;
    addProposalWithAutoResponse({
      id: `proposal-${Date.now()}`,
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId: targetBike.ownerId,
      toUserName: targetBike.ownerName,
      myBike: offer.myBike,
      targetBike,
      cashAmount: offer.cashAmount,
      cashDirection: offer.cashDirection,
      message: offer.message,
      status: 'pending',
      createdAt: new Date().toISOString(),
    });
  }

  if (!ready) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <p className="text-xs uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--accent)' }}>Curated listings, nearby</p>
        <h1 className="font-serif text-4xl sm:text-5xl" style={{ color: 'var(--ink)' }}>Discover bikes worth trading for</h1>
        <p className="text-sm mt-3" style={{ color: 'var(--ink-soft)' }}>Swipe right to propose a trade, left to pass.</p>
      </div>
      <SwipeDeck bikes={bikes} myBikes={myBikes} onPass={handlePass} onPropose={handlePropose} />
    </div>
  );
}
