import React from 'react';

const LEVEL_LABEL = {
  Storm:     'STORM',
  Active:    'EXCELLENT',
  Unsettled: 'MODERATE',
  Quiet:     'QUIET',
};

const LEVEL_COLOR = {
  Storm:     '#00ff9d',
  Active:    '#00ff9d',
  Unsettled: '#fbbf24',
  Quiet:     '#ef4444',
};

function kpSolid(kp) {
  if (kp >= 5) return '#00ff9d';
  if (kp >= 3) return '#fbbf24';
  return '#ef4444';
}

export default function Header({ kp, tonightForecast, loading }) {
  const solidColor   = kpSolid(kp);
  const tonightLabel = tonightForecast ? (LEVEL_LABEL[tonightForecast.level] || tonightForecast.level) : null;
  const tonightColor = tonightForecast ? (LEVEL_COLOR[tonightForecast.level] || '#94a3b8') : '#94a3b8';

  return (
    <header
      className="relative overflow-hidden"
      style={{
        background: 'rgba(10,13,20,0.82)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        minHeight: '140px',
        borderBottom: '1px solid #1e2638',
      }}
    >
      <div className="aurora-line-1" />
      <div className="aurora-line-2" />
      <div className="aurora-line-3" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between gap-6">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="text-2xl select-none">🌌</span>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', margin: 0, lineHeight: 1 }}>
              Aurora<span style={{ color: '#00ff9d' }}>AB</span>
            </h1>
          </div>
          <p className="ml-11" style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
            Real-time aurora forecast for Alberta dark sky sites
          </p>

          {!loading && tonightLabel && (
            <div className="flex items-center gap-2 mt-2.5 ml-11">
              <span style={{ fontSize: '0.6875rem', color: '#475569', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Tonight
              </span>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: '3px',
                color: '#0a0d14', background: tonightColor,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                {tonightLabel}
              </span>
            </div>
          )}
        </div>

        {/* KP badge */}
        <div className="flex-shrink-0 text-center">
          {loading ? (
            <div style={{ width: 82, height: 82, borderRadius: '50%', background: '#131722', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <div
              style={{
                width: 82, height: 82, borderRadius: '50%',
                background: solidColor,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
                border: '2px solid rgba(255,255,255,0.9)',
              }}
            >
              <span style={{
                fontSize: '26px', fontWeight: 900, color: '#0a0d14', lineHeight: 1,
                fontFamily: "'JetBrains Mono', monospace",
                fontVariantNumeric: 'tabular-nums',
              }}>
                {kp !== null ? kp.toFixed(1) : '--'}
              </span>
              <span style={{ fontSize: '8px', color: 'rgba(0,0,0,0.55)', marginTop: '3px', letterSpacing: '0.12em', fontWeight: 700, textTransform: 'uppercase' }}>
                KP Index
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
