// Single source of truth for both the time chart and the location heatmap,
// for every weekend on the page. Every event is tagged with the real place
// it happens, so zone totals always sum to the chart's total at any given
// hour - update WEEKENDS below and both visuals stay consistent
// automatically.

export const LOCATIONS = {
  SQUARE: 'The Square',
  CRYSTAL_BRIDGES: 'Crystal Bridges + Momentary',
  AQUATIC_CENTER: 'Melvin Ford Aquatic Center',
  EIGHTH_STREET: '8th Street Market',
  AMAZEUM: 'Scott Family Amazeum',
  COLER: 'Coler Mountain Bike Preserve',
  TIGER_STADIUM: 'Bentonville Tiger Stadium',
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
    { name: '8th Street Market (Friday dinner)', peak: 19, val: 200, sigma: 2, location: LOCATIONS.EIGHTH_STREET },
    { name: '8th Street Market (Saturday)', peak: 37, val: 260, sigma: 3, location: LOCATIONS.EIGHTH_STREET },
    { name: '8th Street Market (Sunday)', peak: 61, val: 200, sigma: 3, location: LOCATIONS.EIGHTH_STREET },
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
      { name: 'Live at the Pavilion + Pickin’ on the Square', peak: 7, val: 400, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Live at the Pavilion' },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'First Friday Live', peak: 19, val: 4700, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'First Friday' },
      { name: 'Trifest Youth Triathlon', peak: 19, val: 600, sigma: 1, location: LOCATIONS.AQUATIC_CENTER },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      { name: 'Trifest Sprint', peak: 32, val: 750, sigma: 1, location: LOCATIONS.AQUATIC_CENTER },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Trifest Super Sprint', peak: 56, val: 420, sigma: 1, location: LOCATIONS.AQUATIC_CENTER, chartLabel: 'Trifest' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'sep11',
    dateRange: 'Thu Sep 10 – Sun Sep 13, 2026',
    start: '2026-09-10',
    events: [
      // Movie Nights on the Square, Thursday evening.
      { name: 'Movie Nights on the Square', peak: 6, val: 350, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Movie Nights' },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      // "Grandma Moses: A Good Day's Work" opens at Crystal Bridges Sep 12 -
      // modeled as an elevated bump over the normal weekend baseline.
      { name: 'Crystal Bridges Saturday (exhibit opening)', peak: 37, val: 1500, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Grandma Moses opens' },
      { name: 'Crystal Bridges Sunday (exhibit opening)', peak: 61, val: 1100, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      // Noon2Moon endurance MTB race weekend at Coler, Fri 9/11-Sat 9/12:
      // Friday is kids' ride camp + the Hot Lap, Saturday is the main
      // 3-hour/6-hour race - on top of Coler's normal weekend ridership.
      { name: 'Noon2Moon Kids Ride Camp + Hot Lap', peak: 18, val: 250, sigma: 1.5, location: LOCATIONS.COLER, chartLabel: 'Noon2Moon' },
      { name: 'Noon2Moon 3-Hour / 6-Hour Race', peak: 33, val: 900, sigma: 3, location: LOCATIONS.COLER, chartLabel: 'Noon2Moon race' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'sep18',
    dateRange: 'Thu Sep 17 – Sun Sep 20, 2026',
    start: '2026-09-17',
    events: [
      // Live at the Pavilion, Thursday evening on the Square.
      { name: 'Live at the Pavilion', peak: 7, val: 350, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Live at the Pavilion' },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'sep25',
    dateRange: 'Thu Sep 24 – Sun Sep 27, 2026',
    start: '2026-09-24',
    events: [
      // Live at the Pavilion, Thursday evening on the Square.
      { name: 'Live at the Pavilion', peak: 7, val: 350, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Live at the Pavilion' },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      // Bentonville Tigers home game, Fri 9/25 7pm - Tiger Stadium seats
      // 6,000-7,000; Har-Ber is a solid conference draw, not a marquee rival.
      { name: 'Bentonville Tigers vs Har-Ber', peak: 20, val: 4200, sigma: 1.5, location: LOCATIONS.TIGER_STADIUM, chartLabel: 'Tigers vs Har-Ber' },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'oct2',
    dateRange: 'Thu Oct 1 – Sun Oct 4, 2026',
    start: '2026-10-01',
    events: [
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      // October's First Friday is the "Haunted Holler" themed edition, 3-9pm.
      { name: 'First Friday Live: Haunted Holler', peak: 19, val: 4700, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'First Friday' },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      // Square 2 Square bike ride, fall direction Fayetteville -> Bentonville,
      // Sat 10/3 - riders trickle into the Square finish through late morning.
      { name: 'Square 2 Square finish', peak: 35, val: 300, sigma: 2, location: LOCATIONS.SQUARE, chartLabel: 'Square 2 Square' },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      ...weeklyVenueTraffic(),
    ],
  },
  {
    id: 'oct9',
    dateRange: 'Thu Oct 8 – Sun Oct 11, 2026',
    start: '2026-10-08',
    events: [
      // Movie Nights on the Square, Thu 10/8 - "The Lorax".
      { name: 'Movie Nights on the Square: The Lorax', peak: 6, val: 350, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Movie Nights' },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
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
      { name: 'Bentonville Tigers vs Fayetteville', peak: 20, val: 6000, sigma: 1.5, location: LOCATIONS.TIGER_STADIUM, chartLabel: 'Tigers vs Fayetteville' },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
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
      { name: 'Bentonville Tigers vs Rogers', peak: 20, val: 5000, sigma: 1.5, location: LOCATIONS.TIGER_STADIUM, chartLabel: 'Tigers vs Rogers' },
      { name: 'Crystal Bridges Saturday', peak: 37, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
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
      { name: 'Farmers Market (season finale)', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      { name: 'Crystal Bridges Sunday', peak: 61, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
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
    for (const e of events) v += gaussianAt(i, e);
    values.push(v);
  }
  return values;
}

export function hourlyByLocation(events, location) {
  const values = [];
  for (let i = 0; i < HOURS; i++) {
    let v = location === BASELINE_LOCATION ? BASELINE : 0;
    for (const e of events) if (e.location === location) v += gaussianAt(i, e);
    values.push(v);
  }
  return values;
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
