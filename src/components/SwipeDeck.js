'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import BikeCard from './BikeCard';
import ProposeTradeModal from './ProposeTradeModal';

const SWIPE_THRESHOLD = 120;

export default function SwipeDeck({ bikes, myBikes, authed, onPass, onPropose, onRequireAuth, resumeBikeId }) {
  const [cards, setCards] = useState(bikes);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null);
  const [sentTarget, setSentTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const startX = useRef(0);
  const resumedRef = useRef(false);

  const topCard = cards[0];

  // After logging in to complete a swipe-right that required auth, jump
  // straight back to the trade modal for that bike instead of dropping the
  // user back at the top of the deck with no memory of their intent.
  useEffect(() => {
    if (!resumeBikeId || !authed || resumedRef.current) return;
    const target = bikes.find((b) => b.id === resumeBikeId);
    if (!target) return;
    resumedRef.current = true;
    setCards((c) => {
      const idx = c.findIndex((b) => b.id === resumeBikeId);
      if (idx <= 0) return c;
      return [c[idx], ...c.slice(0, idx), ...c.slice(idx + 1)];
    });
    setPendingTarget(target);
  }, [resumeBikeId, authed, bikes]);

  function handlePointerDown(e) {
    if (pendingTarget) return;
    setDragging(true);
    startX.current = (e.touches ? e.touches[0].clientX : e.clientX);
  }

  function handlePointerMove(e) {
    if (!dragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setDragX(clientX - startX.current);
  }

  function handlePointerUp() {
    if (!dragging) return;
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD) {
      resolveSwipe('right');
    } else if (dragX < -SWIPE_THRESHOLD) {
      resolveSwipe('left');
    } else {
      setDragX(0);
    }
  }

  function resolveSwipe(direction) {
    if (!topCard) return;
    if (direction === 'left') {
      setDragX(-600);
      setTimeout(() => {
        onPass(topCard);
        setCards((c) => c.slice(1));
        setDragX(0);
      }, 220);
    } else if (!authed) {
      setDragX(0);
      onRequireAuth(topCard);
    } else {
      setDragX(0);
      setPendingTarget(topCard);
    }
  }

  async function handleConfirm(offer) {
    setSubmitting(true);
    try {
      await onPropose(pendingTarget, offer);
      setCards((c) => c.slice(1));
      setSentTarget(pendingTarget);
      setPendingTarget(null);
    } catch (err) {
      alert(`Couldn't send that offer: ${err.message || 'unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancelProposal() {
    setPendingTarget(null);
    setDragX(0);
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-full max-w-sm mx-auto"
        style={{ height: '65vh', maxHeight: 560, touchAction: 'pan-y' }}
      >
        {cards.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 rounded-2xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="font-serif text-3xl mb-2" style={{ color: 'var(--ink)' }}>You're all caught up</p>
            <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>Check back later for more bikes, or post your own to attract offers.</p>
          </div>
        )}

        {cards.slice(0, 3).reverse().map((bike, idx) => {
          const isTop = idx === cards.slice(0, 3).length - 1;
          const stackIdx = cards.slice(0, 3).length - 1 - idx;
          return (
            <div
              key={bike.id}
              className="absolute inset-0"
              style={{
                zIndex: isTop ? 10 : 10 - stackIdx,
                transform: isTop ? undefined : `scale(${1 - stackIdx * 0.04}) translateY(${stackIdx * 10}px)`,
                transition: 'transform 0.2s ease',
              }}
              onMouseDown={isTop ? handlePointerDown : undefined}
              onMouseMove={isTop ? handlePointerMove : undefined}
              onMouseUp={isTop ? handlePointerUp : undefined}
              onMouseLeave={isTop && dragging ? handlePointerUp : undefined}
              onTouchStart={isTop ? handlePointerDown : undefined}
              onTouchMove={isTop ? handlePointerMove : undefined}
              onTouchEnd={isTop ? handlePointerUp : undefined}
            >
              <BikeCard bike={bike} dragX={isTop ? dragX : 0} dragging={isTop && dragging} />
            </div>
          );
        })}
      </div>

      {cards.length > 0 && (
        <div className="flex items-center gap-6 mt-7">
          <button
            onClick={() => resolveSwipe('left')}
            className="w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--surface)', border: '2px solid #DC2626' }}
            aria-label="Pass"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5"><path strokeLinecap="round" d="M7 7l10 10M17 7L7 17"/></svg>
          </button>
          <button
            onClick={() => resolveSwipe('right')}
            className="w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--accent)' }}
            aria-label="Trade"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1"><path d="M12 21s-6.7-4.35-9.33-8.2C.9 10.1 1.4 6.6 4.2 4.9c2.3-1.4 4.9-.7 6.4 1.1L12 7.4l1.4-1.4c1.5-1.8 4.1-2.5 6.4-1.1 2.8 1.7 3.3 5.2 1.53 7.9C18.7 16.65 12 21 12 21z"/></svg>
          </button>
        </div>
      )}

      {pendingTarget && (
        <ProposeTradeModal
          targetBike={pendingTarget}
          myBikes={myBikes}
          submitting={submitting}
          onCancel={handleCancelProposal}
          onConfirm={handleConfirm}
        />
      )}

      {sentTarget && (
        <OfferSentModal targetBike={sentTarget} onClose={() => setSentTarget(null)} />
      )}
    </div>
  );
}

function OfferSentModal({ targetBike, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="rounded-t-2xl sm:rounded-2xl p-7 max-w-md w-full animate-pop-in text-center" style={{ backgroundColor: 'var(--surface)' }}>
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h2 className="font-serif text-2xl mb-2" style={{ color: 'var(--ink)' }}>Offer sent!</h2>
        <p className="text-sm mb-1" style={{ color: 'var(--ink-soft)' }}>
          Your offer for <strong style={{ color: 'var(--ink)' }}>{targetBike.title}</strong> is on its way to {targetBike.ownerName}.
        </p>
        <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>
          If they accept, you&apos;ll get a chat thread to work out the details. Track it anytime in your Inbox.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 font-medium" style={{ color: 'var(--ink-soft)', border: '1px solid var(--border)' }}>
            Keep swiping
          </button>
          <Link
            href="/inbox?tab=Sent"
            className="flex-1 py-3 font-medium text-white text-center"
            style={{ backgroundColor: 'var(--ink)' }}
          >
            View in Inbox
          </Link>
        </div>
      </div>
    </div>
  );
}
