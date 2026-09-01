'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const EVENTS = [
  { peak: 2, val: 550, sigma: 3 },
  { peak: 7, val: 4700, sigma: 1.3 },
  { peak: 7, val: 600, sigma: 1 },
  { peak: 25, val: 850, sigma: 2.5 },
  { peak: 22, val: 3200, sigma: 1.8 },
  { peak: 20, val: 750, sigma: 1 },
  { peak: 49, val: 700, sigma: 2.5 },
  { peak: 44, val: 420, sigma: 1 },
];

// 10 buckets covering Fri noon (index 0) through Sun 10pm (index 58).
// Each bucket takes the MAX of the hourly model within its window, so the
// still using each bucket's max, so the true peak hour's value isn't diluted.
const BUCKETS = [
  { start: 0, end: 4, label: 'Fri 12p' },
  { start: 5, end: 8, label: '6p', mark: 'peak' },
  { start: 9, end: 11, label: '9p' },
  { start: 12, end: 17, label: 'Sat 12a' },
  { start: 18, end: 23, label: '6a', mark: 'Farmers Market' },
  { start: 24, end: 29, label: '12p' },
  { start: 30, end: 35, label: '6p' },
  { start: 36, end: 41, label: 'Sun 12a' },
  { start: 42, end: 47, label: '6a', mark: 'Trifest' },
  { start: 48, end: 58, label: '12p' },
];

function hourlyValues() {
  const values = [];
  for (let i = 0; i < 59; i++) {
    let v = 20;
    for (const e of EVENTS) v += e.val * Math.exp(-((i - e.peak) ** 2) / (2 * e.sigma * e.sigma));
    values.push(v);
  }
  return values;
}

function buildBuckets() {
  const hourly = hourlyValues();
  return BUCKETS.map((b) => {
    let max = 0;
    for (let i = b.start; i <= b.end; i++) max = Math.max(max, hourly[i]);
    return { ...b, value: Math.round(max) };
  });
}

export default function WeekendChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const buckets = buildBuckets();
    const labels = buckets.map((b) => b.label);
    const values = buckets.map((b) => b.value);
    const dayDividers = [1.5, 5.5]; // between Fri/Sat and Sat/Sun buckets

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
            ctx.font = '600 15px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText('~' + b.value.toLocaleString(), x, y - 32);
            ctx.fillStyle = '#5B5F6B';
            ctx.font = '400 10px -apple-system, BlinkMacSystemFont, sans-serif';
            ctx.fillText('Fri 7–8pm', x, y - 18);
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
        layout: { padding: { top: 46 } },
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
  }, []);

  const peakValue = buildBuckets().find((b) => b.mark === 'peak')?.value ?? 0;
  const ariaLabel = `Area chart of estimated foot traffic in downtown Bentonville from Friday September 4 noon to Sunday September 6 10pm, peaking at about ${peakValue.toLocaleString()} people Friday 7 to 8pm during First Friday Live and the Trifest youth triathlon, with smaller peaks Saturday morning for the farmers market and Sunday morning for the Trifest super sprint.`;

  return <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />;
}
