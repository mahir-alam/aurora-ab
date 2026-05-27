import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cloud, Car, Clock, Calendar, Navigation, CheckCircle } from 'lucide-react';

const CARD_BG     = '#131722';
const CARD_BORDER = '#1e2638';

function getStyle(score) {
  if (score >= 70) return { solid: '#00ff9d', hex: '#00ff9d' };
  if (score >= 40) return { solid: '#fbbf24', hex: '#fbbf24' };
  return              { solid: '#ef4444', hex: '#ef4444' };
}

function ScoreLabel() {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <span style={{ fontSize: '0.5625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#475569' }}>
        Viewing Score
      </span>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          width: 11, height: 11, borderRadius: '50%',
          background: '#1e2638', border: '1px solid #2d3748',
          color: '#64748b', fontSize: '0.4375rem', fontWeight: 700,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'default', flexShrink: 0, lineHeight: 1,
        }}
      >i</span>
      {show && (
        <div style={{
          position: 'absolute',
          left: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)',
          zIndex: 200, width: 190,
          background: '#1a1f30', border: '1px solid #2d3a52', borderRadius: 6,
          padding: '7px 10px', fontSize: '0.6875rem', color: '#94a3b8',
          lineHeight: 1.5, pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        }}>
          Combines KP index, cloud cover, and moon brightness into a 0–100 score. Higher = better aurora viewing tonight.
        </div>
      )}
    </div>
  );
}

