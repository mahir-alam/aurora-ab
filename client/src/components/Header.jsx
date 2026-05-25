import React from 'react';

const LEVEL_LABEL = {
  Storm:     'STORM',
  Active:    'EXCELLENT',
  Unsettled: 'MODERATE',
  Quiet:     'QUIET',
};

const LEVEL_COLOR = {
  Storm:     '#00b87a',
  Active:    '#00b87a',
  Unsettled: '#f59e0b',
  Quiet:     '#ef4444',
};

function kpSolid(kp) {
  if (kp >= 5) return '#00b87a';
  if (kp >= 3) return '#f59e0b';
  return '#ef4444';
}

function kpGlow(kp) {
  if (kp >= 5) return '#00b87a';
  if (kp >= 3) return '#f59e0b';
  return '#ef4444';
}

export default function Header({ kp, tonightForecast, loading }) {
  const solidColor   = kpSolid(kp);
  const glowColor    = kpGlow(kp);
  const isPulsing    = kp !== null && kp >= 4;
  const tonightLabel = tonightForecast ? (LEVEL_LABEL[tonightForecast.level] || tonightForecast.level) : null;
  const tonightColor = tonightForecast ? (LEVEL_COLOR[tonightForecast.level] || '#9ca3af') : '#9ca3af';

  return (
    <header
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1a1d2e 0%, #1e1640 25%, #241848 45%, #162a22 70%, #1a1d2e 100%)',
        minHeight: '148px',
      }}
    >
      <div className="aurora-line-1" />
      <div className="aurora-line-2" />
      <div className="aurora-line-3" />

      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 15% 50%, rgba(139,92,246,0.10) 0%, transparent 55%), radial-gradient(ellipse at 85% 50%, rgba(0,184,122,0.08) 0%, transparent 55%)',
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-7 flex items-center justify-between gap-6">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-3xl select-none" style={{ filter: 'drop-shadow(0 0 10px rgba(0,255,136,0.65))' }}>🌌</span>
            <h1
              className="font-bold aurora-text-glow"
              style={{ fontSize: '2rem', letterSpacing: '-0.02em', lineHeight: 1.1, color: '#ffffff' }}
            >
              AuroraAB
            </h1>
          </div>
          <p className="ml-12" style={{ fontSize: '0.875rem', color: '#9ca3af', maxWidth: '340px' }}>
            Real-time aurora forecast for Alberta dark sky sites
          </p>

          {!loading && tonightLabel && (
            <div className="flex items-center gap-2 mt-3 ml-12">
              <span style={{ fontSize: '0.6875rem', color: '#6b7280', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Tonight
              </span>
              <span style={{
                fontSize: '0.6875rem', fontWeight: 600, padding: '2px 10px', borderRadius: '9999px',
                color: tonightColor, background: `${tonightColor}18`, border: `1px solid ${tonightColor}40`,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>
                {tonightLabel}
              </span>
            </div>
          )}
        </div>

        {/* KP badge */}
        <div className="flex-shrink-0 text-center">
          {loading ? (
            <div style={{ width: 86, height: 86, borderRadius: '50%', background: '#2a2f42', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ) : (
            <div
              className={isPulsing ? 'kp-pulsing' : ''}
              style={{
                '--kp-glow': `${glowColor}55`,
                width: 86, height: 86, borderRadius: '50%',
                background: solidColor,
                boxShadow: `0 0 28px ${glowColor}60, 0 0 56px ${glowColor}28, 0 4px 16px rgba(0,0,0,0.5)`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto',
                border: '3px solid rgba(255,255,255,0.85)',
              }}
            >
              <span style={{ fontSize: '27px', fontWeight: 700, color: 'white', lineHeight: 1 }}>
                {kp !== null ? kp.toFixed(1) : '--'}
              </span>
              <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.75)', marginTop: '3px', letterSpacing: '0.1em', fontWeight: 500, textTransform: 'uppercase' }}>
                KP Index
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
