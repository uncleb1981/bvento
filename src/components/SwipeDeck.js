'use client';

import { useState, useRef } from 'react';
import BikeCard from './BikeCard';
import ProposeTradeModal from './ProposeTradeModal';

const SWIPE_THRESHOLD = 120;

export default function SwipeDeck({ bikes, myBikes, authed, onPass, onPropose, onRequireAuth }) {
  const [cards, setCards] = useState(bikes);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const startX = useRef(0);

  const topCard = cards[0];

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
      onRequireAuth();
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
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-soft)' }}
            aria-label="Pass"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
          <button
            onClick={() => resolveSwipe('right')}
            className="w-14 h-14 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--accent)' }}
            aria-label="Trade"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M17 1l4 4-4 4M3 11V9a4 4 0 014-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 01-4 4H3"/></svg>
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
    </div>
  );
}
