import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { X, Car, Clock, MapPin, ExternalLink } from 'lucide-react';

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';
mapboxgl.accessToken = TOKEN;

const ALBERTA_CENTER = [-114.5, 53.5];
const ALBERTA_ZOOM   = 5.2;
const ROUTE_SRC      = 'aurora-route';
const ROUTE_GLOW_ID  = 'aurora-route-glow';
const ROUTE_LINE_ID  = 'aurora-route-line';

const MAP_STYLES = [
  { id: 'dark-v11',               label: '🌙', title: 'Dark' },
  { id: 'streets-v12',            label: '☀️', title: 'Light' },
  { id: 'satellite-streets-v12',  label: '🛰️', title: 'Satellite' },
];

function scoreToHex(score) {
  if (score >= 70) return '#00b87a';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

// ── Module-level helpers so style.load handler can call them without closure issues ──
function addRouteToMap(map, geometry, immediate = false) {
  if (map.getSource(ROUTE_SRC)) return; // already present

  map.addSource(ROUTE_SRC, {
    type: 'geojson',
    lineMetrics: true,
    data: { type: 'Feature', properties: {}, geometry },
  });

  map.addLayer({
    id: ROUTE_GLOW_ID,
    type: 'line',
    source: ROUTE_SRC,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-width': 14,
      'line-color': '#00ff88',
      'line-opacity': 0.10,
      'line-blur': 4,
      'line-trim-offset': immediate ? [0, 0] : [0, 1],
    },
  });

  map.addLayer({
    id: ROUTE_LINE_ID,
    type: 'line',
    source: ROUTE_SRC,
    layout: { 'line-join': 'round', 'line-cap': 'round' },
    paint: {
      'line-width': 4,
      'line-gradient': [
        'interpolate', ['linear'], ['line-progress'],
        0, '#00ff88',
        1, '#8b5cf6',
      ],
      'line-trim-offset': immediate ? [0, 0] : [0, 1],
    },
  });
}

function removeRouteFromMap(map) {
  [ROUTE_LINE_ID, ROUTE_GLOW_ID].forEach(id => {
    if (map.getLayer(id)) map.removeLayer(id);
  });
  if (map.getSource(ROUTE_SRC)) map.removeSource(ROUTE_SRC);
}

