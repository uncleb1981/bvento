'use client';

import { useState, useEffect } from 'react';
import { TYPE_STYLE } from '@/lib/mockData';
import { suggestCash } from '@/lib/store';

export default function ProposeTradeModal({ targetBike, myBikes, onCancel, onConfirm }) {
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
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center animate-pop-in">
          <p className="text-lg font-bold mb-2">Post a bike first</p>
          <p className="text-sm text-gray-500 mb-4">You need at least one bike listed before you can propose a trade.</p>
          <button onClick={onCancel} className="w-full py-3 rounded-xl font-bold text-white" style={{ backgroundColor: 'var(--brand)' }}>
            Got it
          </button>
        </div>
      </div>
    );
  }

  const style = TYPE_STYLE[targetBike.type] || TYPE_STYLE.Road;
  const myStyle = TYPE_STYLE[myBike.type] || TYPE_STYLE.Road;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto animate-pop-in">
        <h2 className="text-xl font-black mb-1" style={{ color: 'var(--brand-dark)' }}>Propose a trade</h2>
        <p className="text-sm text-gray-500 mb-4">Offer one of your bikes for {targetBike.title}.</p>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 rounded-xl p-3 text-white text-center" style={{ background: myStyle.gradient }}>
            <div className="text-2xl">{myStyle.emoji}</div>
            <div className="text-xs font-bold truncate">{myBike.title}</div>
            <div className="text-xs">${myBike.estimatedValue.toLocaleString()}</div>
          </div>
          <div className="text-2xl">⇄</div>
          <div className="flex-1 rounded-xl p-3 text-white text-center" style={{ background: style.gradient }}>
            <div className="text-2xl">{style.emoji}</div>
            <div className="text-xs font-bold truncate">{targetBike.title}</div>
            <div className="text-xs">${targetBike.estimatedValue.toLocaleString()}</div>
          </div>
        </div>

        {myBikes.length > 1 && (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Your bike to offer</label>
            <select
              value={myBikeId}
              onChange={(e) => setMyBikeId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
            >
              {myBikes.map((b) => (
                <option key={b.id} value={b.id}>{b.title} (${b.estimatedValue.toLocaleString()})</option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Cash to balance the deal</label>
          <div className="flex items-center gap-2">
            <select
              value={cashDirection}
              onChange={(e) => setCashDirection(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
            >
              <option value="i_pay">I add cash</option>
              <option value="they_pay">They add cash</option>
              <option value="even">Straight trade (no cash)</option>
            </select>
            {cashDirection !== 'even' && (
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-6 pr-3 py-2 border border-gray-200 rounded-xl text-sm"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Suggested based on estimated values — adjust to whatever feels fair.
          </p>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Message (optional)</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Hey! Would love to trade for this..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100">
            Cancel
          </button>
          <button
            onClick={() => onConfirm({ myBike, cashAmount: cashDirection === 'even' ? 0 : cashAmount, cashDirection, message })}
            className="flex-1 py-3 rounded-xl font-bold text-white"
            style={{ backgroundColor: 'var(--brand)' }}
          >
            Send offer
          </button>
        </div>
      </div>
    </div>
  );
}
