import WeekendChart from './WeekendChart';
import FootTrafficZones from '@/components/FootTrafficZones';

export const metadata = {
  title: 'Bentonville Foot Traffic Forecast — bvento',
  description:
    'An hour-by-hour foot traffic forecast for downtown Bentonville, AR — built from public event data on First Friday, the farmers market, Trifest for MS, and Crystal Bridges.',
};

const EVENTS = [
  {
    when: 'Fri 5–9pm',
    name: 'First Friday Live',
    detail: '~9,000–12,000 total turnout, Bentonville Square',
    tier: 'sourced',
  },
  {
    when: 'Fri 6–9pm',
    name: 'Trifest youth triathlon',
    detail: '~250 of 1,500 weekend racers, Melvin Ford Aquatic Center',
    tier: 'estimated',
  },
  {
    when: 'Sat 7:30am–1pm',
    name: 'Farmers market on the Square',
    detail: '3,500–5,000, larger on peak weekends',
    tier: 'sourced',
  },
  {
    when: 'Sat ~7–9am',
    name: 'Trifest sprint',
    detail: '~800 of 1,500 weekend racers',
    tier: 'estimated',
  },
  {
    when: 'Fri / Sat / Sun',
    name: 'Crystal Bridges + the Momentary',
    detail: 'Hours are real; the daily crowd size is our estimate from ~800k visitors a year',
    tier: 'derived',
  },
  {
    when: 'Sun ~7–9am',
    name: 'Trifest super sprint',
    detail: '~450 of 1,500 weekend racers',
    tier: 'estimated',
  },
  {
    when: 'Sat 3:15pm',
    name: 'Razorbacks vs. North Alabama',
    detail: 'Fayetteville — regional draw, not counted in totals above',
    tier: 'context',
  },
];

const TIER_LABEL = {
  sourced: 'Confirmed',
  estimated: 'Our estimate',
  derived: 'Our estimate',
  context: 'Not counted',
};

function Chip({ tier }) {
  const styles =
    tier === 'sourced'
      ? { backgroundColor: 'var(--accent-soft)', color: 'var(--accent)' }
      : tier === 'context'
      ? { backgroundColor: 'var(--surface)', color: 'var(--ink-soft)', border: '1px solid var(--border)' }
      : { backgroundColor: 'var(--border)', color: 'var(--ink-soft)' };
  return (
    <span
      className="text-[10px] uppercase tracking-wide px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0"
      style={styles}
    >
      {TIER_LABEL[tier]}
    </span>
  );
}

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>
        Northwest Arkansas · Fri Sep 4 – Sun Sep 6, 2026
      </p>
      <h1 className="font-serif italic text-3xl sm:text-4xl mt-2 mb-5" style={{ color: 'var(--ink)' }}>
        Bentonville Foot Traffic Forecast
      </h1>

      <section className="mb-6">
        <div
          className="rounded-2xl p-3 animate-pop-in"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div style={{ height: 300, position: 'relative' }}>
            <WeekendChart />
          </div>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
            <FootTrafficZones />
          </div>
        </div>
      </section>

      <p className="text-sm leading-relaxed max-w-md mb-8" style={{ color: 'var(--ink-soft)' }}>
        An hour-by-hour foot traffic forecast for downtown — built for local businesses planning
        staffing, inventory, and promotions around the busiest times. Based on public event
        schedules, not measured counts.
      </p>

      <div className="grid grid-cols-3 gap-2.5 mb-8">
        {[
          ['First Friday turnout', '9,000–12,000', 'Typical monthly crowd'],
          ['Trifest racers', '1,500', 'Across 5 races, 3 days'],
          ['Farmers market', '3,500–5,000', 'Saturday, 7:30am–1pm'],
        ].map(([label, value, sub]) => (
          <div key={label} className="rounded-xl p-3" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <p className="text-[10px] uppercase tracking-wide mb-1" style={{ color: 'var(--ink-soft)' }}>{label}</p>
            <p className="font-medium text-base" style={{ color: 'var(--ink)' }}>{value}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>{sub}</p>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="font-medium mb-3" style={{ color: 'var(--ink)' }}>What&apos;s driving the foot traffic</h2>
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {EVENTS.map((e) => (
            <div key={e.name} className="flex items-baseline justify-between gap-3 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="text-[11px] w-20 flex-shrink-0 pt-0.5" style={{ color: 'var(--ink-soft)' }}>{e.when}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: 'var(--ink)' }}>{e.name}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>{e.detail}</div>
              </div>
              <Chip tier={e.tier} />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-medium mb-3" style={{ color: 'var(--ink)' }}>How sure are we?</h2>
        <div
          className="rounded-2xl p-4 text-xs leading-relaxed space-y-2.5"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--ink-soft)' }}
        >
          <p>
            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>Confirmed</span> numbers are real:
            First Friday&apos;s usual crowd, the farmers market&apos;s usual crowd, how many people are
            racing in Trifest, and Crystal Bridges&apos; hours and yearly visitor count.
          </p>
          <p>
            <span style={{ color: 'var(--ink)', fontWeight: 500 }}>Our estimate</span> means we made a
            reasonable guess on top of those real numbers — like how the Trifest racers split across
            three days, or how many people visit Crystal Bridges on a given day.
          </p>
          <p>
            The chart is a smoothed curve, not dozens of separate counts. Overnight numbers are just
            a low placeholder. And we only counted racers, not the friends and family watching.
          </p>
        </div>
      </section>

      <div
        className="rounded-2xl p-4 mt-8 text-center"
        style={{ backgroundColor: 'var(--accent-soft)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--ink)' }}>
          Want a foot traffic forecast for your own event or business?
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--ink-soft)' }}>
          This is the first Northwest Arkansas forecast from bvento — more coming soon.
        </p>
      </div>

      <p className="text-[11px] mt-4 pt-4" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
        A foot traffic planning estimate, not a measured count.
      </p>
    </div>
  );
}
