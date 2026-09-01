import WeekendChart from './WeekendChart';
import FootTrafficZones from '@/components/FootTrafficZones';
import { WEEKENDS } from './footTrafficModel';

export const metadata = {
  title: 'Bentonville Foot Traffic Forecast — bvento',
  description:
    'An hour-by-hour foot traffic forecast for downtown Bentonville, AR, for food trucks, canvassers, and anyone who needs to meet people — built from public event data on First Friday, the farmers market, Trifest for MS, and Crystal Bridges.',
};

const EVENTS = [
  {
    when: 'Thu 6–8pm',
    name: 'Live at the Pavilion + Pickin’ on the Square',
    detail: 'Recurring weekly draw, no published attendance figure',
    tier: 'estimated',
  },
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
      <h1 className="text-3xl sm:text-4xl font-medium mt-2 mb-5" style={{ color: 'var(--ink)' }}>
        Bentonville Foot Traffic Forecast
      </h1>

      <p className="text-sm leading-relaxed max-w-md mb-6" style={{ color: 'var(--ink-soft)' }}>
        Know where downtown fills up, hour by hour — built for food trucks, canvassers, and
        anyone who needs to meet people, not just sell to them.
      </p>

      {WEEKENDS.map((weekend, i) => (
        <section key={weekend.id} className={i === 0 ? 'mb-6' : 'mb-8'}>
          <div
            className="rounded-2xl p-3"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h2 className="font-medium px-1 pt-1 pb-2" style={{ color: 'var(--ink)' }}>
              {weekend.dateRange}
            </h2>
            <div style={{ height: 300, position: 'relative' }}>
              <WeekendChart events={weekend.events} weekendLabel={weekend.dateRange} />
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <FootTrafficZones events={weekend.events} />
            </div>
          </div>
        </section>
      ))}

      <section className="mb-8">
        <h2 className="font-medium mb-3" style={{ color: 'var(--ink)' }}>What&apos;s driving the foot traffic</h2>
        <div className="rounded-2xl px-4" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          {EVENTS.map((e, i) => (
            <div
              key={e.name}
              className="flex items-baseline justify-between gap-3 py-3"
              style={i < EVENTS.length - 1 ? { borderBottom: '1px solid var(--border)' } : undefined}
            >
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

      <p className="text-sm" style={{ color: 'var(--ink-soft)' }}>
        Want a foot traffic forecast for your own event, campaign, or business? This is the
        first Northwest Arkansas forecast from bvento — more coming soon.
      </p>

      <p className="text-[11px] mt-6 pt-4" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
        A foot traffic planning estimate, not a measured count.
      </p>
    </div>
  );
}
