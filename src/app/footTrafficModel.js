// Single source of truth for both the time chart and the location heatmap.
// Every event is tagged with the real place it happens, so zone totals
// always sum to the chart's total at any given hour - update this one file
// weekly and both visuals stay consistent automatically.

export const LOCATIONS = {
  SQUARE: 'The Square',
  CRYSTAL_BRIDGES: 'Crystal Bridges + Momentary',
  AQUATIC_CENTER: 'Melvin Ford Aquatic Center',
};

// Ambient downtown foot traffic with no specific driving event - counted
// toward the Square since that's the walkable core.
const BASELINE = 20;
const BASELINE_LOCATION = LOCATIONS.SQUARE;
const HOURS = 59; // Fri 12p (0) through Sun 10p (58)

export const EVENTS = [
  { name: 'Afternoon baseline', peak: 2, val: 550, sigma: 3, location: LOCATIONS.CRYSTAL_BRIDGES },
  { name: 'First Friday Live', peak: 7, val: 4700, sigma: 1.3, location: LOCATIONS.SQUARE },
  { name: 'Trifest Youth Triathlon', peak: 7, val: 600, sigma: 1, location: LOCATIONS.AQUATIC_CENTER },
  { name: 'Crystal Bridges Saturday', peak: 25, val: 850, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
  { name: 'Farmers Market', peak: 22, val: 3200, sigma: 1.8, location: LOCATIONS.SQUARE },
  { name: 'Trifest Sprint', peak: 20, val: 750, sigma: 1, location: LOCATIONS.AQUATIC_CENTER },
  { name: 'Crystal Bridges Sunday', peak: 49, val: 700, sigma: 2.5, location: LOCATIONS.CRYSTAL_BRIDGES },
  { name: 'Trifest Super Sprint', peak: 44, val: 420, sigma: 1, location: LOCATIONS.AQUATIC_CENTER },
];

function gaussianAt(i, event) {
  return event.val * Math.exp(-((i - event.peak) ** 2) / (2 * event.sigma * event.sigma));
}

export function hourlyTotal() {
  const values = [];
  for (let i = 0; i < HOURS; i++) {
    let v = BASELINE;
    for (const e of EVENTS) v += gaussianAt(i, e);
    values.push(v);
  }
  return values;
}

export function hourlyByLocation(location) {
  const values = [];
  for (let i = 0; i < HOURS; i++) {
    let v = location === BASELINE_LOCATION ? BASELINE : 0;
    for (const e of EVENTS) if (e.location === location) v += gaussianAt(i, e);
    values.push(v);
  }
  return values;
}

export function peakHourIndex() {
  const totals = hourlyTotal();
  return totals.indexOf(Math.max(...totals));
}

function clockLabel(h) {
  return h === 0 ? '12a' : h < 12 ? h + 'a' : h === 12 ? '12p' : (h - 12) + 'p';
}

export function hourLabel(i) {
  if (i < 12) return 'Fri ' + (i === 0 ? '12p' : i + 'p');
  if (i < 36) return 'Sat ' + clockLabel(i - 12);
  return 'Sun ' + clockLabel(i - 36);
}

// e.g. index 7 -> "Fri 7–8pm"
export function hourRangeLabel(i) {
  const start = hourLabel(i);
  const [dayPrefix, startTime] = start.split(' ');
  const endTime = hourLabel(Math.min(i + 1, HOURS - 1)).split(' ')[1];

  const startNum = startTime.slice(0, -1);
  const endMeridiem = endTime.endsWith('a') ? 'am' : 'pm';
  const endNum = endTime.slice(0, -1);

  return `${dayPrefix} ${startNum}–${endNum}${endMeridiem}`;
}
