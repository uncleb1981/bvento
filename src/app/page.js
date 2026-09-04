import SurgeChart from './SurgeChart';
import DayOfWeekChart from './DayOfWeekChart';
import { surgesWithSuggestedRate, estimatedRateByDayOfWeekBySize, ratesByBedroomCount } from './footTrafficModel';

export const metadata = {
  title: 'Bentonville Host Pricing Toolkit — bvento',
  description:
    'Over 1,150 Airbnb and VRBO listings compete for guests in Bentonville, Arkansas. Out-of-town visitor surge dates, suggested nightly rates, and STR market benchmarks to help you price yours to win.',
};

const HOW_IT_WORKS = [
  { step: '1', text: 'Check upcoming surge dates' },
  { step: '2', text: 'Compare to your normal weekly rate' },
  { step: '3', text: 'Optimize your price on Airbnb/VRBO' },
];

export default function HomePage() {
  const surges = surgesWithSuggestedRate();
  const byBedroom = estimatedRateByDayOfWeekBySize();
  const bedroomRates = ratesByBedroomCount();

  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <p className="text-[10px] uppercase tracking-[0.14em] font-medium mt-2" style={{ color: 'var(--accent)' }}>
        For Airbnb &amp; VRBO hosts in Bentonville, AR
      </p>

      <h1 className="text-3xl sm:text-4xl font-medium mt-2 mb-5" style={{ color: 'var(--ink)' }}>
        Bentonville Host Pricing Toolkit
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
          </p>
          <div style={{ height: 300, position: 'relative' }}>
            <SurgeChart surges={surges} />
          </div>
          <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-[11px] uppercase tracking-wide px-1 pb-1" style={{ color: 'var(--ink-soft)' }}>
              Suggested rate premium
            </p>
            <p className="text-xs px-1 pb-2" style={{ color: 'var(--ink-soft)' }}>
              How much more to charge above your normal baseline rate for each surge.
            </p>
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
                  <div className="text-lg font-medium" style={{ color: 'var(--accent)' }}>
                    +{s.pctIncrease}%
                  </div>
                  <div className="text-[10px]" style={{ color: 'var(--ink-soft)' }}>premium</div>
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
            Your baseline rate, by property size
          </h2>
          <p className="text-xs px-1 pb-3" style={{ color: 'var(--ink-soft)' }}>
            Modeled estimate, anchored to Rabbu's published studio and 4BR Bentonville rates.
          </p>
          <div style={{ height: 260, position: 'relative' }}>
            <DayOfWeekChart studio={byBedroom.studio} fourBedroom={byBedroom.fourBedroom} />
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
            Average daily rate by unit size, and each market-data platform's own reported
            numbers side by side.
          </p>

          <p className="text-[11px] uppercase tracking-wide px-1 pt-1 pb-2" style={{ color: 'var(--ink-soft)' }}>
            By unit size
          </p>
          <div className="px-1">
            {bedroomRates.map((b, i) => (
              <div
                key={b.size}
                className="flex items-center justify-between py-2"
                style={i < bedroomRates.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
              >
                <span className="text-sm" style={{ color: 'var(--ink)' }}>{b.size}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
                  ${b.rate}{!b.sourced && '*'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] px-1 pt-2" style={{ color: 'var(--ink-soft)' }}>
            * Interpolated between Studio and 4 Bedroom - not independently published by any
            source we could find.
          </p>

          <p className="text-[11px] uppercase tracking-wide px-1 pt-5" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
            By platform
          </p>
          <p className="text-[10px] px-1 pt-1 pb-2" style={{ color: 'var(--ink-soft)' }}>
            Blended across every unit size (unlike the table above) - each platform's own
            reported Bentonville-wide figure.
          </p>
          <div className="overflow-x-auto px-1">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th className="text-left font-medium pb-2" style={{ color: 'var(--ink-soft)' }}></th>
                  <th className="text-right font-medium pb-2" style={{ color: 'var(--ink)' }}>AirDNA</th>
                  <th className="text-right font-medium pb-2" style={{ color: 'var(--ink)' }}>Rabbu</th>
                  <th className="text-right font-medium pb-2" style={{ color: 'var(--ink)' }}>AirROI</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-2" style={{ color: 'var(--ink-soft)' }}>Avg. daily rate</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink)' }}>$208</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink)' }}>$160</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-2" style={{ color: 'var(--ink-soft)' }}>Occupancy <span className="text-[10px]">(% of nights booked)</span></td>
                  <td className="text-right py-2" style={{ color: 'var(--ink)' }}>56%</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink)' }}>43%</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-2" style={{ color: 'var(--ink-soft)' }}>RevPAR <span className="text-[10px]">(rate × occupancy)</span></td>
                  <td className="text-right py-2" style={{ color: 'var(--ink)' }}>$111</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-2" style={{ color: 'var(--ink-soft)' }}>Active listings <span className="text-[10px]">(total tracked)</span></td>
                  <td className="text-right py-2" style={{ color: 'var(--ink)' }}>~1,160</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
                </tr>
                <tr style={{ borderTop: '1px solid var(--border)' }}>
                  <td className="py-2" style={{ color: 'var(--ink-soft)' }}>Avg. annual revenue <span className="text-[10px]">(per listing)</span></td>
                  <td className="text-right py-2" style={{ color: 'var(--ink)' }}>~$25.2K</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
                  <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs px-1 pt-4 mt-1" style={{ color: 'var(--ink)', borderTop: '1px solid var(--border)' }}>
            Pricing below $160 on a normal weekend, or below $270 on a surge night? You may
            be leaving money on the table.
          </p>
          <p className="text-[10px] px-1 pt-2" style={{ color: 'var(--ink-soft)' }}>
            Each platform's own reported Bentonville figures (2026); a dash means that
            platform doesn't publish that metric. Directional market context, not a
            guarantee for any individual listing.
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
