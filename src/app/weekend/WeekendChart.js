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

function buildSeries() {
  const labels = [];
  const dayOf = [];
  for (let i = 0; i < 12; i++) { labels.push('Fri ' + (i === 0 ? '12p' : i + 'p')); dayOf.push(0); }
  for (let i = 0; i < 24; i++) { const h = i === 0 ? '12a' : i < 12 ? i + 'a' : i === 12 ? '12p' : (i - 12) + 'p'; labels.push('Sat ' + h); dayOf.push(1); }
  for (let i = 0; i < 23; i++) { const h = i === 0 ? '12a' : i < 12 ? i + 'a' : i === 12 ? '12p' : (i - 12) + 'p'; labels.push('Sun ' + h); dayOf.push(2); }

  const values = labels.map((_, i) => {
    let v = 20;
    for (const e of EVENTS) v += e.val * Math.exp(-((i - e.peak) ** 2) / (2 * e.sigma * e.sigma));
    return Math.round(v);
  });
  return { labels, dayOf, values };
}

export default function WeekendChart() {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const { labels, dayOf, values } = buildSeries();
    const peakIndex = values.indexOf(Math.max(...values));
    const dayColors = ['#14171F', '#5B5F6B', '#A39C8A'];
    const bg = values.map((v, i) => (i === peakIndex ? '#B3431E' : dayColors[dayOf[i]]));

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: { labels, datasets: [{ data: values, backgroundColor: bg, borderRadius: 2, barPercentage: 0.85, categoryPercentage: 0.9 }] },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => '~' + ctx.parsed.y.toLocaleString() } },
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#5B5F6B', font: { size: 10 }, callback: (v) => v.toLocaleString() }, grid: { color: '#E4E0D4' } },
          x: { grid: { display: false }, ticks: { color: '#5B5F6B', font: { size: 9 }, maxRotation: 90, minRotation: 90, autoSkip: true, maxTicksLimit: 24 } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Hourly bar chart of estimated concurrent people in downtown Bentonville from Friday September 4 noon to Sunday September 6 10pm, peaking Friday evening at First Friday Live and the Trifest youth triathlon, with further peaks Saturday morning for the farmers market and Trifest sprint, Saturday and Sunday afternoon for Crystal Bridges, and Sunday morning for the Trifest super sprint."
    />
  );
}
