import SurgeChart from './SurgeChart';
import DayOfWeekChart from './DayOfWeekChart';
import { surgesWithSuggestedRate, estimatedDailyRateByDayOfWeek } from './footTrafficModel';

export const metadata = {
  title: 'Bentonville Host Toolkit — bvento',
  description:
    'Over 1,150 Airbnb and VRBO listings compete for guests in Bentonville, Arkansas. Out-of-town visitor surge dates, suggested nightly rates, and STR market benchmarks to help you price yours to win.',
};

const HOW_IT_WORKS = [
  { step: '1', text: 'Check upcoming surge dates' },
  { step: '2', text: 'Compare to your normal weekly rate' },
  { step: '3', text: 'Update your price on Airbnb/VRBO' },
];

export default function HomePage() {
  const surges = surgesWithSuggestedRate();
  const dayOfWeek = estimatedDailyRateByDayOfWeek();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <p className="text-[10px] uppercase tracking-[0.14em] font-medium mt-2" style={{ color: 'var(--accent)' }}>
        For Airbnb &amp; VRBO hosts in Bentonville, AR
      </p>

      <h1 className="text-3xl sm:text-4xl font-medium mt-2 mb-5" style={{ color: 'var(--ink)' }}>
        Bentonville Host Toolkit
      </h1>

      <p className="text-sm leading-relaxed max-w-xl mb-6" style={{ color: 'var(--ink-soft)' }}>
        Over 1,150 Airbnb and VRBO listings compete for guests in Bentonville, Arkansas. We
        help you price yours to win — know exactly when to raise your rate before the surge
        hits.
      </p>

      <div className="grid grid-cols-3 gap-2 mb-8">
        {HOW_IT_WORKS.map((item) => (
          <div key={item.step} className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="font-medium text-lg" style={{ color: 'var(--accent)' }}>{item.step}</p>
            <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--ink)' }}>{item.text}</p>
          </div>
        ))}
      </div>

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
            Each one includes a suggested nightly rate, scaled from your normal weekly baseline.
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
                  <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                    ~{s.value.toLocaleString()} people
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
                    ~${s.suggestedRate}
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--ink-soft)' }}>suggested rate</div>
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
            Your baseline rate, before any surge
          </h2>
          <p className="text-xs px-1 pb-3" style={{ color: 'var(--ink-soft)' }}>
            This is what a normal night should cost, day by day - compare it against the
            suggested rates above for surge nights. Modeled estimate, not sourced data: the
            citywide ADR range's midpoint (~$184), adjusted for an assumed downtown location
            premium, then shaped by a typical weekday/weekend demand curve blended with our
            own {surges.length} identified
            surges. No platform publishes a real downtown-specific or day-of-week figure for
            Bentonville to check this against.
          </p>
          <div style={{ height: 240, position: 'relative' }}>
            <DayOfWeekChart days={dayOfWeek} />
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
          <p className="text-xs px-1 pt-3 mt-1" style={{ color: 'var(--ink)', borderTop: '1px solid var(--border)' }}>
            Pricing below $160 on a normal weekend, or below $270 on a surge night? You may
            be leaving money on the table.
          </p>
          <p className="text-[10px] px-1 pt-2" style={{ color: 'var(--ink-soft)' }}>
            Rate and occupancy ranges span AirDNA, Rabbu, and AirROI's published Bentonville
            figures (2026); RevPAR and listing count are AirDNA only, the sole source that
            reports them. Directional market context, not a guarantee for any individual listing.
          </p>
        </div>
      </section>

      <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
        List on Airbnb or VRBO in Northwest Arkansas? This is the first surge forecast from
        bvento — more markets coming soon.
      </p>

      <p className="text-[11px] mt-6 pt-4" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
        A foot traffic planning estimate, not a measured count.
      </p>
    </div>
  );
}
