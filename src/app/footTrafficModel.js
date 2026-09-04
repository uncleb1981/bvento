// Single source of truth for both the time chart and the location heatmap,
// for every weekend on the page. Every event is tagged with the real place
// it happens, so zone totals always sum to the chart's total at any given
// hour - update WEEKENDS below and both visuals stay consistent
// automatically.
//
// This is a SURGE forecast for short-term rental pricing, not a general
// foot-traffic count - so events that draw mostly local/regional residents
// who go home to their own bed (high school football, the weekly farmers
// market, Live at the Pavilion, the county fair) are tagged `local: true`
// and excluded from both hourlyTotal and hourlyByLocation below. Only
// events that plausibly drive out-of-town overnight stays (Crystal
// Bridges/Momentary tourism, touring concerts, regional/national mountain
// bike races, First Friday as the town's signature destination draw) count
// toward the surge numbers shown on the page.

export const LOCATIONS = {
  SQUARE: 'The Square',
  CRYSTAL_BRIDGES: 'Crystal Bridges + Momentary',
  AQUATIC_CENTER: 'Melvin Ford Aquatic Center',
  EIGHTH_STREET: '8th Street Market',
  AMAZEUM: 'Scott Family Amazeum',
  COLER: 'Coler Mountain Bike Preserve',
  TIGER_STADIUM: 'Bentonville Tiger Stadium',
  FAIRGROUNDS: 'Benton County Fairgrounds',
  // Not a Bentonville venue - Rogers, AR, next door (~10 min away). Used
  // only for massive regional draws whose overflow plausibly spills into
  // Bentonville lodging once Rogers' own capacity is exceeded. See the
  // Bikes, Blues & BBQ and NWA Championship entries for the modeled
  // spillover methodology - these are NOT the events' real regional
  // attendance figures.
  REGIONAL_ROGERS: 'Rogers (regional spillover)',
};

// Ambient downtown foot traffic with no specific driving event - counted
// toward the Square since that's the walkable core.
const BASELINE = 20;
const BASELINE_LOCATION = LOCATIONS.SQUARE;
const HOURS = 71; // Thu 12p (0) through Sun 10p (70)

// Steady weekly draw at three venues that isn't tied to any single named
// event - people show up most weekends regardless of what else is on the
// calendar. None of the three publish attendance figures, so every number
// here is our estimate (Amazeum's from its ~1.7M visitors/year run rate,
// Coler's from a Walton Family Foundation OZ Trails ridership study,
// 8th Street Market's a rough guess with no public data at all) - spread
// into every weekend below so the heatmap always has something for them.
function weeklyVenueTraffic() {
  return [
    { name: '8th Street Market (Friday dinner)', peak: 19, val: 200, sigma: 2, location: LOCATIONS.EIGHTH_STREET, local: true },
    { name: '8th Street Market (Saturday)', peak: 37, val: 260, sigma: 3, location: LOCATIONS.EIGHTH_STREET, local: true },
    { name: '8th Street Market (Sunday)', peak: 61, val: 200, sigma: 3, location: LOCATIONS.EIGHTH_STREET, local: true },
    { name: 'Amazeum (Friday)', peak: 14, val: 250, sigma: 3, location: LOCATIONS.AMAZEUM },
    { name: 'Amazeum (Saturday)', peak: 34, val: 500, sigma: 3, location: LOCATIONS.AMAZEUM },
    { name: 'Amazeum (Sunday)', peak: 58, val: 380, sigma: 3, location: LOCATIONS.AMAZEUM },
    { name: 'Coler Mountain Bike Preserve (Saturday)', peak: 33, val: 320, sigma: 3.5, location: LOCATIONS.COLER },
    { name: 'Coler Mountain Bike Preserve (Sunday)', peak: 57, val: 260, sigma: 3.5, location: LOCATIONS.COLER },
  ];
}

