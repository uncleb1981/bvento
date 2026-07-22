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
        className="absolute top-6 left-6 border-2 rounded px-3 py-1 text-lg font-serif italic uppercase tracking-wider pointer-events-none backdrop-blur-sm"
        style={{ borderColor: '#EDE6D6', color: '#EDE6D6', opacity: likeOpacity, transform: 'rotate(-8deg)' }}
      >
        Trade
      </div>
      <div
        className="absolute top-6 right-6 border-2 rounded px-3 py-1 text-lg font-serif italic uppercase tracking-wider pointer-events-none backdrop-blur-sm"
        style={{ borderColor: '#EDE6D6', color: '#EDE6D6', opacity: passOpacity, transform: 'rotate(8deg)' }}
      >
        Pass
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
