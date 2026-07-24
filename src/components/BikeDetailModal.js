'use client';

import { photoForBike, altForBike } from '@/lib/mockData';

export default function BikeDetailModal({ bike, onClose }) {
  if (!bike) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="rounded-t-2xl sm:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-pop-in"
        style={{ backgroundColor: 'var(--surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56">
          <img src={photoForBike(bike)} alt={altForBike(bike)} className="absolute inset-0 w-full h-full object-cover" />
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(20,23,31,0.5)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.25"><path strokeLinecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full" style={{ border: '1px solid var(--border)', color: 'var(--ink-soft)' }}>{bike.type}</span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full" style={{ border: '1px solid var(--border)', color: 'var(--ink-soft)' }}>{bike.condition}</span>
          </div>
          <h2 className="font-serif text-2xl mb-1" style={{ color: 'var(--ink)' }}>{bike.title}</h2>
          <p className="text-sm mb-3" style={{ color: 'var(--ink-soft)' }}>{bike.city ? `${bike.city} · ` : ''}{bike.ownerName}</p>
          <div className="font-serif text-2xl mb-4" style={{ color: 'var(--ink)' }}>${bike.estimatedValue.toLocaleString()}</div>
          {bike.description && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink)' }}>{bike.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
