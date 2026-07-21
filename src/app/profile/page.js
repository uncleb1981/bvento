'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TYPE_STYLE } from '@/lib/mockData';
import { getUser, getMyBikes, getConversations } from '@/lib/store';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [myBikes, setMyBikes] = useState([]);
  const [matchCount, setMatchCount] = useState(0);

  useEffect(() => {
    setUser(getUser());
    setMyBikes(getMyBikes());
    setMatchCount(getConversations().length);
  }, []);

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          {user.name?.charAt(0) || '?'}
        </div>
        <div>
          <div className="text-lg font-black text-gray-900">{user.name}</div>
          <div className="text-sm text-gray-500">{user.city}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <Stat label="Bikes posted" value={myBikes.length} />
        <Stat label="Matches" value={matchCount} />
        <Stat label="Trades done" value={user.completedTrades} />
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-black text-gray-900">My bikes</h2>
        <Link href="/bikes/create" className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
          + Post a bike
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {myBikes.map((bike) => {
          const style = TYPE_STYLE[bike.type] || TYPE_STYLE.Road;
          return (
            <div key={bike.id} className="rounded-2xl overflow-hidden text-white" style={{ background: style.gradient }}>
              <div className="p-4">
                <div className="text-3xl mb-1">{style.emoji}</div>
                <div className="font-bold text-sm truncate">{bike.title}</div>
                <div className="text-xs text-white/80">{bike.type} · {bike.condition}</div>
                <div className="font-black mt-1">${bike.estimatedValue.toLocaleString()}</div>
              </div>
            </div>
          );
        })}
      </div>

      {myBikes.length === 0 && (
        <div className="text-center py-12 px-6 bg-white rounded-2xl border border-gray-100">
          <div className="text-4xl mb-2">🚲</div>
          <p className="text-sm text-gray-500">You haven&apos;t posted a bike yet.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
      <div className="text-2xl font-black" style={{ color: 'var(--brand-dark)' }}>{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}
