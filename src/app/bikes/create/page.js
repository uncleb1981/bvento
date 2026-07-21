'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BIKE_TYPES, CONDITIONS, TYPE_PHOTO } from '@/lib/mockData';
import { addMyBike, getUser } from '@/lib/store';

export default function CreateBikePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    type: BIKE_TYPES[0],
    condition: CONDITIONS[0],
    estimatedValue: '',
    description: '',
    city: '',
  });

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const user = getUser();
    if (!form.title.trim() || !form.estimatedValue) return;

    addMyBike({
      id: `my-bike-${Date.now()}`,
      ownerId: user.id,
      title: form.title.trim(),
      type: form.type,
      condition: form.condition,
      estimatedValue: Number(form.estimatedValue),
      description: form.description.trim(),
      city: form.city.trim() || user.city,
      photo: TYPE_PHOTO[form.type],
      createdAt: new Date().toISOString(),
    });

    router.push('/profile');
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl mb-1" style={{ color: 'var(--ink)' }}>Post a bike</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>List your bike so other riders can swipe on it.</p>

      <div className="relative h-48 mb-6 overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <img src={TYPE_PHOTO[form.type]} alt={form.type} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 text-white" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.85), transparent 55%)' }}>
          <div className="font-serif text-2xl">{form.title || 'Your bike title'}</div>
          <div className="text-sm text-white/80">{form.type} · {form.condition}</div>
          {form.estimatedValue && <div className="font-serif text-xl mt-1">${Number(form.estimatedValue).toLocaleString()}</div>}
        </div>
      </div>
      <p className="text-xs mb-6" style={{ color: 'var(--ink-soft)' }}>Photo shown is a placeholder by bike type — photo uploads aren&apos;t wired up yet.</p>

      <form onSubmit={handleSubmit} className="space-y-5 p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div>
          <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Trek Marlin 7"
            className="w-full px-4 py-2.5 text-sm"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Type</label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full px-3 py-2.5 text-sm"
              style={{ border: '1px solid var(--border)' }}
            >
              {BIKE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Condition</label>
            <select
              value={form.condition}
              onChange={(e) => update('condition', e.target.value)}
              className="w-full px-3 py-2.5 text-sm"
              style={{ border: '1px solid var(--border)' }}
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Estimated value ($)</label>
          <input
            required
            type="number"
            min="0"
            step="5"
            value={form.estimatedValue}
            onChange={(e) => update('estimatedValue', e.target.value)}
            placeholder="500"
            className="w-full px-4 py-2.5 text-sm"
            style={{ border: '1px solid var(--border)' }}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--ink-soft)' }}>Used to suggest a fair cash top-up when someone proposes a trade.</p>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>City</label>
          <input
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="e.g. Bentonville, AR"
            className="w-full px-4 py-2.5 text-sm"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            placeholder="Frame size, upgrades, wear and tear..."
            className="w-full px-4 py-2.5 text-sm resize-none"
            style={{ border: '1px solid var(--border)' }}
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 font-medium text-white"
          style={{ backgroundColor: 'var(--ink)' }}
        >
          Post bike
        </button>
      </form>
    </div>
  );
}
