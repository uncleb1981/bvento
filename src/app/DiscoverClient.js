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

const RESUME_KEY = 'bvento_resume_bike';

export default function DiscoverClient({ initialBikes }) {
  const router = useRouter();
  const [bikes, setBikes] = useState(initialBikes);
  const [myBikes, setMyBikes] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [resumeBikeId, setResumeBikeId] = useState(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(RESUME_KEY);
    if (stored) {
      sessionStorage.removeItem(RESUME_KEY);
      setResumeBikeId(stored);
    }
  }, []);

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

  function handleRequireAuth(bike) {
    if (bike) sessionStorage.setItem(RESUME_KEY, bike.id);
    router.push('/login?next=/');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 sm:py-10">
      <div className="text-center mb-2 sm:mb-6">
        <h1 className="font-serif text-3xl sm:text-5xl" style={{ color: 'var(--ink)' }}>Swipe to Trade. Post to Sell.</h1>
        <p className="text-sm sm:text-base mt-3 max-w-lg mx-auto" style={{ color: 'var(--ink-soft)' }}>
          Buy, sell, and trade used bikes with real riders in Bentonville, Rogers, Springdale &amp; Fayetteville, AR.
        </p>
      </div>
      {error && <p className="text-center text-sm mb-6" style={{ color: '#8A2A1F' }}>{error}</p>}
      {bikes.length === 0 && !error ? (
        <div className="max-w-sm mx-auto text-center px-6 py-14" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <p className="font-serif text-2xl mb-2" style={{ color: 'var(--ink)' }}>No bikes posted yet</p>
          <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Be the first rider in Northwest Arkansas to post one.</p>
        </div>
      ) : (
        <SwipeDeck
          bikes={bikes}
          myBikes={myBikes}
          authed={!!user}
          onPass={handlePass}
          onPropose={handlePropose}
          onRequireAuth={handleRequireAuth}
          resumeBikeId={resumeBikeId}
        />
      )}
      <DiscoverFaq />
    </div>
  );
}

const FAQ_ITEMS = [
  {
    question: 'How does bike trading work on Bvento?',
    answer: 'Swipe right on a bike you want, then either offer one of your own bikes (with cash added to balance any difference in value) or make a cash-only offer. If the owner accepts, you get a chat thread to work out the details.',
  },
  {
    question: 'Can I just buy a used bike instead of trading?',
    answer: 'Yes — a cash-only offer works exactly like a purchase. You don’t need to own a bike yourself to make an offer.',
  },
  {
    question: 'Where does Bvento work?',
    answer: 'Bvento is used by riders across Northwest Arkansas, including Bentonville, Rogers, Springdale, and Fayetteville.',
  },
  {
    question: 'Is it free to post a bike for sale or trade?',
    answer: 'Yes, posting a listing on Bvento is free.',
  },
];

function DiscoverFaq() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 px-2">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <h2 className="font-serif text-2xl mb-4 text-center" style={{ color: 'var(--ink)' }}>Frequently asked questions</h2>
      <div className="space-y-4">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question} className="p-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="text-sm font-semibold mb-1" style={{ color: 'var(--ink)' }}>{item.question}</div>
            <div className="text-sm" style={{ color: 'var(--ink-soft)' }}>{item.answer}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
