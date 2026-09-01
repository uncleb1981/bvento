const ZONES = [
  { name: 'The Square', value: 5200 },
  { name: 'Crystal Bridges + Momentary', value: 600 },
  { name: 'Melvin Ford Aquatic Center', value: 250 },
];

const max = Math.max(...ZONES.map((z) => z.value));

function heatColor(intensity) {
  // intensity 0-1 -> light cream through to full terracotta accent
  const stops = [
    { t: 0, c: [241, 228, 217] }, // var(--accent-soft)
    { t: 1, c: [179, 67, 30] }, // var(--accent)
  ];
  const [r, g, b] = stops[0].c.map((v, i) => Math.round(v + (stops[1].c[i] - v) * intensity));
  return `rgb(${r}, ${g}, ${b})`;
}

export default function FootTrafficZones() {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>Where — right now</p>
        <p className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>Fri 7–8pm</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {ZONES.map((z) => {
          const intensity = z.value / max;
          const bg = heatColor(intensity);
          const dark = intensity > 0.55;
          return (
            <div
              key={z.name}
              className="rounded-xl p-3 flex flex-col justify-between"
              style={{ backgroundColor: bg, minHeight: 84 }}
            >
              <p
                className="text-[11px] leading-tight"
                style={{ color: dark ? 'rgba(246,243,236,0.85)' : 'var(--ink-soft)' }}
              >
                {z.name}
              </p>
              <p
                className="font-medium text-lg mt-2"
                style={{ color: dark ? '#F6F3EC' : 'var(--ink)' }}
              >
                ~{z.value.toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
