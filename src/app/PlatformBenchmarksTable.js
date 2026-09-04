'use client';

import { useState } from 'react';

const BLENDED = 'All sizes (blended)';

// Only "Avg. daily rate" changes with the size selector - occupancy,
// RevPAR, active listings, and annual revenue have no by-size breakdown
// (sourced or modelable) from any platform, so those rows stay blended
// regardless of what's selected. Selecting a specific size also switches
// AirDNA's cell to a modeled estimate (see platformRatesByBedroomCount in
// footTrafficModel.js) rather than a number AirDNA itself published.
export default function PlatformBenchmarksTable({ bySize }) {
  const [size, setSize] = useState(BLENDED);
  const selected = bySize.find((b) => b.size === size);
  const isBlended = size === BLENDED;

  const rabbuADR = isBlended ? 160 : selected.rabbu;
  const airdnaADR = isBlended ? 208 : selected.airdna;
  const rabbuNote = !isBlended && !selected.rabbuSourced;

  return (
    <div>
      <div className="flex items-center justify-between px-1 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--ink-soft)' }}>
          By platform
        </p>
        <select
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="text-xs rounded-md px-2 py-1"
          style={{ border: '1px solid var(--border)', color: 'var(--ink)', backgroundColor: 'var(--background)' }}
        >
          <option value={BLENDED}>{BLENDED}</option>
          {bySize.map((b) => (
            <option key={b.size} value={b.size}>{b.size}</option>
          ))}
        </select>
      </div>
      <p className="text-[10px] px-1 pt-1 pb-2" style={{ color: 'var(--ink-soft)' }}>
        {isBlended
          ? "Each platform's own reported Bentonville-wide figure."
          : 'Rabbu is sourced or interpolated by size (see the table above); AirDNA has no published size breakdown, so its figure here is modeled by scaling its blended rate using Rabbu\'s own size ratio.'}
      </p>
      <div className="overflow-x-auto px-1">
        <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th className="text-left font-medium pb-2" style={{ color: 'var(--ink-soft)' }}></th>
              <th className="text-right font-medium pb-2" style={{ color: 'var(--ink)' }}>AirDNA</th>
              <th className="text-right font-medium pb-2" style={{ color: 'var(--ink)' }}>Rabbu</th>
              <th className="text-right font-medium pb-2" style={{ color: 'var(--ink)' }}>AirROI</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td className="py-2" style={{ color: 'var(--ink-soft)' }}>Avg. daily rate</td>
              <td className="text-right py-2" style={{ color: 'var(--ink)' }}>
                ${airdnaADR}{!isBlended && '†'}
              </td>
              <td className="text-right py-2" style={{ color: 'var(--ink)' }}>
                ${rabbuADR}{rabbuNote && '*'}
              </td>
              <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td className="py-2" style={{ color: 'var(--ink-soft)' }}>
                Occupancy <span className="text-[10px]">(% of nights booked{!isBlended && ', blended'})</span>
              </td>
              <td className="text-right py-2" style={{ color: 'var(--ink)' }}>56%</td>
              <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
              <td className="text-right py-2" style={{ color: 'var(--ink)' }}>43%</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td className="py-2" style={{ color: 'var(--ink-soft)' }}>
                RevPAR <span className="text-[10px]">(rate × occupancy{!isBlended && ', blended'})</span>
              </td>
              <td className="text-right py-2" style={{ color: 'var(--ink)' }}>$111</td>
              <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
              <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td className="py-2" style={{ color: 'var(--ink-soft)' }}>
                Active listings <span className="text-[10px]">(total tracked)</span>
              </td>
              <td className="text-right py-2" style={{ color: 'var(--ink)' }}>~1,160</td>
              <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
              <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
            </tr>
            <tr style={{ borderTop: '1px solid var(--border)' }}>
              <td className="py-2" style={{ color: 'var(--ink-soft)' }}>
                Avg. annual revenue <span className="text-[10px]">(per listing{!isBlended && ', blended'})</span>
              </td>
              <td className="text-right py-2" style={{ color: 'var(--ink)' }}>~$25.2K</td>
              <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
              <td className="text-right py-2" style={{ color: 'var(--ink-soft)' }}>—</td>
            </tr>
          </tbody>
        </table>
      </div>
      {!isBlended && (
        <p className="text-[10px] px-1 pt-2" style={{ color: 'var(--ink-soft)' }}>
          † Modeled from AirDNA's blended rate, not AirDNA's own reported figure.
          {rabbuNote && ' * Interpolated between Rabbu\'s Studio and 4 Bedroom figures.'}
        </p>
      )}
    </div>
  );
}
