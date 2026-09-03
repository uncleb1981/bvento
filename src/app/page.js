import SurgeChart from './SurgeChart';
import { surgeEvents } from './footTrafficModel';

export const metadata = {
  title: 'Bentonville Rate Radar — bvento',
  description:
    'Know which Bentonville nights to raise your rate. Out-of-town visitor surge dates and STR market benchmarks for short-term rental hosts, built from real event data on First Friday, Momentary concerts, regional cycling races, and more.',
};

export default function HomePage() {
  const surges = surgeEvents();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-3xl sm:text-4xl font-medium mt-2 mb-5" style={{ color: 'var(--ink)' }}>
        Bentonville Rate Radar
      </h1>

      <p className="text-sm leading-relaxed max-w-xl mb-3" style={{ color: 'var(--ink-soft)' }}>
        Crowd surge insights for Bentonville's short-term rental hosts — know when to raise
        your rates before the surge hits.
      </p>

      <ul className="text-sm leading-relaxed max-w-xl mb-6 space-y-2">
        <li className="flex gap-2" style={{ color: 'var(--ink-soft)' }}>
          <span style={{ color: 'var(--accent)' }}>—</span>
          <span>Exact dates when out-of-town demand spikes — Zedd, Chance the Rapper, Big Sugar Gravel, First Friday, and more</span>
        </li>
        <li className="flex gap-2" style={{ color: 'var(--ink-soft)' }}>
          <span style={{ color: 'var(--accent)' }}>—</span>
          <span>Real multi-night booking windows, not just a single peak hour — know exactly how many nights to raise your minimum stay</span>
        </li>
        <li className="flex gap-2" style={{ color: 'var(--ink-soft)' }}>
          <span style={{ color: 'var(--accent)' }}>—</span>
          <span>Market rate and occupancy benchmarks, so you know if you're leaving money on the table even on a normal weekend</span>
        </li>
      </ul>

      <section className="mb-8">
        <div
          className="rounded-2xl p-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h2 className="font-medium px-1 pt-1" style={{ color: 'var(--ink)' }}>
            Out-of-town visitor surges, Sep – Oct 2026
          </h2>
          <p className="text-xs px-1 pb-3" style={{ color: 'var(--ink-soft)' }}>
            Every date below is a real driver of overnight guests booking a place to stay -
            not local foot traffic like the farmers market or a high school football game.
          </p>
          <div style={{ height: 300, position: 'relative' }}>
            <SurgeChart surges={surges} />
          </div>
          <div className="mt-4 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
            {surges.map((s, i) => (
              <div
                key={s.sortKey}
                className="flex items-baseline justify-between gap-3 py-3"
                style={i < surges.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{s.label}</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                    Book for {s.bookingWindow} · {s.location}
                  </div>
                </div>
                <div className="text-sm font-medium flex-shrink-0" style={{ color: 'var(--accent)' }}>
                  ~{s.value.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div
          className="rounded-2xl p-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h2 className="font-medium px-1 pt-1" style={{ color: 'var(--ink)' }}>
            Bentonville STR market benchmarks
          </h2>
          <p className="text-xs px-1 pb-3" style={{ color: 'var(--ink-soft)' }}>
            Third-party market-data platforms disagree meaningfully on Bentonville's numbers -
            shown here as ranges rather than a single figure.
          </p>
          <div className="grid grid-cols-2 gap-2 px-1">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>Avg. daily rate</p>
              <p className="font-medium text-lg mt-1" style={{ color: 'var(--ink)' }}>$160–208</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>Occupancy</p>
              <p className="font-medium text-lg mt-1" style={{ color: 'var(--ink)' }}>43–57%</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>RevPAR</p>
              <p className="font-medium text-lg mt-1" style={{ color: 'var(--ink)' }}>~$111</p>
            </div>
            <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>Active listings</p>
              <p className="font-medium text-lg mt-1" style={{ color: 'var(--ink)' }}>~1,150</p>
            </div>
          </div>
          <p className="text-[10px] px-1 pt-3 mt-1" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
            Rate and occupancy ranges span AirDNA, Rabbu, and AirROI's published Bentonville
            figures (2026); RevPAR and listing count are AirDNA only, the sole source that
            reports them. Directional market context, not a guarantee for any individual listing.
          </p>
        </div>
      </section>

      <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
        Run a short-term rental or boutique hotel in Northwest Arkansas? This is the first
        surge forecast from bvento — more markets coming soon.
      </p>

      <p className="text-[11px] mt-6 pt-4" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
        A foot traffic planning estimate, not a measured count.
      </p>
    </div>
  );
}
