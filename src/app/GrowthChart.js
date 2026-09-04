'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

// Two very differently-shaped real datasets on one chart: population is a
// rich multi-point series (solid line, left axis), STR listings is just
// two known dated points (dashed line connecting them, right axis) - the
// dashed line is a straight connector between the two real points, not a
// claim about the shape of growth in between, since nothing is known
// about what happened in the 5 years between them.
export default function GrowthChart({ population, strListings }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const years = population.map((p) => p.year);
    const popByYear = Object.fromEntries(population.map((p) => [p.year, p.population]));
    const strByYear = Object.fromEntries(strListings.map((s) => [s.year, s.listings]));

    // Build a combined year axis so the sparse STR points land on the
    // correct position relative to the dense population line.
    const allYears = Array.from(new Set([...years, ...strListings.map((s) => s.year)])).sort((a, b) => a - b);
    const popData = allYears.map((y) => popByYear[y] ?? null);
    const strData = allYears.map((y) => strByYear[y] ?? null);

    const pointLabelPlugin = {
      id: 'pointLabels',
      afterDatasetsDraw(chart) {
        const { ctx } = chart;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '600 10px -apple-system, BlinkMacSystemFont, sans-serif';

        const popMeta = chart.getDatasetMeta(0);
        allYears.forEach((y, i) => {
          if (popByYear[y] == null) return;
          const point = popMeta.data[i];
          if (!point) return;
          ctx.fillStyle = '#5B5F6B';
          ctx.fillText(popByYear[y].toLocaleString(), point.x, point.y - 10);
        });

        const strMeta = chart.getDatasetMeta(1);
        allYears.forEach((y, i) => {
          if (strByYear[y] == null) return;
          const point = strMeta.data[i];
          if (!point) return;
          ctx.fillStyle = '#B3431E';
          ctx.fillText(`${strByYear[y].toLocaleString()} STRs`, point.x, point.y - 10);
        });
        ctx.restore();
      },
    };

    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: allYears,
        datasets: [
          {
            label: 'Population',
            data: popData,
            borderColor: '#5B5F6B',
            backgroundColor: 'rgba(91,95,107,0.08)',
            borderWidth: 2.5,
            tension: 0.3,
            fill: true,
            spanGaps: true,
            yAxisID: 'y',
            pointRadius: 3.5,
            pointBackgroundColor: '#5B5F6B',
            pointBorderColor: '#F6F3EC',
            pointBorderWidth: 1.5,
          },
          {
            label: 'STR listings',
            data: strData,
            borderColor: '#B3431E',
            borderWidth: 2.5,
            borderDash: [6, 4],
            tension: 0,
            fill: false,
            spanGaps: true,
            yAxisID: 'y1',
            pointRadius: 5,
            pointBackgroundColor: '#B3431E',
            pointBorderColor: '#F6F3EC',
            pointBorderWidth: 1.5,
          },
        ],
      },
      plugins: [pointLabelPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 30 } },
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
              label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y?.toLocaleString()}`,
            },
          },
        },
        scales: {
          y: {
            position: 'left',
            min: 40000,
            max: 62000,
            ticks: { color: '#5B5F6B', font: { size: 10 }, callback: (v) => v.toLocaleString() },
            grid: { color: '#E4E0D4' },
          },
          y1: {
            position: 'right',
            beginAtZero: true,
            max: 1600,
            ticks: { color: '#B3431E', font: { size: 10 }, callback: (v) => v.toLocaleString() },
            grid: { display: false },
          },
          x: { grid: { display: false }, ticks: { color: '#5B5F6B', font: { size: 10 } } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [population, strListings]);

  const firstPop = population[0];
  const lastPop = population[population.length - 1];
  const firstSTR = strListings[0];
  const lastSTR = strListings[strListings.length - 1];
  const ariaLabel = `Dual-axis line chart. Population grew from ${firstPop.population.toLocaleString()} in ${firstPop.year} to ${lastPop.population.toLocaleString()} in ${lastPop.year}. STR listings, known at only two points, grew from ${firstSTR.listings.toLocaleString()} in ${firstSTR.year} to ${lastSTR.listings.toLocaleString()} in ${lastSTR.year} - the line between them is a straight connector, not a known trend.`;

  return <canvas ref={canvasRef} role="img" aria-label={ariaLabel} />;
}
