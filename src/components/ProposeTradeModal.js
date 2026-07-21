'use client';

import { useState, useEffect } from 'react';
import { photoForBike } from '@/lib/mockData';
import { suggestCash } from '@/lib/store';

export default function ProposeTradeModal({ targetBike, myBikes, submitting, onCancel, onConfirm }) {
  const [myBikeId, setMyBikeId] = useState(myBikes[0]?.id || '');
  const [cashAmount, setCashAmount] = useState(0);
  const [cashDirection, setCashDirection] = useState('even');
  const [message, setMessage] = useState('');

  const myBike = myBikes.find((b) => b.id === myBikeId) || myBikes[0];

  useEffect(() => {
    if (!myBike) return;
    const suggestion = suggestCash(myBike, targetBike);
    setCashAmount(suggestion.cashAmount);
    setCashDirection(suggestion.cashDirection);
  }, [myBikeId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!myBike) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
        <div className="rounded-2xl p-8 max-w-sm w-full text-center animate-pop-in" style={{ backgroundColor: 'var(--surface)' }}>
          <p className="font-serif text-2xl mb-2" style={{ color: 'var(--ink)' }}>Post a bike first</p>
          <p className="text-sm mb-5" style={{ color: 'var(--ink-soft)' }}>You need at least one bike listed before you can propose a trade.</p>
          <button onClick={onCancel} className="w-full py-3 font-medium text-white" style={{ backgroundColor: 'var(--ink)' }}>
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="rounded-t-2xl sm:rounded-2xl p-7 max-w-md w-full max-h-[90vh] overflow-y-auto animate-pop-in" style={{ backgroundColor: 'var(--surface)' }}>
        <h2 className="font-serif text-2xl mb-1" style={{ color: 'var(--ink)' }}>Propose a trade</h2>
        <p className="text-sm mb-5" style={{ color: 'var(--ink-soft)' }}>Offer one of your bikes for {targetBike.title}.</p>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 rounded-lg overflow-hidden relative h-24" style={{ border: '1px solid var(--border)' }}>
            <img src={photoForBike(myBike)} alt={myBike.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end p-2 text-white" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.85), transparent 70%)' }}>
              <div className="text-xs font-semibold truncate">{myBike.title}</div>
              <div className="text-xs">${myBike.estimatedValue.toLocaleString()}</div>
            </div>
          </div>
          <div className="font-serif text-xl italic" style={{ color: 'var(--ink-soft)' }}>for</div>
          <div className="flex-1 rounded-lg overflow-hidden relative h-24" style={{ border: '1px solid var(--border)' }}>
            <img src={photoForBike(targetBike)} alt={targetBike.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 flex flex-col justify-end p-2 text-white" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.85), transparent 70%)' }}>
              <div className="text-xs font-semibold truncate">{targetBike.title}</div>
              <div className="text-xs">${targetBike.estimatedValue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {myBikes.length > 1 && (
          <div className="mb-4">
            <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Your bike to offer</label>
            <select
              value={myBikeId}
              onChange={(e) => setMyBikeId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
            >
              {myBikes.map((b) => (
                <option key={b.id} value={b.id}>{b.title} (${b.estimatedValue.toLocaleString()})</option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Cash to balance the deal</label>
          <div className="flex items-center gap-2">
            <select
              value={cashDirection}
              onChange={(e) => setCashDirection(e.target.value)}
              className="px-3 py-2.5 text-sm"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
            >
              <option value="i_pay">I add cash</option>
              <option value="they_pay">They add cash</option>
              <option value="even">Straight trade (no cash)</option>
            </select>
            {cashDirection !== 'even' && (
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--ink-soft)' }}>$</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-6 pr-3 py-2.5 text-sm"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
                />
              </div>
            )}
          </div>
          <p className="text-xs mt-1.5" style={{ color: 'var(--ink-soft)' }}>
            Suggested based on estimated values — adjust to whatever feels fair.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Hey! Would love to trade for this..."
            className="w-full px-3 py-2.5 text-sm resize-none"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--surface)' }}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} disabled={submitting} className="flex-1 py-3 font-medium disabled:opacity-50" style={{ color: 'var(--ink-soft)', border: '1px solid var(--border)' }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ myBike, cashAmount: cashDirection === 'even' ? 0 : cashAmount, cashDirection, message })}
            disabled={submitting}
            className="flex-1 py-3 font-medium text-white disabled:opacity-60"
            style={{ backgroundColor: 'var(--ink)' }}
          >
            {submitting ? 'Sending…' : 'Send offer'}
          </button>
        </div>
      </div>
    </div>
  );
}
