'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BIKE_TYPES, CONDITIONS, TYPE_PHOTO } from '@/lib/mockData';
import { addMyBike, getCurrentUser } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';

export default function CreateBikePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [form, setForm] = useState({
    posterName: '',
    title: '',
    type: BIKE_TYPES[0],
    condition: CONDITIONS[0],
    estimatedValue: '',
    description: '',
    city: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const currentUser = await getCurrentUser();
      if (cancelled) return;
      if (!currentUser) {
        router.replace('/login?next=/bikes/create');
        return;
      }
      setUser(currentUser);
      if (currentUser.name) setForm((f) => ({ ...f, posterName: currentUser.name }));
      setCheckingAuth(false);
    })();
    return () => { cancelled = true; };
  }, [router]);

  useEffect(() => {
    if (!photoFile) return;
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubmitError('');
    setPhotoFile(file);
  }

  async function uploadPhoto(userId) {
    const supabase = getSupabase();
    const ext = photoFile.name.split('.').pop();
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error: uploadErr } = await supabase.storage.from('bike-photos').upload(path, photoFile);
    if (uploadErr) throw uploadErr;
    const { data } = supabase.storage.from('bike-photos').getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.posterName.trim() || !form.title.trim() || !form.estimatedValue || !user) return;

    setSubmitting(true);
    setSubmitError('');
    let photo = TYPE_PHOTO[form.type];
    let photoWarning = '';

    if (photoFile) {
      try {
        photo = await uploadPhoto(user.id);
      } catch (err) {
        photoWarning = err.message?.includes('Bucket not found')
          ? 'Photo storage isn’t set up yet — posted with a placeholder photo instead.'
          : `Photo upload failed (${err.message || 'unknown error'}) — posted with a placeholder photo instead.`;
      }
    }

    try {
      await addMyBike(user.id, {
        posterName: form.posterName.trim(),
        title: form.title.trim(),
        type: form.type,
        condition: form.condition,
        estimatedValue: Number(form.estimatedValue),
        description: form.description.trim(),
        city: form.city.trim() || user.city,
        photo,
      });
      router.push(photoWarning ? `/profile?notice=${encodeURIComponent(photoWarning)}` : '/profile');
    } catch (err) {
      setSubmitError(err.message || 'Something went wrong posting your bike.');
      setSubmitting(false);
    }
  }

  const previewPhoto = photoPreview || TYPE_PHOTO[form.type];

  if (checkingAuth) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-10">
      <h1 className="font-serif text-4xl mb-1" style={{ color: 'var(--ink)' }}>Post a bike</h1>
      <p className="text-sm mb-6" style={{ color: 'var(--ink-soft)' }}>List your bike so other riders can swipe on it.</p>

      <div className="relative h-48 mb-3 overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <img src={previewPhoto} alt={form.type} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 flex flex-col justify-end p-5 text-white" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.85), transparent 55%)' }}>
          <div className="font-serif text-2xl">{form.title || 'Your bike title'}</div>
          <div className="text-sm text-white/80">{form.type} · {form.condition}</div>
          {form.estimatedValue && <div className="font-serif text-xl mt-1">${Number(form.estimatedValue).toLocaleString()}</div>}
        </div>
      </div>

      <label className="block mb-6">
        <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.1em] font-medium px-4 py-2.5 cursor-pointer" style={{ border: '1px solid var(--ink)', color: 'var(--ink)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M4 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          {photoFile ? 'Change photo' : 'Upload a photo'}
        </span>
        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
      </label>
      {!photoFile && <p className="text-xs -mt-4 mb-6" style={{ color: 'var(--ink-soft)' }}>No photo yet — showing a placeholder for {form.type} bikes.</p>}
      {photoFile && <p className="text-xs -mt-4 mb-6" style={{ color: 'var(--ink-soft)' }}>{photoFile.name}</p>}

      <form onSubmit={handleSubmit} className="space-y-5 p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div>
          <FieldLabel required>Your first name</FieldLabel>
          <input
            required
            value={form.posterName}
            onChange={(e) => update('posterName', e.target.value)}
            placeholder="e.g. Ben"
            className="w-full px-4 py-2.5 text-sm"
            style={{ border: '1px solid var(--border)' }}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--ink-soft)' }}>Shown to other riders on this listing.</p>
        </div>

        <div>
          <FieldLabel required>Title</FieldLabel>
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
          <FieldLabel required>Estimated value ($)</FieldLabel>
          <input
            required
            type="number"
            min="0"
            step="5"
            value={form.estimatedValue}
            onChange={(e) => update('estimatedValue', e.target.value)}
            placeholder="e.g. 500"
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

        {submitError && <p className="text-sm" style={{ color: '#8A2A1F' }}>{submitError}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--ink)' }}
        >
          {submitting ? 'Posting…' : 'Post bike'}
        </button>
      </form>
    </div>
  );
}

function FieldLabel({ children, required = false }) {
  return (
    <label className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] font-medium mb-1.5" style={{ color: 'var(--ink-soft)' }}>
      {children}
      {required && (
        <span className="text-[10px] normal-case tracking-normal font-semibold px-1.5 py-0.5" style={{ color: 'var(--accent)', border: '1px solid var(--accent-soft)', backgroundColor: 'var(--accent-soft)' }}>
          Required
        </span>
      )}
    </label>
  );
}