export const WEEKENDS = [
  {
    id: 'sep4',
    dateRange: 'Thu Sep 3 – Sun Sep 6, 2026',
    start: '2026-09-03',
    events: [
      // Thursday evening on the Square: two concurrent recurring events,
      // modeled together since they share the same time and place.
      { name: 'Live at the Pavilion + Pickin’ on the Square', peak: 7, val: 400, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Live at the Pavilion', local: true },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'First Friday Live', peak: 19, val: 4700, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'First Friday' },
      { name: 'Trifest Youth Triathlon', peak: 19, val: 600, sigma: 1, location: LOCATIONS.AQUATIC_CENTER, local: true },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market', local: true },
      { name: 'Trifest Sprint', peak: 32, val: 750, sigma: 1, location: LOCATIONS.AQUATIC_CENTER, local: true },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Crystal Bridges' },
      { name: 'Trifest Super Sprint', peak: 56, val: 420, sigma: 1, location: LOCATIONS.AQUATIC_CENTER, chartLabel: 'Trifest', local: true },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'sep11',
    dateRange: 'Thu Sep 10 – Sun Sep 13, 2026',
    start: '2026-09-10',
    events: [
      // Movie Nights on the Square, Thursday evening.
      { name: 'Movie Nights on the Square', peak: 6, val: 350, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Movie Nights', local: true },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market', local: true },
      // "Grandma Moses: A Good Day's Work" opens at Crystal Bridges Sep 12 -
      // modeled as an elevated bump over the normal weekend baseline.
      { name: 'Crystal Bridges Saturday (exhibit opening)', peak: 37, val: 1500, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Grandma Moses opens', bookingWindow: 'Sep 12–13' },
      { name: 'Crystal Bridges Sunday (exhibit opening)', peak: 61, val: 1100, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Grandma Moses' },
      // Noon2Moon endurance MTB race weekend at Coler, Fri 9/11-Sat 9/12:
      // Friday is kids' ride camp + the Hot Lap, Saturday is the main
      // 3-hour/6-hour race - on top of Coler's normal weekend ridership.
      { name: 'Noon2Moon Kids Ride Camp + Hot Lap', peak: 18, val: 250, sigma: 1.5, location: LOCATIONS.COLER, chartLabel: 'Noon2Moon' },
      { name: 'Noon2Moon 3-Hour / 6-Hour Race', peak: 33, val: 900, sigma: 3, location: LOCATIONS.COLER, chartLabel: 'Noon2Moon race', bookingWindow: 'Sep 11–12' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'sep18',
    dateRange: 'Thu Sep 17 – Sun Sep 20, 2026',
    start: '2026-09-17',
    events: [
      // Live at the Pavilion, Thursday evening on the Square.
      { name: 'Live at the Pavilion', peak: 7, val: 350, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Live at the Pavilion', local: true },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market', local: true },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Crystal Bridges' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'sep25',
    dateRange: 'Thu Sep 24 – Sun Sep 27, 2026',
    start: '2026-09-24',
    events: [
      // Live at the Pavilion, Thursday evening on the Square.
      { name: 'Live at the Pavilion', peak: 7, val: 350, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Live at the Pavilion', local: true },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market', local: true },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Crystal Bridges' },
      // Bentonville Tigers home game, Fri 9/25 7pm - Tiger Stadium seats
      // 6,000-7,000; Har-Ber is a solid conference draw, not a marquee rival.
      { name: 'Bentonville Tigers vs Har-Ber', peak: 20, val: 4200, sigma: 1.5, location: LOCATIONS.TIGER_STADIUM, chartLabel: 'Tigers vs Har-Ber', local: true },
      // Zedd at the Momentary Green, same Friday night as the football game -
      // gates 6:30pm, capacity ~4,000-5,000, likely near sellout for a headliner.
      { name: 'Zedd at the Momentary', peak: 21, val: 4500, sigma: 1.3, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Zedd' },
      // Benton County Fair opening weekend, Sep 25-27 - Midway, food, vendors,
      // entertainment (Sunday is a lower-key Sensory Friendly Day, left out
      // since it's designed to be quieter). ~20,000 total across the fair's
      // full 9-day run; no per-day breakdown published, so these are our
      // estimate of the opening weekend's share (typically the busiest days).
      { name: 'Benton County Fair (Friday)', peak: 19, val: 1800, sigma: 1.5, location: LOCATIONS.FAIRGROUNDS, chartLabel: 'Benton County Fair', local: true },
      { name: 'Benton County Fair (Saturday)', peak: 42, val: 2800, sigma: 2, location: LOCATIONS.FAIRGROUNDS, local: true },
      // NWA Championship (LPGA), Pinnacle Country Club, Rogers - tournament
      // week runs Sep 21-27, final round Sun 9/27. No attendance figure is
      // published anywhere for this event (checked extensively); this is a
      // ROUGH estimate based on general LPGA Tour attendance norms for a
      // well-supported stop (record-setting community-event turnout has
      // been reported, though not the tournament's own attendance), not a
      // number sourced to this specific event. Not a Bentonville venue -
      // included for its scale and Rogers' proximity to Bentonville.
      { name: 'NWA Championship (LPGA), final round', peak: 63, val: 6000, sigma: 2.5, location: LOCATIONS.REGIONAL_ROGERS, chartLabel: 'NWA Championship', bookingWindow: 'Sep 21–27' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'oct2',
    dateRange: 'Thu Oct 1 – Sun Oct 4, 2026',
    start: '2026-10-01',
    events: [
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'First Friday Live', peak: 19, val: 4700, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'First Friday' },
      // Bikes, Blues & BBQ, Downtown Rogers, Sep 30-Oct 3 - the world's
      // largest charity motorcycle rally, 300,000+ riders over 4 days
      // (confirmed via the event's own site; some sources still say
      // Fayetteville, its former home, but 2026 is explicitly Rogers). Not
      // a Bentonville venue, and 300K is Rogers-wide attendance including
      // huge numbers of single-day/local riders, not overnight visitors -
      // this ~3,000 figure is a MODELED estimate of Bentonville-specific
      // spillover (roughly 1% of total attendance), not a sourced number,
      // for the Saturday peak (main bike-show day).
      { name: 'Bikes, Blues & BBQ (Bentonville spillover est.)', peak: 37, val: 3000, sigma: 2.5, location: LOCATIONS.REGIONAL_ROGERS, chartLabel: 'Bikes, Blues & BBQ', bookingWindow: 'Sep 30 – Oct 3' },
      // Benton County Fair's closing weekend (Fair Week runs Sep 28-Oct 3,
      // more livestock/exhibit-hall focused than opening weekend) - same
      // Friday evening as First Friday downtown, different venue.
      { name: 'Benton County Fair (Friday, closing weekend)', peak: 19, val: 1200, sigma: 1.5, location: LOCATIONS.FAIRGROUNDS, local: true },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market', local: true },
      // Square 2 Square bike ride, fall direction Fayetteville -> Bentonville,
      // Sat 10/3 - riders trickle into the Square finish through late morning.
      { name: 'Square 2 Square finish', peak: 35, val: 300, sigma: 2, location: LOCATIONS.SQUARE, chartLabel: 'Square 2 Square', local: true },
      // Benton County Fair's last day, Sat 10/3.
      { name: 'Benton County Fair (closing day)', peak: 42, val: 1800, sigma: 2, location: LOCATIONS.FAIRGROUNDS, chartLabel: 'Fair closing day', local: true },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Crystal Bridges' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'oct9',
    dateRange: 'Thu Oct 8 – Sun Oct 11, 2026',
    start: '2026-10-08',
    events: [
      // Movie Nights on the Square, Thu 10/8 - "The Lorax".
      { name: 'Movie Nights on the Square: The Lorax', peak: 6, val: 350, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Movie Nights', local: true },
      // Chance the Rapper at the Momentary Green, same Thursday evening -
      // gates 5:30pm, capacity ~4,000-5,000, likely near sellout for a headliner.
      { name: 'Chance the Rapper at the Momentary', peak: 8, val: 4500, sigma: 1.3, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Chance the Rapper' },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market', local: true },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Crystal Bridges' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'oct16',
    dateRange: 'Thu Oct 15 – Sun Oct 18, 2026',
    start: '2026-10-15',
    events: [
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      // Bentonville Tigers home game, Fri 10/16 7pm - Fayetteville is the
      // biggest rivalry on the schedule, close to a sellout at Tiger Stadium.
      { name: 'Bentonville Tigers vs Fayetteville', peak: 20, val: 6000, sigma: 1.5, location: LOCATIONS.TIGER_STADIUM, chartLabel: 'Tigers vs Fayetteville', local: true },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market', local: true },
      // Big Sugar Gravel, Sat 10/17 - starts and finishes at the Momentary,
      // ~2,800 riders (2025 figure, likely similar for 2026), plus the
      // "Gravel Rave" evening festival after - modeled as an evening peak.
      { name: 'Big Sugar Gravel', peak: 42, val: 2800, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Big Sugar Gravel', bookingWindow: 'Oct 15–18' },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Crystal Bridges' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'oct23',
    dateRange: 'Thu Oct 22 – Sun Oct 25, 2026',
    start: '2026-10-22',
    events: [
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      // Bentonville Tigers home game, Fri 10/23 7pm - crosstown rivalry vs Rogers.
      { name: 'Bentonville Tigers vs Rogers', peak: 20, val: 5000, sigma: 1.5, location: LOCATIONS.TIGER_STADIUM, chartLabel: 'Tigers vs Rogers', local: true },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market', local: true },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Crystal Bridges' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'oct30',
    dateRange: 'Thu Oct 29 – Sun Nov 1, 2026',
    start: '2026-10-29',
    events: [
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      // Last Saturday of the 2026 outdoor Farmers Market season.
      { name: 'Farmers Market (season finale)', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market', local: true },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Crystal Bridges' },
      ...weeklyVenueTraffic(),
    ],
  },
];

function gaussianAt(i, event) {
  return event.val * Math.exp(-((i - event.peak) ** 2) / (2 * event.sigma * event.sigma));
}

export function hourlyTotal(events) {
  const values = [];
  for (let i = 0; i < HOURS; i++) {
    let v = BASELINE;
    for (const e of events) if (!e.local) v += gaussianAt(i, e);
    values.push(v);
  }
  return values;
}

export function hourlyByLocation(events, location) {
  const values = [];
  for (let i = 0; i < HOURS; i++) {
    let v = location === BASELINE_LOCATION ? BASELINE : 0;
    for (const e of events) if (e.location === location && !e.local) v += gaussianAt(i, e);
    values.push(v);
  }
  return values;
}

const MIN_SURGE_VALUE = 1000;

// Which named (chartLabel'd) event at this zone is closest to this hour -
// used to attach a human-readable driver (and its booking window, if it has
// one - see `bookingWindow` on individual events below) to a zone's peak.
function driverEventAt(events, location, hourIdx) {
  const candidates = events.filter((e) => !e.local && e.location === location && e.chartLabel);
  if (candidates.length === 0) return null;
  return candidates.reduce((best, e) =>
    Math.abs(e.peak - hourIdx) < Math.abs(best.peak - hourIdx) ? e : best
  );
}

// Every zone/day across the whole season whose own peak tops
// MIN_SURGE_VALUE, flattened into one chronological list - the same
// per-zone-own-peak logic and threshold as the heatmap used to show per
// weekend, just consolidated across all of them instead of repeated
// weekend-by-weekend. Local-only events are already excluded upstream
// (hourlyByLocation skips them), so this is out-of-town surges only.
export function surgeEvents() {
  const surges = [];
  for (const weekend of WEEKENDS) {
    for (const location of Object.values(LOCATIONS)) {
      const series = hourlyByLocation(weekend.events, location);
      let peakIdx = 0;
      for (let i = 1; i < series.length; i++) if (series[i] > series[peakIdx]) peakIdx = i;
      const value = Math.round(series[peakIdx]);
      if (value <= MIN_SURGE_VALUE) continue;
      const driver = driverEventAt(weekend.events, location, peakIdx);
      if (!driver) continue;
      const dayOffset = peakIdx < 12 ? 0 : peakIdx < 24 ? 1 : peakIdx < 48 ? 2 : 3;
      const peakDate = new Date(weekend.start + 'T00:00:00');
      peakDate.setDate(peakDate.getDate() + dayOffset);
      surges.push({
        sortKey: `${weekend.start}-${String(peakIdx).padStart(2, '0')}`,
        dateISO: peakDate.toISOString().slice(0, 10),
        when: eventDateTimeLabel(weekend.start, peakIdx),
        // Multi-day draws (a race weekend, a festival) list guests arrive
        // and leave across more than one night - `bookingWindow` on the
        // driving event carries that real span. Single-night shows and
        // First Friday don't have one, so they fall back to the one date.
        bookingWindow: driver.bookingWindow || eventDateTimeLabel(weekend.start, peakIdx).split(',')[0],
        label: driver.chartLabel,
        location,
        value,
      });
    }
  }
  surges.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  return surges;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Which day of the week our identified out-of-town surges tend to land on -
// built entirely from our own event data, not a substitute for a real
// day-of-week ADR breakdown (no market-data platform publishes one for any
// market, let alone Bentonville specifically or downtown alone).
export function surgesByDayOfWeek() {
  const buckets = DAY_NAMES.map((day) => ({ day, total: 0, count: 0 }));
  for (const s of surgeEvents()) {
    const dow = new Date(s.dateISO + 'T00:00:00').getDay();
    buckets[dow].total += s.value;
    buckets[dow].count += 1;
  }
  return buckets.map((b) => ({ ...b, avg: b.count ? Math.round(b.total / b.count) : 0 }));
}

// Bentonville-wide ADR range from AirDNA/Rabbu/AirROI (see the benchmarks
// section) - the one real, sourced number this estimate is anchored to.
const CITYWIDE_ADR_LOW = 160;
const CITYWIDE_ADR_HIGH = 208;

// Modeled assumption, not sourced: downtown listings (walk to the Square,
// Crystal Bridges, the Momentary) command a premium over the city-wide
// average, which includes outlying/suburban listings. A common pattern in
// short-term rental markets generally, but no platform publishes a
// downtown-specific number for Bentonville to confirm the exact size of it.
const DOWNTOWN_PREMIUM = 1.12;

// Modeled assumption, not sourced: a typical weekday/weekend demand curve
// used broadly across the STR industry (e.g. as defaults in dynamic-pricing
// tools) - Fri/Sat highest, midweek lowest.
const TYPICAL_WEEK_CURVE = { Sun: 0.90, Mon: 0.82, Tue: 0.82, Wed: 0.85, Thu: 0.90, Fri: 1.15, Sat: 1.15 };

// Rabbu's published per-bedroom Bentonville ADR figures - studio and 4BR
// are the two real reported numbers we could find; no source publishes a
// 3-bedroom-specific figure (or 1BR/2BR), so 3BR here is linearly
// interpolated between the studio and 4BR anchors rather than guessed
// independently. 3-bedroom listings are also the single largest segment
// of Bentonville's STR market (~34% of active listings, per Rabbu), which
// is why it's the second line here rather than, say, 2BR.
const STUDIO_ADR = 93;
const FOUR_BR_ADR = 233;
const FIVE_BR_ADR = 293;
const THREE_BR_ADR = Math.round(STUDIO_ADR + ((FOUR_BR_ADR - STUDIO_ADR) / 4) * 3);
const ONE_BR_ADR = Math.round(STUDIO_ADR + ((FOUR_BR_ADR - STUDIO_ADR) / 4) * 1);
const TWO_BR_ADR = Math.round(STUDIO_ADR + ((FOUR_BR_ADR - STUDIO_ADR) / 4) * 2);

// City-wide ADR by property size, for the market benchmarks table. Studio,
// 4BR, and 5BR are Rabbu's published Bentonville figures; 1BR-3BR aren't
// published by any source we could find, so they're linearly interpolated
// between the studio and 4BR anchors.
export function ratesByBedroomCount() {
  return [
    { size: 'Studio', rate: STUDIO_ADR, sourced: true },
    { size: '1 Bedroom', rate: ONE_BR_ADR, sourced: false },
    { size: '2 Bedroom', rate: TWO_BR_ADR, sourced: false },
    { size: '3 Bedroom', rate: THREE_BR_ADR, sourced: false },
    { size: '4 Bedroom', rate: FOUR_BR_ADR, sourced: true },
    { size: '5 Bedroom', rate: FIVE_BR_ADR, sourced: true },
  ];
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Modeled seasonal curve, NOT sourced per-month data. Rabbu publishes only
// two real anchor points for Bentonville: July as the peak month (~$3,198
// avg monthly revenue/listing) and a winter low (~$1,092, roughly
// February), a ~2.9x swing, with "peak season" spanning May-October
// generally. A single smooth cosine curve peaking in July is fit to
// approximate that real peak:trough ratio - only July and the winter low
// are independently grounded in anything published; every other month is
// interpolation through that curve's shape, not independently sourced.
// Revenue (which bundles occupancy) is used as a proxy for how much rate
// itself likely swings seasonally, since no source breaks out a
// month-by-month ADR figure on its own.
const SEASONAL_PEAK_MONTH_INDEX = 6; // July
const SEASONAL_AMPLITUDE = 0.567; // fit to the real ~2.9x July:February revenue ratio

export function estimatedRateByMonthBySize() {
  const studioBase = STUDIO_ADR * DOWNTOWN_PREMIUM;
  const fourBRBase = FOUR_BR_ADR * DOWNTOWN_PREMIUM;

  return MONTH_NAMES.map((month, i) => {
    const multiplier = 1 + SEASONAL_AMPLITUDE * Math.cos((2 * Math.PI * (i - SEASONAL_PEAK_MONTH_INDEX)) / 12);
    return {
      month,
      studio: Math.round((studioBase * multiplier) / 5) * 5,
      fourBedroom: Math.round((fourBRBase * multiplier) / 5) * 5,
    };
  });
}

// Rabbu and AirDNA's own BLENDED (all-sizes) ADR figures - the anchors used
// to scale AirDNA into a by-size estimate below, since AirDNA doesn't
// publish a size breakdown of its own.
const RABBU_BLENDED_ADR = 160;
const AIRDNA_BLENDED_ADR = 208;

// Per-platform ADR by unit size, for the "by platform" table's size filter.
// Rabbu's values are the real (studio/4BR/5BR) or interpolated (1-3BR)
// figures from ratesByBedroomCount. AirDNA has never published a size
// breakdown at all, so every AirDNA value here is MODELED: its blended
// $208 scaled by Rabbu's own ratio of that size to Rabbu's blended $160 -
// e.g. if Rabbu's 4BR runs 46% above Rabbu's own blended rate, AirDNA's
// 4BR estimate scales AirDNA's blended rate up by that same 46%. AirROI
// has no ADR figure at all (blended or by size) to scale from, so it
// stays unavailable in every row.
export function platformRatesByBedroomCount() {
  return ratesByBedroomCount().map((b) => ({
    size: b.size,
    rabbu: b.rate,
    rabbuSourced: b.sourced,
    airdna: Math.round(AIRDNA_BLENDED_ADR * (b.rate / RABBU_BLENDED_ADR)),
  }));
}

// Same downtown-premium + day-of-week-curve + surge-blend shape as
// estimatedDailyRateByDayOfWeek, applied to a given base ADR instead of the
// citywide blended midpoint - used to build size-specific rate lines.
function rateSeriesForBaseADR(baseADR) {
  const downtownBase = baseADR * DOWNTOWN_PREMIUM;
  const surgeDays = surgesByDayOfWeek();
  const maxSurgeAvg = Math.max(...surgeDays.map((d) => d.avg), 1);

  return surgeDays.map((d) => {
    const surgeBoost = (d.avg / maxSurgeAvg) * 0.15;
    const multiplier = TYPICAL_WEEK_CURVE[d.day] + surgeBoost;
    return {
      day: d.day,
      rate: Math.round((downtownBase * multiplier) / 5) * 5,
      surgeCount: d.count,
    };
  });
}

// Estimated downtown Bentonville ADR by day of week, blended across all
// property sizes: the sourced city-wide range's midpoint, adjusted by the
// downtown premium assumption, then shaped by a typical weekday/weekend
// STR demand curve blended with how much extra lift our OWN identified
// surges give each day. This is a modeled estimate built from real inputs,
// not a number published anywhere - every input into it is labeled above.
// Kept as the reference baseline for surgesWithSuggestedRate() below; see
// estimatedRateByDayOfWeekBySize() for the studio/3BR-specific lines shown
// on the page.
export function estimatedDailyRateByDayOfWeek() {
  const citywideMid = (CITYWIDE_ADR_LOW + CITYWIDE_ADR_HIGH) / 2;
  return rateSeriesForBaseADR(citywideMid);
}

// Same day-of-week shape as estimatedDailyRateByDayOfWeek, but with two
// separate lines anchored to Rabbu's studio and 4BR ADR figures instead of
// the blended citywide midpoint - both are real published figures (not
// interpolated), so a studio host and a 4-bedroom host each see a number
// that actually resembles their listing, with no modeled-in-between step.
export function estimatedRateByDayOfWeekBySize() {
  return {
    studio: rateSeriesForBaseADR(STUDIO_ADR),
    fourBedroom: rateSeriesForBaseADR(FOUR_BR_ADR),
  };
}

// Normal (non-surge) baseline rate by day of week - same downtown-premium
// and weekday/weekend curve as the rest of this page, but WITHOUT any
// surge blend, so it stays a stable "normal night" reference to measure
// suggested surge premiums against (a surge should never suggest LESS
// than a normal night, which a surge-blended baseline could produce).
function normalRateByDay() {
  const citywideMid = (CITYWIDE_ADR_LOW + CITYWIDE_ADR_HIGH) / 2;
  const downtownBase = citywideMid * DOWNTOWN_PREMIUM;
  const rates = {};
  for (const day of DAY_NAMES) {
    rates[day] = Math.round((downtownBase * TYPICAL_WEEK_CURVE[day]) / 5) * 5;
  }
  return rates;
}

// Modeled assumption, not sourced: the single biggest identified surge
// (First Friday, ~4,700 people) gets up to this much of a suggested
// premium over the normal baseline; smaller surges scale down from there
// in proportion to their size. A commonly cited peak-event pricing range
// in the STR/hospitality industry generally, not a Bentonville-specific
// figure - no platform publishes an actual surge-pricing benchmark.
const MAX_SURGE_PREMIUM_PCT = 60;

// Every identified surge, with a suggested nightly rate and % premium
// attached: the normal (non-surge) baseline for that day of week, scaled
// up by how big this surge is relative to the single biggest surge of the
// season - e.g. First Friday (the biggest) gets close to the full
// MAX_SURGE_PREMIUM_PCT premium, Noon2Moon (the smallest) gets a modest
// one. Built entirely from numbers already on this page; not an
// independently sourced price recommendation.
export function surgesWithSuggestedRate() {
  const normalByDay = normalRateByDay();
  const allSurges = surgeEvents();
  const maxSurgeValue = Math.max(...allSurges.map((s) => s.value));

  return allSurges.map((s) => {
    const dayName = DAY_NAMES[new Date(s.dateISO + 'T00:00:00').getDay()];
    const baseline = normalByDay[dayName];
    const pctIncrease = Math.round((s.value / maxSurgeValue) * MAX_SURGE_PREMIUM_PCT);
    const suggestedRate = Math.round((baseline * (1 + pctIncrease / 100)) / 5) * 5;
    return { ...s, suggestedRate, pctIncrease };
  });
}

export function peakHourIndex(events) {
  const totals = hourlyTotal(events);
  return totals.indexOf(Math.max(...totals));
}

function clockLabel(h) {
  return h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : (h - 12) + 'p';
}

export function hourLabel(i) {
  if (i < 12) return 'Thu ' + (i === 0 ? '12p' : i + 'p');
  if (i < 24) return 'Fri ' + (i - 12 === 0 ? '12p' : (i - 12) + 'p');
  if (i < 48) return 'Sat ' + clockLabel(i - 24);
  return 'Sun ' + clockLabel(i - 48);
}

// e.g. index 19 -> "Fri 7–8pm"
export function hourRangeLabel(i) {
  const start = hourLabel(i);
  const [dayPrefix, startTime] = start.split(' ');
  const endTime = hourLabel(Math.min(i + 1, HOURS - 1)).split(' ')[1];

  const startNum = startTime.slice(0, -1);
  const endMeridiem = endTime.endsWith('a') ? 'am' : 'pm';
  const endNum = endTime.slice(0, -1);

  return `${dayPrefix} ${startNum}–${endNum}${endMeridiem}`;
}

// Same time-range formatting as hourRangeLabel, but with the actual
// calendar date (from the weekend's ISO start date) instead of a day name -
// e.g. (startISO='2026-09-24', i=20) -> "Sep 25, 8–9pm".
export function eventDateTimeLabel(startISO, i) {
  const dayOffset = i < 12 ? 0 : i < 24 ? 1 : i < 48 ? 2 : 3;
  const date = new Date(startISO + 'T00:00:00');
  date.setDate(date.getDate() + dayOffset);
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const [, startTime] = hourLabel(i).split(' ');
  const endTime = hourLabel(Math.min(i + 1, HOURS - 1)).split(' ')[1];
  const startNum = startTime.slice(0, -1);
  const endMeridiem = endTime.endsWith('a') ? 'am' : 'pm';
  const endNum = endTime.slice(0, -1);

  return `${dateStr}, ${startNum}–${endNum}${endMeridiem}`;
}

// Bentonville population, US Census + Census/ACS-derived annual estimates,
// starting 2020 to line up with the STR listing series below. 2020 is the
// decennial Census count (the most authoritative point); 2021-2023 are
// annual estimates. A genuinely rich real series - unlike the STR listing
// count below, which has only two known points.
export function populationHistory() {
  return [
    { year: 2020, population: 54164 },
    { year: 2021, population: 56932 },
    { year: 2022, population: 57873 },
    { year: 2023, population: 59471 },
  ];
}

// Real, dated STR listing counts for Bentonville - but only two of them
// exist anywhere we could find. Jan 2021 is from a Bentonville city
// planning staff report presented to City Council (via NWA Democrat-
// Gazette, Mar 10 2021): 484 total listings active at some point over the
// trailing 12 months, out of 24,254 total housing units at the time. 2026
// is AirDNA's current snapshot (~1,160). No source publishes a listing
// count for any year in between - Bentonville has never required STR
// registration, so there's no registry that would have tracked it, and
// third-party platforms don't publish their own historical archives for
// free. The methodology likely isn't perfectly consistent between the two
// (city staff's "listed at some point in 12 months" vs AirDNA's "active"
// definition), so treat this as directional growth evidence, not a
// precise trend line.
export function strListingHistory() {
  return [
    { year: 2021, listings: 484 },
    { year: 2026, listings: 1160 },
  ];
}
