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

    // Greedy word-wrap: split `text` into lines that each fit within
    // maxWidth, so a long label wraps onto its own bar instead of reading
    // wide enough to bleed into a neighboring bar's space.
    function wrapText(ctx, text, maxWidth) {
      const words = text.split(' ');
      const lines = [];
      let line = '';
      for (const word of words) {
        const candidate = line ? `${line} ${word}` : word;
        if (ctx.measureText(candidate).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      }
      if (line) lines.push(line);
      return lines;
    }

    const barLabelPlugin = {
      id: 'barLabels',
      afterDatasetsDraw(chart) {
        const { ctx, chartArea } = chart;
        const meta = chart.getDatasetMeta(0);
        ctx.save();
        ctx.font = '600 11px -apple-system, BlinkMacSystemFont, sans-serif';
        ctx.fillStyle = '#14171F';

        // Each label wraps within roughly one bar-column's width, so it
        // stays over its own bar instead of reading into the next one.
        const columnWidth = meta.data.length > 1 ? meta.data[1].x - meta.data[0].x : chartArea.width;
        const maxLabelWidth = columnWidth * 0.92;
        const lineHeight = 13;

        // Real 2D collision detection: place labels left to right, and for
        // each one keep nudging it upward until its bounding box (with a
        // small margin) clears every label already placed. Handles both
        // same-height neighbors and bars of very different heights sitting
        // close together, which a same-row-only check can miss.
        const placed = [];
        meta.data.forEach((bar, i) => {
          const lines = wrapText(ctx, surges[i].label, maxLabelWidth);
          const halfWidth = Math.max(...lines.map((l) => ctx.measureText(l).width)) / 2;
          const textHeight = lines.length * lineHeight;
          // Clamp so a label near either edge doesn't run off the canvas.
          const x = Math.min(Math.max(bar.x, chartArea.left + halfWidth), chartArea.right - halfWidth);
          let bottom = bar.y - 8;

          for (let guard = 0; guard < 20; guard++) {
            const box = { left: x - halfWidth - 3, right: x + halfWidth + 3, top: bottom - textHeight, bottom: bottom + 2 };
            const overlaps = placed.some(
              (p) => box.left < p.right && box.right > p.left && box.top < p.bottom && box.bottom > p.top
            );
            if (!overlaps) break;
            bottom -= 14;
          }
          placed.push({ left: x - halfWidth - 3, right: x + halfWidth + 3, top: bottom - textHeight, bottom: bottom + 2 });

          ctx.textAlign = 'center';
          lines.forEach((l, li) => {
            ctx.fillText(l, x, bottom - (lines.length - 1 - li) * lineHeight);
          });
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
        layout: { padding: { top: 50 } },
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
