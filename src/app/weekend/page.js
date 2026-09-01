import WeekendChart from './WeekendChart';

export const metadata = {
  title: 'This Weekend in Bentonville — bvento',
  description:
    'An hour-by-hour look at where the crowds are in downtown Bentonville, AR this weekend — First Friday, the farmers market, Trifest for MS, and Crystal Bridges.',
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

export default function WeekendPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>
        Northwest Arkansas · Fri Sep 4 – Sun Sep 6, 2026
      </p>
      <h1 className="font-serif italic text-4xl mt-2 mb-3" style={{ color: 'var(--ink)' }}>
        This weekend in Bentonville
      </h1>
      <p className="text-sm leading-relaxed max-w-md mb-6" style={{ color: 'var(--ink-soft)' }}>
        See where the crowds will be, hour by hour. Based on public event schedules — not actual
        foot-traffic counts.
      </p>

      <div
        className="rounded-2xl px-6 py-7 mb-8 text-center"
        style={{ backgroundColor: 'var(--ink)' }}
      >
        <div
          className="text-[11px] uppercase tracking-[0.15em] mb-3"
          style={{ color: 'var(--accent)' }}
        >
          The busiest hour all weekend
        </div>
        <div className="font-serif italic text-6xl sm:text-7xl leading-none" style={{ color: '#F6F3EC' }}>
          ~4,700
        </div>
        <div className="text-sm mt-3" style={{ color: '#F6F3EC' }}>
          Friday, 7–8pm downtown
        </div>
        <div className="text-xs mt-3 max-w-xs mx-auto" style={{ color: 'var(--border)' }}>
          First Friday and the Trifest kids&apos; race land at the same time — that&apos;s when the
          crowd peaks.
        </div>
      </div>

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
        <h2 className="font-medium mb-1" style={{ color: 'var(--ink)' }}>Hour by hour</h2>
        <p className="text-xs mb-3" style={{ color: 'var(--ink-soft)' }}>
          How many people are downtown at any given time, from Friday noon to Sunday 10pm. Scroll to
          see the whole weekend.
        </p>
        <div
          className="rounded-2xl p-3 overflow-x-auto"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', WebkitOverflowScrolling: 'touch' }}
        >
          <div style={{ width: 900, height: 280, position: 'relative' }}>
            <WeekendChart />
          </div>
        </div>
        <p className="text-[10px] text-right mt-1" style={{ color: 'var(--ink-soft)' }}>swipe for Sat &amp; Sun →</p>
        <div className="flex flex-wrap gap-4 text-xs mt-3" style={{ color: 'var(--ink-soft)' }}>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: '#14171F' }} />Friday</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: '#5B5F6B' }} />Saturday</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: '#A39C8A' }} />Sunday</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: 'var(--accent)' }} />Peak hour</span>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-medium mb-3" style={{ color: 'var(--ink)' }}>What&apos;s happening when</h2>
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
            The hour-by-hour chart is a smoothed guess, not 59 separate counts. Overnight numbers are
            just a low placeholder. And we only counted racers, not the friends and family watching.
          </p>
        </div>
      </section>

      <p className="text-[11px] mt-8 pt-4" style={{ color: 'var(--ink-soft)', borderTop: '1px solid var(--border)' }}>
        A planning estimate, not an actual count.
      </p>
    </div>
  );
}
