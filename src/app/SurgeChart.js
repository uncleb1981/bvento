'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// One bar per identified out-of-town surge, in chronological order - a
// consolidated replacement for nine near-identical per-weekend charts, most
// of which had no surge signal left once local-only events were excluded.
export default function SurgeChart({ surges }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const values = surges.map((s) => s.value);
    const maxValue = Math.max(...values);
    const labels = surges.map((s) => s.bookingWindow);

    const barLabelPlugin = {
      id: 'barLabels',
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#14171F';

        // Real 2D collision detection: place labels left to right, and for
        // each one keep nudging it upward until its bounding box (with a
        // small margin) clears every label already placed. Handles both
        // same-height neighbors and bars of very different heights sitting
        // close together, which a same-row-only check can miss.
        const placed = [];
        const textHeight = 12;
        meta.data.forEach((bar, i) => {
          const text = surges[i].label;
          const halfWidth = ctx.measureText(text).width / 2;
          // Clamp so a label near either edge doesn't run off the canvas.
          const x = Math.min(Math.max(bar.x, chartArea.left + halfWidth), chartArea.right - halfWidth);
          let y = bar.y - 8;

          for (let guard = 0; guard < 20; guard++) {
            const box = { left: x - halfWidth - 3, right: x + halfWidth + 3, top: y - textHeight, bottom: y + 2 };
            const overlaps = placed.some(
              (p) => box.left < p.right && box.right > p.left && box.top < p.bottom && box.bottom > p.top
            );
            if (!overlaps) break;
            y -= 14;
          }
          placed.push({ left: x - halfWidth - 3, right: x + halfWidth + 3, top: y - textHeight, bottom: y + 2 });

          ctx.textAlign = 'center';
          ctx.fillText(text, x, y);
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: values.map((v) => (v === maxValue ? '#B3431E' : '#D9C7BC')),
            borderRadius: 4,
            maxBarThickness: 48,
          },
        ],
      },
      plugins: [barLabelPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 40 } },
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => surges[items[0].dataIndex].label,
              label: (ctx) => [`~${ctx.parsed.y.toLocaleString()} people`, `Book for ${surges[ctx.dataIndex].bookingWindow}`, `Peaks ${surges[ctx.dataIndex].when}`],
            },
          },
        },
        scales: {
          y: { beginAtZero: true, ticks: { color: '#5B5F6B', font: { size: 10 }, callback: (v) => v.toLocaleString() }, grid: { color: '#E4E0D4' } },
          x: { grid: { display: false }, ticks: { color: '#5B5F6B', font: { size: 10 } } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [surges]);

  const ariaLabel = `Bar chart of ${surges.length} identified out-of-town crowd surges in Bentonville from ${surges[0]?.when} through ${surges[surges.length - 1]?.when}, ranging from ${Math.min(...surges.map((s) => s.value)).toLocaleString()} to ${Math.max(...surges.map((s) => s.value)).toLocaleString()} people.`;

  return <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />;
}
