// Single source of truth for both the time chart and the location heatmap,
// for every weekend on the page. Every event is tagged with the real place
// it happens, so zone totals always sum to the chart's total at any given
// hour - update WEEKENDS below and both visuals stay consistent
// automatically.

export const LOCATIONS = {
  SQUARE: 'The Square',
  CRYSTAL_BRIDGES: 'Crystal Bridges + Momentary',
  AQUATIC_CENTER: 'Melvin Ford Aquatic Center',
};

// Ambient downtown foot traffic with no specific driving event - counted
// toward the Square since that's the walkable core.
const BASELINE = 20;
const BASELINE_LOCATION = LOCATIONS.SQUARE;
const HOURS = 71; // Thu 12p (0) through Sun 10p (70)

export const WEEKENDS = [
  {
    id: 'sep4',
    dateRange: 'Thu Sep 3 – Sun Sep 6, 2026',
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
    ],
  },
  {
    id: 'sep11',
    dateRange: 'Thu Sep 10 – Sun Sep 13, 2026',
    events: [
      // Movie Nights on the Square, Thursday evening.
      { name: 'Movie Nights on the Square', peak: 6, val: 350, sigma: 1.3, location: LOCATIONS.SQUARE, chartLabel: 'Movie Nights' },
      { name: 'Afternoon baseline', peak: 14, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
      { name: 'Farmers Market', peak: 34, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE, chartLabel: 'Farmers Market' },
      // "Grandma Moses: A Good Day's Work" opens at Crystal Bridges Sep 12 -
      // modeled as an elevated bump over the normal weekend baseline.
      { name: 'Crystal Bridges Saturday (exhibit opening)', peak: 37, val: 1500, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES, chartLabel: 'Grandma Moses opens' },
      { name: 'Crystal Bridges Sunday (exhibit opening)', peak: 61, val: 1100, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
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
