import { TYPE_STYLE } from '@/lib/mockData';

export default function BikeCard({ bike, dragX = 0, dragging = false }) {
  const style = TYPE_STYLE[bike.type] || TYPE_STYLE.Road;
  const rotate = Math.max(-18, Math.min(18, dragX / 12));
  const likeOpacity = Math.min(1, Math.max(0, dragX / 100));
  const passOpacity = Math.min(1, Math.max(0, -dragX / 100));

  return (
    <div
      className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl select-none"
      style={{
        transform: `translateX(${dragX}px) rotate(${rotate}deg)`,
        transition: dragging ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)',
        background: style.gradient,
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center text-[9rem] opacity-90 pointer-events-none">
        {style.emoji}
      </div>

      <div
        className="absolute top-6 left-6 border-4 rounded-xl px-3 py-1 text-2xl font-black uppercase tracking-wider pointer-events-none"
        style={{ borderColor: '#22C55E', color: '#22C55E', opacity: likeOpacity, transform: 'rotate(-12deg)' }}
      >
        Trade
      </div>
      <div
        className="absolute top-6 right-6 border-4 rounded-xl px-3 py-1 text-2xl font-black uppercase tracking-wider pointer-events-none"
        style={{ borderColor: '#EF4444', color: '#EF4444', opacity: passOpacity, transform: 'rotate(12deg)' }}
      >
        Pass
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5 text-white" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75), transparent)' }}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm">{bike.type}</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/25 backdrop-blur-sm">{bike.condition}</span>
        </div>
        <h2 className="text-2xl font-black leading-tight">{bike.title}</h2>
        <p className="text-sm text-white/85 mt-0.5">{bike.city} · {bike.ownerName}</p>
        <p className="text-sm text-white/90 mt-2 line-clamp-2">{bike.description}</p>
        <div className="text-xl font-black mt-2">${bike.estimatedValue.toLocaleString()}</div>
      </div>
    </div>
  );
}
