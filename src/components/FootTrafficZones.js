import { LOCATIONS, hourlyByLocation, peakHourIndex } from '@/app/footTrafficModel';

function heatColor(intensity) {
  // intensity 0-1 -> light cream through to full terracotta accent
  const light = [241, 228, 217]; // var(--accent-soft)
  const dark = [179, 67, 30]; // var(--accent)
  const [r, g, b] = light.map((v, i) => Math.round(v + (dark[i] - v) * intensity));
  return `rgb(${r}, ${g}, ${b})`;
}

function buildZones(events) {
  const peakIdx = peakHourIndex(events);
  const zones = Object.values(LOCATIONS).map((name) => ({
    name,
    value: Math.round(hourlyByLocation(events, name)[peakIdx]),
  }));
  zones.sort((a, b) => b.value - a.value);
  return { zones, peakIdx };
}

export default function FootTrafficZones({ events }) {
  const { zones } = buildZones(events);
  const max = Math.max(...zones.map((z) => z.value));

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {zones.map((z) => {
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
