import WeekendChart from './WeekendChart';
import FootTrafficZones from '@/components/FootTrafficZones';
import { WEEKENDS } from './footTrafficModel';

export const metadata = {
  title: 'Bentonville Crowd Surge Forecast — bvento',
  description:
    'Know which Bentonville weekends to raise your nightly rate. A data-driven crowd surge forecast for short-term rental hosts and boutique hotels, built from real event data on First Friday, Farmers Market, Bentonville Tigers football, Momentary concerts, and more.',
};

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-3xl sm:text-4xl font-medium mt-2 mb-5" style={{ color: 'var(--ink)' }}>
        Bentonville Crowd Surge Forecast
      </h1>

      <p className="text-sm leading-relaxed max-w-xl mb-3" style={{ color: 'var(--ink-soft)' }}>
        Know when to raise your rates — before the surge hits.
      </p>

      <ul className="text-sm leading-relaxed max-w-xl mb-6 space-y-2">
        <li className="flex gap-2" style={{ color: 'var(--ink-soft)' }}>
          <span style={{ color: 'var(--accent)' }}>—</span>
          <span>Data-driven crowd forecasts for every major weekend in Bentonville</span>
        </li>
        <li className="flex gap-2" style={{ color: 'var(--ink-soft)' }}>
          <span style={{ color: 'var(--accent)' }}>—</span>
          <span>See exactly which nights are worth premium pricing, weeks in advance</span>
        </li>
        <li className="flex gap-2" style={{ color: 'var(--ink-soft)' }}>
          <span style={{ color: 'var(--accent)' }}>—</span>
          <span>Never get caught underpriced during First Friday, a football rivalry, or a sold-out Momentary show</span>
        </li>
      </ul>

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
              <FootTrafficZones events={weekend.events} weekendStart={weekend.start} />
            </div>
          </div>
        </section>
      ))}

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
