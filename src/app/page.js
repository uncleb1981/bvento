import SurgeChart from './SurgeChart';
import DayOfWeekChart from './DayOfWeekChart';
import MonthlyRateChart from './MonthlyRateChart';
import PlatformBenchmarksTable from './PlatformBenchmarksTable';
import GrowthChart from './GrowthChart';
import { surgesWithSuggestedRate, estimatedRateByDayOfWeekBySize, ratesByBedroomCount, platformRatesByBedroomCount, estimatedRateByMonthBySize, populationHistory, strListingHistory } from './footTrafficModel';

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
  const platformBySize = platformRatesByBedroomCount();
  const monthlyRates = estimatedRateByMonthBySize();
  const population = populationHistory();
  const strListings = strListingHistory();

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
            A few are massive regional draws in Rogers (NWA Championship, Bikes Blues &amp;
            BBQ) close enough to spill into Bentonville lodging - marked "regional
            spillover," those crowd sizes are our modeled estimate of that overflow, not
            the events' full regional attendance.
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

          <p className="text-[11px] uppercase tracking-wide px-1 pt-5" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
            By month
          </p>
          <p className="text-[10px] px-1 pt-1 pb-2" style={{ color: 'var(--ink-soft)' }}>
            Modeled seasonal curve, not sourced per-month data. Rabbu publishes only two real
            anchors for Bentonville - July as the peak month (~$3,198 avg monthly revenue per
            listing) and a winter low (~$1,092) - so this is a smooth curve fit to that ~2.9x
            swing, not independently sourced month by month.
          </p>
          <div style={{ height: 260, position: 'relative' }}>
            <MonthlyRateChart months={monthlyRates} />
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

          <PlatformBenchmarksTable bySize={platformBySize} />
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

      <section className="mb-8">
        <div
          className="rounded-2xl p-3"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h2 className="font-medium px-1 pt-1" style={{ color: 'var(--ink)' }}>
            Why Bentonville's STR market keeps growing
          </h2>
          <p className="text-xs px-1 pb-3" style={{ color: 'var(--ink-soft)' }}>
            Population is real, multi-point Census data. STR listings is only two known dated
            points - Bentonville has never required STR registration, so no one has tracked a
            count in between; the dashed line just connects them, it isn't a known trend.
          </p>
          <div style={{ height: 280, position: 'relative' }}>
            <GrowthChart population={population} strListings={strListings} />
          </div>
          <p className="text-[10px] px-1 pt-3 mt-1" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
            Population: US Census (2020) and Census/ACS annual estimates (2021–2023). STR
            listings: 484 total listed over a trailing 12 months as of Jan
            2021 (Bentonville city planning staff, reported by the NWA Democrat-Gazette,
            Mar 10 2021) and ~1,160 active listings today (AirDNA, 2026) - the two counting
            methods likely aren't perfectly consistent with each other, so treat this as
            directional growth evidence, not a precise trend.
          </p>
        </div>
      </section>

      <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
        List on Airbnb or VRBO in Northwest Arkansas? This is the first pricing toolkit from
        bvento — more markets coming soon.
      </p>

      <p className="text-[11px] mt-6 pt-4" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
        Surge dates, suggested premiums, baseline rates, and market benchmarks are all
        modeled guidance built from public event and platform data — not a guarantee of
        bookings, revenue, or any individual listing's performance.
      </p>
    </div>
  );
}
