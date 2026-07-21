'use client';

import { useState, useRef } from 'react';
import BikeCard from './BikeCard';
import ProposeTradeModal from './ProposeTradeModal';

const SWIPE_THRESHOLD = 120;

export default function SwipeDeck({ bikes, myBikes, onPass, onPropose }) {
  const [cards, setCards] = useState(bikes);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [pendingTarget, setPendingTarget] = useState(null);
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
    } else {
      setDragX(0);
      setPendingTarget(topCard);
    }
  }

  function handleConfirm(offer) {
    onPropose(pendingTarget, offer);
    setCards((c) => c.slice(1));
    setPendingTarget(null);
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
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-lg font-bold text-gray-700">You're all caught up</p>
            <p className="text-sm text-gray-400 mt-1">Check back later for more bikes, or post your own to attract offers.</p>
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
        <div className="flex items-center gap-6 mt-6">
          <button
            onClick={() => resolveSwipe('left')}
            className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center text-2xl border border-gray-100 active:scale-95 transition-transform"
            aria-label="Pass"
          >
            ✕
          </button>
          <button
            onClick={() => resolveSwipe('right')}
            className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-2xl text-white active:scale-95 transition-transform"
            style={{ backgroundColor: 'var(--brand)' }}
            aria-label="Trade"
          >
            🚲
          </button>
        </div>
      )}

      {pendingTarget && (
        <ProposeTradeModal
          targetBike={pendingTarget}
          myBikes={myBikes}
          onCancel={handleCancelProposal}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
