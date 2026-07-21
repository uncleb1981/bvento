'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BIKE_TYPES, CONDITIONS, TYPE_PHOTO } from '@/lib/mockData';
import { addMyBike, getUser } from '@/lib/store';
import { getSupabase } from '@/lib/supabase';

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
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
    setUploadError('');
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
    const user = getUser();
    if (!form.title.trim() || !form.estimatedValue) return;

    let photo = TYPE_PHOTO[form.type];
    if (photoFile) {
      setUploading(true);
      setUploadError('');
      try {
        photo = await uploadPhoto(user.id);
      } catch (err) {
        setUploading(false);
        setUploadError(err.message?.includes('Bucket not found')
          ? 'Photo storage isn’t set up yet — posted with a placeholder photo instead.'
          : `Photo upload failed (${err.message || 'unknown error'}) — posted with a placeholder photo instead.`);
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
        return;
      }
      setUploading(false);
    }

    addMyBike({
      id: `my-bike-${Date.now()}`,
      ownerId: user.id,
      title: form.title.trim(),
      type: form.type,
      condition: form.condition,
      estimatedValue: Number(form.estimatedValue),
      description: form.description.trim(),
      city: form.city.trim() || user.city,
      photo,
      createdAt: new Date().toISOString(),
    });

    router.push('/profile');
  }

  const previewPhoto = photoPreview || TYPE_PHOTO[form.type];

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
      {uploadError && <p className="text-xs -mt-4 mb-6" style={{ color: '#8A2A1F' }}>{uploadError}</p>}
      {!photoFile && !uploadError && <p className="text-xs -mt-4 mb-6" style={{ color: 'var(--ink-soft)' }}>No photo yet — showing a placeholder for {form.type} bikes.</p>}

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
          disabled={uploading}
          className="w-full py-3 font-medium text-white disabled:opacity-60"
          style={{ backgroundColor: 'var(--ink)' }}
        >
          {uploading ? 'Uploading photo…' : 'Post bike'}
        </button>
      </form>
    </div>
  );
}
