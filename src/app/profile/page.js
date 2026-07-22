'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { photoForBike } from '@/lib/mockData';
import { getCurrentUser, getMyBikes, getConversations, deleteBike } from '@/lib/store';

export default function ProfilePage() {
  return (
    <Suspense fallback={null}>
      <ProfileContent />
    </Suspense>
  );
}

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const notice = searchParams.get('notice');
  const [user, setUser] = useState(null);
  const [myBikes, setMyBikes] = useState([]);
  const [matchCount, setMatchCount] = useState(0);
  const [ready, setReady] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentUser = await getCurrentUser();
      if (cancelled) return;
      if (!currentUser) {
        router.replace('/login?next=/profile');
        return;
      }
      const [bikes, conversations] = await Promise.all([
        getMyBikes(currentUser.id),
        getConversations(currentUser.id),
      ]);
      if (cancelled) return;
      setUser(currentUser);
      setMyBikes(bikes);
      setMatchCount(conversations.length);
      setReady(true);
    })();
    return () => { cancelled = true; };
  }, [router]);

  if (!ready || !user) return null;

  async function handleDelete(bike) {
    if (!window.confirm(`Delete "${bike.title}"? This can't be undone.`)) return;
    setDeletingId(bike.id);
    setDeleteError('');
    try {
      await deleteBike(bike.id);
      setMyBikes((bikes) => bikes.filter((b) => b.id !== bike.id));
    } catch (err) {
      setDeleteError(err.message || 'Could not delete that bike.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {notice && (
        <p className="text-sm mb-6 px-4 py-3" style={{ color: '#8A2A1F', border: '1px solid #E5BEB6' }}>{notice}</p>
      )}

      <div className="p-6 mb-6 flex items-center gap-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-serif text-2xl text-white flex-shrink-0"
          style={{ backgroundColor: 'var(--ink)' }}
        >
          {user.name?.charAt(0) || '?'}
        </div>
        <div>
          <div className="font-serif text-2xl" style={{ color: 'var(--ink)' }}>{user.name}</div>
          <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>{user.city || user.email}</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-8">
        <Stat label="Bikes posted" value={myBikes.length} />
        <Stat label="Matches" value={matchCount} />
        <Stat label="Trades done" value={user.completedTrades} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-serif text-2xl" style={{ color: 'var(--ink)' }}>My bikes</h2>
        <Link href="/bikes/create" className="text-xs uppercase tracking-[0.1em] font-medium" style={{ color: 'var(--accent)' }}>
          + Post a bike
        </Link>
      </div>

      {deleteError && <p className="text-sm mb-4" style={{ color: '#8A2A1F' }}>{deleteError}</p>}

      <div className="grid grid-cols-2 gap-3">
        {myBikes.map((bike) => (
          <div key={bike.id}>
            <div className="overflow-hidden relative h-40" style={{ border: '1px solid var(--border)' }}>
              <img src={photoForBike(bike)} alt={bike.title} className="absolute inset-0 w-full h-full object-cover" />
              {bike.isDemo && (
                <div className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: 'var(--accent)' }}>
                  Demo
                </div>
              )}
              <div className="absolute inset-0 flex flex-col justify-end p-3 text-white" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.85), transparent 60%)' }}>
                <div className="font-medium text-sm truncate">{bike.title}</div>
                <div className="text-xs text-white/75">{bike.type} · {bike.condition}</div>
                <div className="font-serif text-lg mt-0.5">${bike.estimatedValue.toLocaleString()}</div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(bike)}
              disabled={deletingId === bike.id}
              className="w-full mt-2 py-2 text-xs uppercase tracking-[0.1em] font-medium disabled:opacity-50"
              style={{ border: '1px solid var(--border)', color: '#8A2A1F' }}
            >
              {deletingId === bike.id ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        ))}
      </div>

      {myBikes.length === 0 && (
        <div className="text-center py-14 px-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>You haven&apos;t posted a bike yet.</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="p-4 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="font-serif text-3xl" style={{ color: 'var(--ink)' }}>{value}</div>
      <div className="text-[11px] uppercase tracking-[0.1em] mt-1" style={{ color: 'var(--ink-soft)' }}>{label}</div>
    </div>
  );
}
