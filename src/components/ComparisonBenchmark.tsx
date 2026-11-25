import { useState } from 'react';
import { BENCHMARK_SPEC, LOW_CODE_PLATFORMS } from '../data/platforms';
import { calculatePlatformCost, totalBuildMinutes } from '../engine/generator';

export function ComparisonBenchmark() {
  const [seats, setSeats] = useState(25);
  const [deployment, setDeployment] = useState<'cloud' | 'self-hosted'>('cloud');

  return (
    <section id="benchmark" className="section section--tinted">
      <div className="container">
        <div className="section__head">
          <div>
            <h2 className="section__title">
              Reproducible Low-Code Platform Benchmark: Inventory Management App
            </h2>
            <p className="section__sub">
              We built the same four-table PostgreSQL inventory app (products, suppliers, stock movements, employee roles, and low-stock webhooks) across Appsmith, ToolJet, Retool, Budibase, NocoDB, Directus, Refine, and OpenForge to compare real build time, recurring seat cost, RBAC boundaries, and migration freedom.
            </p>
          </div>
        </div>

        <div className="cut tco-controls">
          <div className="slider-wrap">
            <label htmlFor="seat-slider" className="label">
              Team size (20% builders, 80% end users):
            </label>
            <input
              id="seat-slider"
              type="range"
              min={5}
              max={200}
              step={5}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value))}
            />
            <span className="seat-readout">{seats} users</span>
          </div>

          <div className="chip-tray" role="group" aria-label="Deployment mode">
            <button
              type="button"
              className={`key key--sm ${deployment === 'cloud' ? 'key--pressed' : ''}`}
              onClick={() => setDeployment('cloud')}
            >
              Managed Cloud
            </button>
            <button
              type="button"
              className={`key key--sm ${deployment === 'self-hosted' ? 'key--pressed' : ''}`}
              onClick={() => setDeployment('self-hosted')}
            >
              Self-Hosted (Docker)
            </button>
          </div>
        </div>

        <div className="table-wrap" style={{ background: 'var(--color-paper)', marginBottom: '24px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Platform</th>
                <th>License</th>
                <th>Build Time</th>
                <th>Monthly Cost ({seats} users)</th>
                <th>Annual Cost</th>
                <th>RBAC Support</th>
                <th>Code &amp; Data Export</th>
                <th>Lock-In Risk</th>
              </tr>
            </thead>
            <tbody>
              {LOW_CODE_PLATFORMS.map((p) => {
                const mins = totalBuildMinutes(p);
                const cost = calculatePlatformCost(p, seats, deployment);
                const isOwn = p.id === 'openforge';
                return (
                  <tr key={p.id} className={isOwn ? 'row--highlight' : undefined}>
                    <td>
                      <a href={p.website} target="_blank" rel="noreferrer">
                        <strong>{p.name}</strong>
                      </a>
                      <div className="label">{p.category}</div>
                    </td>
                    <td className="mono">{p.license}</td>
                    <td className="num">{mins} min</td>
                    <td className="num">
                      {cost.monthlyUsd === 0 ? '$0' : `$${cost.monthlyUsd.toLocaleString()}/mo`}
                    </td>
                    <td className="num">
                      {cost.annualUsd === 0 ? '$0' : `$${cost.annualUsd.toLocaleString()}/yr`}
                    </td>
                    <td>{p.rbacSupport}</td>
                    <td>{p.codeExport}</td>
                    <td>
                      <span
                        className={
                          p.lockInRisk === 'High'
                            ? 'status-inline status-inline--err'
                            : p.lockInRisk === 'Medium'
                              ? 'status-inline status-inline--warn'
                              : 'status-inline'
                        }
                      >
                        {p.lockInRisk}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="cut" style={{ padding: '20px 24px', background: 'var(--color-paper)' }}>
          <h3 style={{ marginBottom: '10px' }}>Benchmark Acceptance Specification</h3>
          <p className="section__sub" style={{ marginBottom: '12px' }}>
            Every build time above measures the same five requirements for {BENCHMARK_SPEC.appName}:
          </p>
          <ol style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-ink-2)', fontSize: '0.9rem' }}>
            {BENCHMARK_SPEC.requirements.map((req) => (
              <li key={req} style={{ marginBottom: '6px' }}>
                {req}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
