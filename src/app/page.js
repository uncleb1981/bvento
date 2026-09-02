import WeekendChart from './WeekendChart';
import FootTrafficZones from '@/components/FootTrafficZones';
import { WEEKENDS } from './footTrafficModel';

export const metadata = {
  title: 'Bentonville Surge Forecast — bvento',
  description:
    'Predictive pedestrian analytics for the Walmart vendor ecosystem — data-driven foot traffic forecasts across Bentonville’s key commercial zones, built for CPG brands timing product activations and launches around corporate commuter surges.',
};

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 pt-8 pb-16">
      <h1 className="text-3xl sm:text-4xl font-medium mt-2 mb-5" style={{ color: 'var(--ink)' }}>
        Bentonville Surge Forecast
      </h1>

      <p className="text-sm leading-relaxed max-w-xl mb-6" style={{ color: 'var(--ink-soft)' }}>
        Maximize retail impact with predictive pedestrian analytics built for the Walmart vendor
        ecosystem. bvento.com delivers data-driven foot traffic forecasts across Bentonville's key
        commercial zones, empowering CPG brands to perfectly time product activations,
        experiential marketing, and high-impact launches around corporate commuter surges.
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
              <FootTrafficZones events={weekend.events} weekendStart={weekend.start} />
            </div>
          </div>
        </section>
      ))}

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
