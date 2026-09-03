'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Estimated downtown Bentonville nightly rate by day of week - a MODELED
// estimate (see estimatedDailyRateByDayOfWeek in footTrafficModel.js for
// the exact inputs), not sourced data, so it's drawn as a dashed line to
// stay visually distinct from the sourced benchmark figures on this page.
export default function DayOfWeekChart({ days }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const values = days.map((d) => d.rate);
    const maxValue = Math.max(...values);
    const labels = days.map((d) => d.day);

    const pointLabelPlugin = {
      id: 'pointLabels',
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
        meta.data.forEach((point, i) => {
          const text = `$${values[i]}`;
          const halfWidth = ctx.measureText(text).width / 2;
          // Clamp so the first/last point's label doesn't run off the canvas.
          const x = Math.min(Math.max(point.x, chartArea.left + halfWidth), chartArea.right - halfWidth);
          ctx.textAlign = 'center';
          ctx.fillStyle = values[i] === maxValue ? '#B3431E' : '#5B5F6B';
          ctx.fillText(text, x, point.y - 12);
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
            borderColor: '#B3431E',
            borderWidth: 2.5,
            borderDash: [6, 4],
            tension: 0.3,
            fill: false,
            pointRadius: values.map((v) => (v === maxValue ? 5 : 3.5)),
            pointBackgroundColor: values.map((v) => (v === maxValue ? '#B3431E' : '#14171F')),
            pointBorderColor: '#F6F3EC',
            pointBorderWidth: 1.5,
          },
        ],
      },
      plugins: [pointLabelPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 26 } },
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const d = days[ctx.dataIndex];
                const base = [`~$${d.rate} estimated ADR`];
                if (d.surgeCount) base.push(`${d.surgeCount} identified surge${d.surgeCount === 1 ? '' : 's'} this day`);
                return base;
              },
            },
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#5B5F6B', font: { size: 10 }, callback: (v) => `$${v}` }, grid: { color: '#E4E0D4' } },
          x: { grid: { display: false }, ticks: { color: '#5B5F6B', font: { size: 10 } } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [days]);

  const peak = days.reduce((best, d) => (d.rate > best.rate ? d : best), days[0]);
  const ariaLabel = `Dashed line chart of estimated downtown Bentonville nightly rate by day of week, a modeled estimate. ${peak.day} is highest at approximately $${peak.rate}.`;

  return <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />;
}
