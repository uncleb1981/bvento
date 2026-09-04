'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const SERIES = [
  { key: 'studio', label: 'Studio', color: '#5B5F6B', dash: [3, 3] },
  { key: 'fourBedroom', label: '4 Bedroom', color: '#B3431E', dash: [6, 4] },
];

// Estimated downtown Bentonville nightly rate by day of week, one line per
// property size - a MODELED estimate (see estimatedRateByDayOfWeekBySize in
// footTrafficModel.js for the exact inputs), not sourced data, so both
// lines are drawn dashed to stay visually distinct from the sourced
// benchmark figures elsewhere on this page.
export default function DayOfWeekChart({ studio, fourBedroom }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const seriesData = { studio, fourBedroom };

  useEffect(() => {
    const labels = studio.map((d) => d.day);

    const peakLabelPlugin = {
      id: 'peakLabels',
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        ctx.save();
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
        const placed = [];
        SERIES.forEach((s, datasetIndex) => {
          const days = seriesData[s.key];
          const values = days.map((d) => d.rate);
          const maxValue = Math.max(...values);
          const peakIndex = values.indexOf(maxValue);
          const meta = chart.getDatasetMeta(datasetIndex);
          const point = meta.data[peakIndex];
          if (!point) return;

          const text = `$${maxValue}`;
          const halfWidth = ctx.measureText(text).width / 2;
          const x = Math.min(Math.max(point.x, chartArea.left + halfWidth), chartArea.right - halfWidth);
          let y = point.y - 10;
          for (let guard = 0; guard < 10; guard++) {
            const box = { left: x - halfWidth - 2, right: x + halfWidth + 2, top: y - 12, bottom: y + 2 };
            const overlaps = placed.some((p) => box.left < p.right && box.right > p.left && box.top < p.bottom && box.bottom > p.top);
            if (!overlaps) break;
            y -= 14;
          }
          placed.push({ left: x - halfWidth - 2, right: x + halfWidth + 2, top: y - 12, bottom: y + 2 });

          ctx.textAlign = 'center';
          ctx.fillStyle = s.color;
          ctx.fillText(text, x, y);
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: SERIES.map((s) => ({
          label: s.label,
          data: seriesData[s.key].map((d) => d.rate),
          borderColor: s.color,
          borderWidth: 2.5,
          borderDash: s.dash,
          tension: 0.3,
          fill: false,
          pointRadius: 3.5,
          pointBackgroundColor: s.color,
          pointBorderColor: '#F6F3EC',
          pointBorderWidth: 1.5,
        })),
      },
      plugins: [peakLabelPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 26 } },
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: { color: '#5B5F6B', font: { size: 11 }, boxWidth: 16, padding: 12 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ~$${ctx.parsed.y}`,
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
  }, [studio, fourBedroom]);

  const studioPeak = studio.reduce((best, d) => (d.rate > best.rate ? d : best), studio[0]);
  const fourBRPeak = fourBedroom.reduce((best, d) => (d.rate > best.rate ? d : best), fourBedroom[0]);
  const ariaLabel = `Dashed line chart, two lines, of estimated downtown Bentonville nightly rate by day of week - a modeled estimate. Studio peaks ${studioPeak.day} at approximately $${studioPeak.rate}. 4 Bedroom peaks ${fourBRPeak.day} at approximately $${fourBRPeak.rate}.`;

  return <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />;
}
