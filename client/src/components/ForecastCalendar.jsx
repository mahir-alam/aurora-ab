import React from 'react';

function getStyle(color) {
  if (color === 'green')  return {
    hex: '#00b87a',
    grad: 'linear-gradient(160deg, #1c2d24 0%, #172520 100%)',
    border: 'rgba(0, 184, 122, 0.22)',
    glow: 'rgba(0, 184, 122, 0.08)',
  };
  if (color === 'yellow') return {
    hex: '#f59e0b',
    grad: 'linear-gradient(160deg, #26220f 0%, #211c0b 100%)',
    border: 'rgba(245, 158, 11, 0.22)',
    glow: 'rgba(245, 158, 11, 0.08)',
  };
  return {
    hex: '#ef4444',
    grad: 'linear-gradient(160deg, #27181e 0%, #22141a 100%)',
    border: 'rgba(239, 68, 68, 0.22)',
    glow: 'rgba(239, 68, 68, 0.08)',
  };
}

// KP → dot count: 0-1=0, 2=1, 3-4=2, 5-6=3, 7-8=4, 9+=5
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
  if (kp >= 8) return 'Exceptional display. Once-in-a-year opportunity!';
  if (kp >= 7) return 'Intense aurora. Vivid colours to the naked eye.';
  if (kp >= 6) return 'Strong display expected. Head outside tonight!';
  if (kp >= 5) return 'Aurora likely visible across Alberta. Go for it.';
  if (kp >= 4) return 'Good chance at dark sky sites. Worth the drive.';
  if (kp >= 2) return 'Very faint aurora near the northern horizon.';
  return 'Aurora unlikely. Great night for stargazing instead.';
}

function KpDots({ maxKp, hex }) {
  const filled = kpToDots(maxKp);
  return (
    <div style={{ marginTop: '14px' }}>
      {/* Activity label */}
      <div style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: hex, textAlign: 'center', marginBottom: '8px' }}>
        {kpToActivity(maxKp)}
      </div>

      {/* Dot meter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '10px' }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: i < filled ? hex : '#374151',
            border: `1px solid ${i < filled ? hex + '80' : '#4b5563'}`,
            boxShadow: i < filled ? `0 0 7px ${hex}aa, 0 0 14px ${hex}44` : 'none',
            transition: 'background 0.3s, box-shadow 0.3s',
          }} />
        ))}
      </div>

      {/* Description */}
      <div style={{ fontSize: '0.6875rem', lineHeight: 1.5, color: '#9ca3af', textAlign: 'center', padding: '0 4px' }}>
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
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#6b7280', marginBottom: '16px' }}>
        3-Day KP Forecast
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl animate-pulse" style={{ background: '#242938' }} />
            ))
          : forecast.map((day, i) => {
              const s    = getStyle(day.color);
              const date = getForecastDate(i);
              return (
                <div key={i} className="rounded-xl p-5 text-center relative overflow-hidden"
                  style={{
                    background: s.grad,
                    border: `1px solid ${s.border}`,
                    boxShadow: `0 4px 20px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
                  }}
                >
                  {/* Tonight accent line */}
                  {i === 0 && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${s.hex}, transparent)` }} />
                  )}

                  {/* Period label */}
                  <div style={{ fontSize: '0.6875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: s.hex, marginBottom: '3px' }}>
                    {day.label}
                  </div>

                  {/* Date */}
                  <div style={{ fontSize: '0.75rem', fontWeight: 500, color: '#9ca3af', marginBottom: '14px' }}>
                    {date}
                  </div>

                  {/* KP number */}
                  <div style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1, color: s.hex, textShadow: `0 0 20px ${s.hex}80` }}>
                    {day.maxKp}
                  </div>

                  <KpDots maxKp={day.maxKp} hex={s.hex} />

                  <div style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '8px' }}>avg KP {day.avgKp}</div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
