'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BIKE_TYPES, CONDITIONS, TYPE_STYLE } from '@/lib/mockData';
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
      createdAt: new Date().toISOString(),
    });

    router.push('/profile');
  }

  const style = TYPE_STYLE[form.type] || TYPE_STYLE.Road;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--brand-dark)' }}>Post a bike</h1>
      <p className="text-sm text-gray-500 mb-6">List your bike so other riders can swipe on it.</p>

      <div
        className="rounded-2xl p-6 mb-6 text-white text-center"
        style={{ background: style.gradient }}
      >
        <div className="text-5xl mb-1">{style.emoji}</div>
        <div className="font-black text-lg">{form.title || 'Your bike title'}</div>
        <div className="text-sm text-white/85">{form.type} · {form.condition}</div>
        {form.estimatedValue && <div className="font-black mt-1">${Number(form.estimatedValue).toLocaleString()}</div>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-6 border border-gray-100">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. Trek Marlin 7"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            >
              {BIKE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => update('condition', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
            >
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated value ($)</label>
          <input
            required
            type="number"
            min="0"
            step="5"
            value={form.estimatedValue}
            onChange={(e) => update('estimatedValue', e.target.value)}
            placeholder="500"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">Used to suggest a fair cash top-up when someone proposes a trade.</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
          <input
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="e.g. Bentonville, AR"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            rows={3}
            placeholder="Frame size, upgrades, wear and tear..."
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full py-3 rounded-xl font-bold text-white"
          style={{ backgroundColor: 'var(--brand)' }}
        >
          Post bike
        </button>
      </form>
    </div>
  );
}
