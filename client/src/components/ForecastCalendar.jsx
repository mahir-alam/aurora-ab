import React from 'react';

function getStyle(color) {
  if (color === 'green')  return { hex: '#00ff9d', bg: '#131722', border: '#1a3325' };
  if (color === 'yellow') return { hex: '#fbbf24', bg: '#131722', border: '#2a2010' };
  return                         { hex: '#ef4444', bg: '#131722', border: '#2a1515' };
}

function kpToDots(kp) {
  if (kp < 2) return 0;
  return Math.min(5, Math.floor((kp + 1) / 2));
}

function kpToActivity(kp) {
  if (kp >= 9) return 'Extreme Storm';
  if (kp >= 8) return 'Severe Storm';
  if (kp >= 7) return 'Strong Storm';
  if (kp >= 6) return 'Moderate Storm';
  if (kp >= 5) return 'Minor Storm';
  if (kp >= 4) return 'Active';
  if (kp >= 2) return 'Unsettled';
  return 'Quiet';
}

function kpToDesc(kp) {
  if (kp >= 9) return 'Historic event. Visible across all of Alberta.';
  if (kp >= 8) return 'Exceptional display. Once-in-a-year opportunity.';
  if (kp >= 7) return 'Intense aurora. Vivid colours to the naked eye.';
  if (kp >= 6) return 'Strong display expected. Head outside tonight.';
  if (kp >= 5) return 'Aurora likely visible across Alberta tonight.';
  if (kp >= 4) return 'Good chance at dark sky sites. Worth the drive.';
  if (kp >= 2) return 'Faint aurora possible near the northern horizon.';
  return 'Aurora unlikely. Great night for stargazing instead.';
}

function KpDots({ maxKp, hex }) {
  const filled = kpToDots(maxKp);
  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < filled ? hex : '#1e2638',
            border: `1px solid ${i < filled ? hex : '#2d3748'}`,
          }} />
        ))}
      </div>

      <div style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: hex, textAlign: 'center', marginBottom: '6px' }}>
        {kpToActivity(maxKp)}
      </div>

      <div style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: '#f1f5f9', textAlign: 'center', padding: '0 4px' }}>
        {kpToDesc(maxKp)}
      </div>
    </div>
  );
}

function getForecastDate(dayOffset) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const tz  = 'America/Edmonton';
  const dow = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: tz });
  const mon = d.toLocaleDateString('en-US', { month: 'short',   timeZone: tz });
  const day = d.toLocaleDateString('en-US', { day: 'numeric',   timeZone: tz });
  return `${dow}, ${mon} ${day}`;
}

export default function ForecastCalendar({ forecast, loading }) {
  return (
    <div>
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569', marginBottom: '12px' }}>
        3-Day KP Forecast
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse" style={{ height: 240, borderRadius: 8, background: '#131722' }} />
            ))
          : forecast.map((day, i) => {
              const s    = getStyle(day.color);
              const date = getForecastDate(i);
              return (
                <div key={i} className="text-center relative overflow-hidden"
                  style={{
                    background: s.bg,
                    border: `1px solid ${s.border}`,
                    borderRadius: 8,
                    padding: '16px',
                  }}
                >
                  {/* Tonight top accent bar */}
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: s.hex }} />
                  )}

                  <div style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ffffff', marginBottom: '2px' }}>
                    {day.label}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '12px' }}>
                    {date}
                  </div>

                  <div style={{
                    fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: s.hex,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {day.maxKp}
                  </div>
                  <div style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#475569', marginTop: '3px' }}>
                    KP
                  </div>

                  <KpDots maxKp={day.maxKp} hex={s.hex} />

                  <div style={{ fontSize: '0.6875rem', color: '#475569', marginTop: '10px', fontFamily: "'JetBrains Mono', monospace" }}>
                    avg KP {day.avgKp}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
