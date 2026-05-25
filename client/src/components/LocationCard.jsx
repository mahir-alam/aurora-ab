import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Cloud, Car, Clock, Navigation, CheckCircle } from 'lucide-react';

const CARD_BG      = '#242938';
const CARD_BORDER  = 'rgba(139, 92, 246, 0.12)';

function getStyle(score) {
  if (score >= 70) return {
    solid: '#00b87a',
    glow:  'rgba(0, 184, 122, 0.38)',
    hex:   '#00b87a',
    leftBorder:  '#00b87a',
    tintBorder:  'rgba(0, 184, 122, 0.28)',
  };
  if (score >= 40) return {
    solid: '#f59e0b',
    glow:  'rgba(245, 158, 11, 0.38)',
    hex:   '#f59e0b',
    leftBorder:  '#f59e0b',
    tintBorder:  'rgba(245, 158, 11, 0.28)',
  };
  return {
    solid: '#ef4444',
    glow:  'rgba(239, 68, 68, 0.38)',
    hex:   '#ef4444',
    leftBorder:  '#ef4444',
    tintBorder:  'rgba(239, 68, 68, 0.28)',
  };
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

  // Card styling
  const cardBg = isRouteActive ? '#1a2c24'
    : isSelected ? '#272040'
    : CARD_BG;

  const borderStyleObj = isRouteActive
    ? { border: '1px solid rgba(0, 184, 122, 0.45)' }
    : isSelected
    ? { border: '1px solid rgba(139, 92, 246, 0.42)' }
    : isTop
    ? {
        borderTop:    `1px solid ${s.tintBorder}`,
        borderRight:  `1px solid ${CARD_BORDER}`,
        borderBottom: `1px solid ${CARD_BORDER}`,
        borderLeft:   `4px solid ${s.leftBorder}`,
      }
    : { border: `1px solid ${CARD_BORDER}` };

  const shadowVal = isRouteActive
    ? '0 0 0 2px rgba(0,184,122,0.18), 0 4px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
    : isSelected
    ? '0 0 0 2px rgba(139,92,246,0.18), 0 8px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)'
    : isTop
    ? undefined  // CSS animation card-best-pulse controls this
    : '0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)';

  // isTop left border is 4px vs 1px on others — compensate padding so content aligns
  const pad = isTop ? '14px 14px 14px 10px' : '12px';

  return (
    <div
      onClick={onClick}
      className={`card-lift rounded-xl cursor-pointer${isTop && !isRouteActive && !isSelected ? ' card-best-pulse' : ''}`}
      style={{
        background: cardBg,
        ...borderStyleObj,
        boxShadow: shadowVal,
        padding: pad,
        '--best-glow':     s.glow,
        '--best-glow-dim': `${s.hex}22`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Score badge */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full"
          style={{
            width:  isTop ? 60 : 50,
            height: isTop ? 60 : 50,
            background: s.solid,
            border: '3px solid rgba(255, 255, 255, 0.85)',
            boxShadow: `0 0 16px ${s.glow}, 0 2px 8px rgba(0,0,0,0.35)`,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: isTop ? 20 : 16, fontWeight: 700, color: 'white' }}>
            {location.score}
          </span>
        </div>

        {/* Info column */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-start gap-2">
            <h3
              className="flex-1 min-w-0 truncate leading-tight"
              style={{ fontSize: isTop ? '1.0625rem' : '0.9375rem', fontWeight: 600, color: '#ffffff', paddingTop: '1px' }}
            >
              {location.name}
            </h3>

            {isRouteActive && (
              <div className="flex-shrink-0 flex items-center gap-1 whitespace-nowrap"
                style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', background: 'rgba(0,184,122,0.15)', border: '1px solid rgba(0,184,122,0.4)', color: '#00b87a', letterSpacing: '0.06em' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#00b87a', display: 'inline-block', boxShadow: '0 0 4px #00b87a' }} />
                ACTIVE
              </div>
            )}

            {isTop && !isRouteActive && (
              <div className="flex-shrink-0 whitespace-nowrap"
                style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '9999px', background: `${s.hex}1e`, border: `1px solid ${s.hex}45`, color: s.hex, letterSpacing: '0.06em' }}>
                BEST
              </div>
            )}
          </div>

          {/* Type */}
          <div style={{ fontSize: '0.625rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#8b5cf6', marginTop: '2px' }}>
            {location.type}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
            <span className="flex items-center gap-1" style={{ fontSize: '11px', color: '#9ca3af' }}>
              <Cloud size={10} style={{ color: '#60a5fa' }} />
              {location.cloudPct ?? '--'}% cloud
            </span>
            {driveInfo ? (
              <>
                <span className="flex items-center gap-1" style={{ fontSize: '11px', color: '#9ca3af' }}>
                  <Car size={10} style={{ color: '#00b87a' }} />
                  {driveInfo.durationMin}min · {driveInfo.distanceKm}km
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: '11px', color: '#9ca3af' }}>
                  <Clock size={10} style={{ color: '#f59e0b' }} />
                  Leave {driveInfo.leaveBy}
                </span>
              </>
            ) : hasToken ? (
              <span style={{ fontSize: '10px', fontStyle: 'italic', color: '#6b7280' }}>Fetching route…</span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Show Route button */}
      {hasToken && (
        <button
          onClick={handleShowRoute}
          disabled={routeLoading || isRouteActive}
          className="mt-2.5 flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
          style={{
            background:    isRouteActive ? 'rgba(0,184,122,0.12)' : '#8b5cf6',
            border:        isRouteActive ? '1px solid rgba(0,184,122,0.35)' : '1px solid transparent',
            color:         isRouteActive ? '#00b87a' : 'white',
            cursor:        isRouteActive ? 'default' : 'pointer',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => { if (!isRouteActive && !routeLoading) e.currentTarget.style.background = '#7c3aed'; }}
          onMouseLeave={e => { if (!isRouteActive)                  e.currentTarget.style.background = isRouteActive ? 'rgba(0,184,122,0.12)' : '#8b5cf6'; }}
        >
          {isRouteActive ? (
            <><CheckCircle size={11} /> Active Route</>
          ) : routeLoading ? (
            <>
              <span style={{ width: 9, height: 9, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.4)', borderTopColor: 'white', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Loading…
            </>
          ) : (
            <><Navigation size={11} /> Show Route</>
          )}
        </button>
      )}
    </div>
  );
}