export default function LocationCard({ location, userLocation, isTop, isSelected, isRouteActive, onShowRoute, onClick }) {
  const [driveInfo,    setDriveInfo]    = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const s        = getStyle(location.score);
  const hasToken = import.meta.env.VITE_MAPBOX_TOKEN &&
    import.meta.env.VITE_MAPBOX_TOKEN !== 'your_mapbox_token_here';

  useEffect(() => {
    if (!userLocation?.lat || !userLocation?.lng || !hasToken) return;
    let cancelled = false;
    axios.get(`/api/directions?from_lat=${userLocation.lat}&from_lng=${userLocation.lng}&to_lat=${location.lat}&to_lng=${location.lng}`)
      .then(r => { if (!cancelled) setDriveInfo(r.data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [userLocation?.lat, userLocation?.lng, location.lat, location.lng, hasToken]);

  const handleShowRoute = async (e) => {
    e.stopPropagation();
    if (isRouteActive) return;
    if (driveInfo?.geometry) { onShowRoute(location, driveInfo); return; }
    setRouteLoading(true);
    try {
      const r = await axios.get(`/api/directions?from_lat=${userLocation.lat}&from_lng=${userLocation.lng}&to_lat=${location.lat}&to_lng=${location.lng}`);
      setDriveInfo(r.data);
      onShowRoute(location, r.data);
    } catch (_) {
      // silently fail
    } finally {
      setRouteLoading(false);
    }
  };

  const cardBg = isRouteActive ? '#131722'
    : isSelected ? '#131722'
    : CARD_BG;

  const borderStyle = isRouteActive
    ? { border: `1px solid rgba(0,255,157,0.4)` }
    : isSelected
    ? { border: `1px solid rgba(178,102,255,0.35)` }
    : isTop
    ? {
        borderTop:    `1px solid ${CARD_BORDER}`,
        borderRight:  `1px solid ${CARD_BORDER}`,
        borderBottom: `1px solid ${CARD_BORDER}`,
        borderLeft:   `4px solid ${s.solid}`,
      }
    : { border: `1px solid ${CARD_BORDER}` };

  const padLeft = isTop ? '12px' : '16px';

  return (
    <div
      onClick={onClick}
      className="card-lift cursor-pointer"
      style={{
        position: 'relative',
        background: cardBg,
        ...borderStyle,
        borderRadius: 8,
        padding: `16px 16px 16px ${padLeft}`,
      }}
    >
      {/* Best Tonight badge */}
      {isTop && !isRouteActive && (
        <div
          className="best-badge-pulse"
          style={{
            position: 'absolute', top: 10, right: 10,
            display: 'flex', alignItems: 'center', gap: '3px',
            padding: '2px 8px', borderRadius: '9999px',
            background: s.solid, color: '#0a0d14',
            fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.08em',
            textTransform: 'uppercase', userSelect: 'none',
          }}
        >
          ✦ BEST TONIGHT
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Score circle + label */}
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56, height: 56,
              background: s.solid,
              border: '2px solid rgba(255,255,255,0.9)',
            }}
          >
            <div style={{ textAlign: 'center', lineHeight: 1 }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0a0d14', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                {location.score}
              </div>
              <div style={{ fontSize: '0.4375rem', fontWeight: 600, color: 'rgba(10,13,20,0.6)', letterSpacing: '0.02em' }}>
                /100
              </div>
            </div>
          </div>
          <ScoreLabel />
        </div>

        {/* Info column */}
        <div className="flex-1 min-w-0" style={{ paddingTop: isTop ? '18px' : '0' }}>
          <h3 className="truncate" style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff', margin: '0 0 1px 0', lineHeight: 1.25 }}>
            {location.name}
          </h3>

          <div style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#6ee7b7', marginBottom: '8px' }}>
            {location.type}
          </div>

          {isRouteActive && (
            <div className="mb-2" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.625rem', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', background: 'rgba(0,255,157,0.10)', border: '1px solid rgba(0,255,157,0.3)', color: '#00ff9d' }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#00ff9d', display: 'inline-block' }} />
              ACTIVE ROUTE
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <span className="flex items-center gap-1.5" style={{ fontSize: '0.8125rem', color: '#e2e8f0' }}>
              <Cloud size={14} style={{ color: '#00ff9d', flexShrink: 0 }} />
              {location.cloudPct ?? '--'}% cloud cover
            </span>
            {driveInfo ? (
              <>
                <span className="flex items-center gap-1.5" style={{ fontSize: '0.8125rem', color: '#e2e8f0' }}>
                  <Car size={14} style={{ color: '#00ff9d', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                    {driveInfo.distanceKm} km
                  </span>
                  <span style={{ color: '#94a3b8' }}>away</span>
                </span>
                <span className="flex items-center gap-1.5" style={{ fontSize: '0.8125rem', color: '#e2e8f0' }}>
                  <Clock size={14} style={{ color: '#00ff9d', flexShrink: 0 }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums' }}>
                    {driveInfo.durationMin} min
                  </span>
                  <span style={{ color: '#94a3b8' }}>drive</span>
                </span>
                <span className="flex items-center gap-1.5" style={{ fontSize: '0.8125rem', color: '#e2e8f0' }}>
                  <Calendar size={14} style={{ color: '#00ff9d', flexShrink: 0 }} />
                  Leave by{' '}
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', color: '#ffffff', fontWeight: 600 }}>
                    {driveInfo.leaveBy}
                  </span>
                </span>
              </>
            ) : hasToken ? (
              <span style={{ fontSize: '0.8125rem', fontStyle: 'italic', color: '#475569' }}>Fetching route…</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Show Route button */}
      {hasToken && (
        <button
          onClick={handleShowRoute}
          disabled={routeLoading || isRouteActive}
          className={`mt-3 flex items-center justify-center gap-2 w-full font-bold transition-transform${isTop && !isRouteActive && !routeLoading ? ' route-btn-breathe' : ''}`}
          style={{
            background:    isRouteActive ? 'rgba(0,255,157,0.08)' : '#00ff9d',
            border:        isRouteActive ? '1px solid rgba(0,255,157,0.35)' : '1px solid transparent',
            color:         isRouteActive ? '#00ff9d' : '#0a0d14',
            cursor:        isRouteActive ? 'default' : 'pointer',
            letterSpacing: '0.06em',
            fontSize:      '0.75rem',
            borderRadius:  6,
            minHeight:     '36px',
            padding:       '8px 14px',
          }}
          onMouseEnter={e => { if (!isRouteActive && !routeLoading) e.currentTarget.style.background = '#33ffb2'; }}
          onMouseLeave={e => { if (!isRouteActive) e.currentTarget.style.background = '#00ff9d'; }}
        >
          {isRouteActive ? (
            <><CheckCircle size={13} /> ROUTE ACTIVE ✓</>
          ) : routeLoading ? (
            <>
              <span style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#0a0d14', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Loading…
            </>
          ) : (
            <><Navigation size={13} /> SHOW ROUTE →</>
          )}
        </button>
      )}
    </div>
  );
}
