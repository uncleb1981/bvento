'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { hourlyTotal, peakHourIndex, hourRangeLabel } from './footTrafficModel';

// 14 buckets covering Thu noon (index 0) through Sun 10pm (index 70), each
// no wider than ~6 hours so a late bump can't get trapped inside an
// oversized window and make the tail look like it's still climbing.
// Each bucket takes the MAX of the hourly model within its window, so the
// true peak hour's value isn't diluted. Generic across any weekend's data.
const BUCKETS = [
  { start: 0, end: 4, label: 'Thu 12p' },
  { start: 5, end: 8, label: '6p' },
  { start: 9, end: 11, label: '9p' },
  { start: 12, end: 16, label: 'Fri 12p' },
  { start: 17, end: 20, label: '6p' },
  { start: 21, end: 23, label: '9p' },
  { start: 24, end: 29, label: 'Sat 12a' },
  { start: 30, end: 35, label: '6a' },
  { start: 36, end: 41, label: '12p' },
  { start: 42, end: 47, label: '6p' },
  { start: 48, end: 53, label: 'Sun 12a' },
  { start: 54, end: 59, label: '6a' },
  { start: 60, end: 65, label: '12p' },
  { start: 66, end: 70, label: '6p' },
];

function bucketIndexForHour(hourIdx) {
  return BUCKETS.findIndex((b) => hourIdx >= b.start && hourIdx <= b.end);
}

function drivingEventName(events, bucket) {
  const candidates = events.filter((e) => e.peak >= bucket.start && e.peak <= bucket.end);
  if (candidates.length === 0) return null;
  const top = candidates.reduce((best, e) => (e.val > best.val ? e : best), candidates[0]);
  return top.chartLabel || top.name;
}

function buildBuckets(events) {
  const hourly = hourlyTotal(events);
  const buckets = BUCKETS.map((b) => {
    let max = 0;
    for (let i = b.start; i <= b.end; i++) max = Math.max(max, hourly[i]);
    return { ...b, value: Math.round(max) };
  });

  const peakIdx = buckets.reduce((best, b, i) => (b.value > buckets[best].value ? i : best), 0);
  buckets[peakIdx] = { ...buckets[peakIdx], mark: 'peak', label2: drivingEventName(events, buckets[peakIdx]) };

  for (const e of events) {
    if (!e.chartLabel) continue;
    const bi = bucketIndexForHour(e.peak);
    if (bi >= 0 && bi !== peakIdx && !buckets[bi].mark) {
      buckets[bi] = { ...buckets[bi], mark: e.chartLabel };
    }
  }

  return buckets;
}

export default function WeekendChart({ events, weekendLabel }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const buckets = buildBuckets(events);
    const labels = buckets.map((b) => b.label);
    const values = buckets.map((b) => b.value);
    const dayDividers = [2.5, 5.5, 9.5]; // between Thu/Fri, Fri/Sat, and Sat/Sun buckets

    const pointRadius = buckets.map((b) => (b.mark === 'peak' ? 6 : b.mark ? 4 : 0));
    const pointColor = buckets.map((b) => (b.mark === 'peak' ? '#B3431E' : '#14171F'));

    const dayDividerPlugin = {
      id: 'dayDividers',
      afterDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        if (!chartArea) return;
        const xScale = scales.x;
        const pixelAt = (i) => xScale.getPixelForTick(i);

        ctx.save();
        ctx.strokeStyle = 'rgba(20, 23, 31, 0.14)';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        dayDividers.forEach((mid) => {
          const x = (pixelAt(Math.floor(mid)) + pixelAt(Math.ceil(mid))) / 2;
          ctx.beginPath();
          ctx.moveTo(x, chartArea.top);
          ctx.lineTo(x, chartArea.bottom);
          ctx.stroke();
        });
        ctx.restore();

        ctx.save();
        ctx.textAlign = 'center';
        buckets.forEach((b, i) => {
          if (!b.mark) return;
          const x = pixelAt(i);
          const y = scales.y.getPixelForValue(b.value);
          if (b.mark === 'peak') {
            ctx.fillStyle = '#B3431E';
            ctx.font = '600 12px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText(b.label2 || 'Peak', x, y - 14);
          } else {
            ctx.fillStyle = '#5B5F6B';
            ctx.font = '500 10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText(b.mark, x, y - 12);
          }
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: '#14171F',
            borderWidth: 2.5,
            tension: 0.35,
            fill: true,
            backgroundColor: (context) => {
              const { chart } = context;
              const { ctx, chartArea } = chart;
              if (!chartArea) return 'rgba(20,23,31,0)';
              const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
              gradient.addColorStop(0, 'rgba(20,23,31,0.16)');
              gradient.addColorStop(1, 'rgba(20,23,31,0)');
              return gradient;
            },
            pointRadius,
            pointHoverRadius: pointRadius.map((r) => Math.max(r, 5)),
            pointBackgroundColor: pointColor,
            pointBorderColor: '#F6F3EC',
            pointBorderWidth: 2,
          },
        ],
      },
      plugins: [dayDividerPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 30 } },
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => '~' + ctx.parsed.y.toLocaleString() } },
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#5B5F6B', font: { size: 10 }, callback: (v) => v.toLocaleString() }, grid: { color: '#E4E0D4' } },
          x: { grid: { display: false }, ticks: { color: '#5B5F6B', font: { size: 10 } } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [events]);

  const buckets = buildBuckets(events);
  const peakValue = buckets.find((b) => b.mark === 'peak')?.value ?? 0;
  const secondary = buckets.filter((b) => b.mark && b.mark !== 'peak').map((b) => b.mark).join(' and ');
  const ariaLabel = `Area chart of estimated foot traffic in downtown Bentonville, ${weekendLabel}, peaking at about ${peakValue.toLocaleString()} people ${hourRangeLabel(peakHourIndex(events))}${secondary ? `, with smaller peaks for ${secondary}` : ''}.`;

  return <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />;
}
