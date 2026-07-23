import { photoForBike } from '@/lib/mockData';

export default function BikeCard({ bike, dragX = 0, dragging = false }) {
  const rotate = Math.max(-14, Math.min(14, dragX / 14));
  const likeOpacity = Math.min(1, Math.max(0, dragX / 100));
  const passOpacity = Math.min(1, Math.max(0, -dragX / 100));

  return (
    <div
      className="absolute inset-0 rounded-2xl overflow-hidden select-none"
      style={{
        transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
        transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
        boxShadow: '0 20px 40px -12px rgba(20, 23, 31, 0.35)',
        border: '1px solid rgba(20,23,31,0.06)',
      }}
    >
      <img
        src={photoForBike(bike)}
        alt={bike.title}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(14,16,20,0.88) 0%, rgba(14,16,20,0.15) 45%, rgba(14,16,20,0) 65%)' }} />

      {bike.isDemo && (
        <div
          className="absolute top-6 left-1/2 -translate-x-1/2 text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1 rounded-full text-white pointer-events-none"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Demo
        </div>
      )}

      <div
        className="absolute top-6 left-6 flex items-center justify-center rounded-full pointer-events-none backdrop-blur-sm"
        style={{
          width: 128,
          height: 128,
          border: '5px solid var(--accent)',
          backgroundColor: 'rgba(246,243,236,0.92)',
          boxShadow: '0 4px 16px rgba(20,23,31,0.25)',
          opacity: likeOpacity,
          transform: `rotate(-8deg) scale(${0.85 + likeOpacity * 0.25})`,
        }}
      >
        <svg width="52" height="52" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--accent)" strokeWidth="1">
          <path d="M12 21s-6.7-4.35-9.33-8.2C.9 10.1 1.4 6.6 4.2 4.9c2.3-1.4 4.9-.7 6.4 1.1L12 7.4l1.4-1.4c1.5-1.8 4.1-2.5 6.4-1.1 2.8 1.7 3.3 5.2 1.53 7.9C18.7 16.65 12 21 12 21z" />
        </svg>
      </div>
      <div
        className="absolute top-6 right-6 flex items-center justify-center rounded-full pointer-events-none backdrop-blur-sm"
        style={{
          width: 128,
          height: 128,
          border: '5px solid #DC2626',
          backgroundColor: 'rgba(246,243,236,0.92)',
          boxShadow: '0 4px 16px rgba(20,23,31,0.25)',
          opacity: passOpacity,
          transform: `rotate(8deg) scale(${0.85 + passOpacity * 0.25})`,
        }}
      >
        <svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
          <path strokeLinecap="round" d="M7 7l10 10M17 7L7 17" />
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">{bike.type}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">{bike.condition}</span>
        </div>
        <h2 className="font-serif text-3xl leading-tight">{bike.title}</h2>
        <p className="text-sm text-white/75 mt-1">{bike.city} · {bike.ownerName}</p>
        <p className="text-sm text-white/85 mt-2 line-clamp-2 max-w-md">{bike.description}</p>
        <div className="font-serif text-2xl mt-3">${bike.estimatedValue.toLocaleString()}</div>
      </div>
    </div>
  );
}
