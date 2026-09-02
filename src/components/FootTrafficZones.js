import { LOCATIONS, hourlyByLocation, eventDateTimeLabel } from '@/app/footTrafficModel';

const MIN_ZONE_VALUE = 1000;

function heatColor(intensity) {
  // intensity 0-1 -> light cream through to full terracotta accent
  const light = [241, 228, 217]; // var(--accent-soft)
  const dark = [179, 67, 30]; // var(--accent)
  const [r, g, b] = light.map((v, i) => Math.round(v + (dark[i] - v) * intensity));
  return `rgb(${r}, ${g}, ${b})`;
}

function argmax(series) {
  let best = 0;
  for (let i = 1; i < series.length; i++) if (series[i] > series[best]) best = i;
  return best;
}

// Each zone reports its OWN peak hour, not a single instant shared across
// every zone - otherwise a dominant event elsewhere on the calendar (e.g. a
// Friday-night football game) can wash out a zone whose peak lands at a
// completely different hour (e.g. Saturday's farmers market on the Square).
// Only zones whose peak tops MIN_ZONE_VALUE are shown - this heatmap is for
// the crowds worth planning around, not routine ambient foot traffic.
function buildZones(events, weekendStart) {
  const zones = Object.values(LOCATIONS)
    .map((name) => {
      const series = hourlyByLocation(events, name);
      const peakIdx = argmax(series);
      return {
        name,
        value: Math.round(series[peakIdx]),
        when: eventDateTimeLabel(weekendStart, peakIdx),
      };
    })
    .filter((z) => z.value > MIN_ZONE_VALUE);
  zones.sort((a, b) => b.value - a.value);
  return zones;
}

export default function FootTrafficZones({ events, weekendStart }) {
  const zones = buildZones(events, weekendStart);
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
              <div>
                <p
                  className="font-medium text-lg mt-2"
                  style={{ color: dark ? '#F6F3EC' : 'var(--ink)' }}
                >
                  ~{z.value.toLocaleString()}
                </p>
                <p
                  className="text-[10px] mt-0.5"
                  style={{ color: dark ? 'rgba(246,243,236,0.75)' : 'var(--ink-soft)' }}
                >
                  {z.when}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