// ── Map style toggle pill ──────────────────────────────────────────────────────
function StyleToggle({ mapStyle, onStyleChange }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        zIndex: 10,
        display: 'flex',
        background: 'rgba(36,41,56,0.96)',
        backdropFilter: 'blur(14px)',
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {MAP_STYLES.map((s, i) => {
        const active = mapStyle === s.id;
        return (
          <button
            key={s.id}
            title={s.title}
            onClick={() => onStyleChange(s.id)}
            style={{
              padding: '5px 10px',
              fontSize: 15,
              lineHeight: 1,
              cursor: active ? 'default' : 'pointer',
              background: active ? 'rgba(0,184,122,0.15)' : 'transparent',
              border: 'none',
              borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              outline: active ? '1px solid rgba(0,184,122,0.4)' : 'none',
              outlineOffset: '-1px',
              color: 'white',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Route info panel ──────────────────────────────────────────────────────────
function RoutePanel({ activeRoute, onClear }) {
  const { destination, driveInfo } = activeRoute;
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&travelmode=driving`;
  const isMobile = window.innerWidth < 640;

  return (
    <div
      style={{
        position: 'absolute',
        zIndex: 10,
        background: 'rgba(36,41,56,0.97)',
        backdropFilter: 'blur(18px)',
        borderRadius: 14,
        border: '1px solid rgba(0,184,122,0.28)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 24px rgba(0,184,122,0.08)',
        padding: '12px 14px',
        ...(isMobile
          ? { bottom: 12, left: 12, right: 12 }
          : { top: 12, left: 12, width: 290 }
        ),
      }}
    >
      {/* Row 1: destination name + close button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: '#00ff88', boxShadow: '0 0 7px #00ff88',
        }} />
        <span style={{
          flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: 'white',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {destination.name}
        </span>
        <button
          onClick={onClear}
          title="Clear route"
          style={{
            flexShrink: 0, width: 26, height: 26, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#2e3549', border: '1px solid rgba(255,255,255,0.1)',
            color: '#9ca3af', cursor: 'pointer', transition: 'color 0.15s, background 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#3a2020'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = '#2e3549'; }}
        >
          <X size={13} />
        </button>
      </div>

      {/* Row 2: drive stats */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px', marginBottom: 10 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
          <Car size={11} style={{ color: '#00ff88' }} />
          {driveInfo.durationMin} min &nbsp;·&nbsp; {driveInfo.distanceKm} km
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#9ca3af' }}>
          <Clock size={11} style={{ color: '#fbbf24' }} />
          Leave by {driveInfo.leaveBy}
        </span>
      </div>

      {/* Row 3: Open in Google Maps — prominent button */}
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          width: '100%',
          padding: '7px 12px',
          borderRadius: 10,
          background: '#2e3549',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#e5e7eb',
          fontSize: 12,
          fontWeight: 600,
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'background 0.15s, border-color 0.15s',
          letterSpacing: '0.01em',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background  = '#3a4460';
          e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background  = '#2e3549';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
        }}
      >
        <ExternalLink size={13} style={{ flexShrink: 0 }} />
        Open in Google Maps
      </a>
    </div>
  );
}

// ── Main MapView ──────────────────────────────────────────────────────────────
export default function MapView({ locations, userLocation, selected, onSelect, activeRoute, onClearRoute }) {
  const containerRef   = useRef(null);
  const mapRef         = useRef(null);
  const markersRef     = useRef({});       // { [locationId]: { marker, el } }
  const startMarkerRef = useRef(null);
  const animFrameRef   = useRef(null);
  const activeRouteRef = useRef(null);     // mirrors activeRoute for style.load handler
  const initialLoadRef = useRef(false);    // true after first 'load' event

  const [ready,    setReady]    = useState(false);
  const [mapStyle, setMapStyle] = useState('streets-v12');

  // Keep activeRouteRef in sync — style.load handler reads from this
  useEffect(() => { activeRouteRef.current = activeRoute; }, [activeRoute]);

  // ── Init map ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current || !TOKEN || TOKEN === 'your_mapbox_token_here') return;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: `mapbox://styles/mapbox/streets-v12`,
      center: ALBERTA_CENTER,
      zoom: ALBERTA_ZOOM,
    });
    mapRef.current = map;

    // Nav controls at bottom-right so top-right is free for style toggle
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    map.on('load', () => {
      initialLoadRef.current = true;
      setReady(true);
    });

    // After each style switch, re-add route layers without animation
    map.on('style.load', () => {
      if (!initialLoadRef.current) return; // skip the very first load
      const route = activeRouteRef.current;
      if (route) {
        addRouteToMap(map, route.geometry, true /* immediate */);
      }
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Style toggle handler ──────────────────────────────────────────────────
  const handleStyleChange = (newStyle) => {
    if (!mapRef.current || newStyle === mapStyle) return;
    setMapStyle(newStyle);
    // setStyle fires style.load → route re-added there automatically
    mapRef.current.setStyle(`mapbox://styles/mapbox/${newStyle}`);
  };

  // ── Draw location markers ─────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !mapRef.current || !locations.length) return;

    Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
    markersRef.current = {};

    locations.forEach((loc) => {
      const hex = scoreToHex(loc.score || 0);

      const el = document.createElement('div');
      el.dataset.locId = loc.id;
      el.style.cssText = `
        width:32px; height:32px; border-radius:50%;
        background:${hex}; border:3px solid rgba(255,255,255,0.85);
        cursor:pointer; display:flex; align-items:center; justify-content:center;
        font-size:11px; font-weight:700; color:white;
        box-shadow:0 2px 8px rgba(0,0,0,0.4), 0 0 10px ${hex}55;
        transition:transform .15s, box-shadow .15s;
        user-select:none;
      `;
      el.textContent = loc.score ?? '?';

      el.addEventListener('mouseenter', () => {
        if (!el.dataset.pulsing) {
          el.style.transform = 'scale(1.22)';
          el.style.boxShadow = `0 4px 14px rgba(0,0,0,0.5), 0 0 18px ${hex}80`;
        }
      });
      el.addEventListener('mouseleave', () => {
        if (!el.dataset.pulsing) {
          el.style.transform = 'scale(1)';
          el.style.boxShadow = `0 2px 8px rgba(0,0,0,0.4), 0 0 10px ${hex}55`;
        }
      });

      const popup = new mapboxgl.Popup({ offset: 22, closeButton: false, maxWidth: '220px' })
        .setHTML(`
          <div style="font-family:'Inter',system-ui,sans-serif">
            <div style="font-weight:600;font-size:13px;color:#fff;margin-bottom:3px">${loc.name}</div>
            <div style="font-size:12px;color:${hex};font-weight:600">${loc.scoreLabel} · ${loc.score}/100</div>
            <div style="font-size:11px;color:#9ca3af;margin-top:2px">☁️ ${loc.cloudPct ?? '--'}% cloud cover</div>
          </div>
        `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(mapRef.current);

      el.addEventListener('click', () => {
        onSelect(loc);
        mapRef.current.flyTo({ center: [loc.lng, loc.lat], zoom: 8, speed: 1.4 });
      });

      markersRef.current[loc.id] = { marker, el };
    });
  }, [ready, locations, onSelect]);

  // ── Fly to selected (only when no route active) ───────────────────────────
  useEffect(() => {
    if (!ready || !selected || !mapRef.current || activeRoute) return;
    mapRef.current.flyTo({ center: [selected.lng, selected.lat], zoom: 8, speed: 1.4 });
  }, [ready, selected, activeRoute]);

  // ── Route: draw / clear ───────────────────────────────────────────────────
  useEffect(() => {
    if (!ready || !mapRef.current) return;

    const map = mapRef.current;

    // Clear previous state
    cancelAnimationFrame(animFrameRef.current);
    removeRouteFromMap(map);
    startMarkerRef.current?.remove();
    startMarkerRef.current = null;
    Object.values(markersRef.current).forEach(({ el }) => {
      el.dataset.pulsing = '';
      el.style.animation = '';
      el.style.transform = 'scale(1)';
    });

    if (!activeRoute) {
      map.flyTo({ center: ALBERTA_CENTER, zoom: ALBERTA_ZOOM, speed: 1.2 });
      return;
    }

    const { geometry, destination, driveInfo } = activeRoute;

    // Add source + layers (starts with trim-offset [0,1] = invisible)
    addRouteToMap(map, geometry, false);

    // Animate line draw — ease-out cubic over 1.1 s
    let animStart = null;
    const ANIM_MS = 1100;

    function animate(ts) {
      if (!animStart) animStart = ts;
      const raw = Math.min((ts - animStart) / ANIM_MS, 1);
      const t   = 1 - Math.pow(1 - raw, 3);

      if (map.getLayer(ROUTE_LINE_ID)) {
        map.setPaintProperty(ROUTE_LINE_ID, 'line-trim-offset', [0, 1 - t]);
        map.setPaintProperty(ROUTE_GLOW_ID, 'line-trim-offset', [0, 1 - t]);
      }
      if (raw < 1) animFrameRef.current = requestAnimationFrame(animate);
    }
    animFrameRef.current = requestAnimationFrame(animate);

    // Start location marker
    const startEl = document.createElement('div');
    startEl.style.cssText = `
      width:18px; height:18px; border-radius:50%;
      background:radial-gradient(circle at 40% 35%, #00ff88, #00aa55);
      border:2.5px solid white;
      box-shadow:0 0 10px #00ff8899, 0 0 20px #00ff8844;
    `;
    startMarkerRef.current = new mapboxgl.Marker({ element: startEl })
      .setLngLat([userLocation.lng, userLocation.lat])
      .addTo(map);

    // Pulse destination marker
    const destEntry = markersRef.current[destination.id];
    if (destEntry) {
      const { el, marker } = destEntry;
      const hex = scoreToHex(destination.score || 0);
      el.dataset.pulsing = 'true';
      el.style.animation = 'dest-pulse 1.5s ease-in-out infinite';

      if (!document.getElementById('dest-pulse-kf')) {
        const styleTag = document.createElement('style');
        styleTag.id = 'dest-pulse-kf';
        styleTag.textContent = `
          @keyframes dest-pulse {
            0%,100% { transform:scale(1);   box-shadow:0 0 14px ${hex}55; }
            50%      { transform:scale(1.35); box-shadow:0 0 30px ${hex}cc, 0 0 50px ${hex}55; }
          }
        `;
        document.head.appendChild(styleTag);
      }

      marker.togglePopup();
    }

    // Fit bounds
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend([userLocation.lng, userLocation.lat]);
    geometry.coordinates.forEach(c => bounds.extend(c));
    map.fitBounds(bounds, {
      padding: { top: 90, bottom: 70, left: 60, right: 60 },
      speed: 1.3,
      maxZoom: 10,
    });

  }, [ready, activeRoute, userLocation]);

  const noToken = !TOKEN || TOKEN === 'your_mapbox_token_here';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Style toggle — top-right, nav controls are bottom-right */}
      {!noToken && (
        <StyleToggle mapStyle={mapStyle} onStyleChange={handleStyleChange} />
      )}

      {/* Route info panel */}
      {activeRoute && ready && (
        <RoutePanel activeRoute={activeRoute} onClear={onClearRoute} />
      )}

      {/* No-token placeholder */}
      {noToken && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#242938', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.12)',
        }}>
          <MapPin size={36} style={{ color: '#374151' }} />
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 12, textAlign: 'center', padding: '0 24px' }}>
            Map requires a Mapbox token.
          </p>
          <p style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>
            Add <code style={{ color: '#8b5cf6' }}>VITE_MAPBOX_TOKEN</code> to{' '}
            <code style={{ color: '#8b5cf6' }}>client/.env</code>
          </p>
        </div>
      )}
    </div>
  );
}
