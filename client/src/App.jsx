import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import MapView from './components/MapView';
import LocationCard from './components/LocationCard';
import ForecastCalendar from './components/ForecastCalendar';
import AIExplanation from './components/AIExplanation';
import SearchBar from './components/SearchBar';
import StatsRow from './components/StatsRow';
import Footer from './components/Footer';
import HistoricalChart from './components/HistoricalChart';

const CALGARY = { lat: 51.0447, lng: -114.0719, label: 'Calgary, AB' };
const API_BASE = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [userLocation, setUserLocation] = useState(CALGARY);
  const [locations, setLocations]       = useState([]);
  const [forecast, setForecast]         = useState([]);
  const [kp, setKp]                     = useState(null);
  const [moon, setMoon]                 = useState(null);
  const [aiText, setAiText]             = useState('');
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [selected, setSelected]         = useState(null);
  const [activeRoute, setActiveRoute]   = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [history, setHistory]           = useState([]);
  const [histLoading, setHistLoading]   = useState(true);

  const fetchData = useCallback(async (loc) => {
    setLoading(true);
    setError(null);
    setActiveRoute(null);
    try {
      const [locRes, forecastRes] = await Promise.all([
        axios.get(`${API_BASE}/api/locations?lat=${loc.lat}&lng=${loc.lng}&location=${encodeURIComponent(loc.label)}`),
        axios.get(`${API_BASE}/api/aurora/forecast`),
      ]);

      const { locations: locs, kp: currentKp, moon: moonData } = locRes.data;
      setLocations(locs);
      setForecast(forecastRes.data);
      setKp(currentKp);
      setMoon(moonData);
      setLastUpdated(new Date());

      if (locs.length > 0) {
        const top = locs[0];
        axios.post(`${API_BASE}/api/ai/explain`, {
          kp: currentKp,
          cloudCover: top.cloudPct,
          moonPct: moonData?.pct || 0,
          topLocation: top.name,
          viewingScore: top.score,
        })
          .then(r => setAiText(r.data.explanation))
          .catch(() => setAiText(null));
      }
    } catch (err) {
      setError('Failed to load aurora data. Please check your API keys in server/.env');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setHistLoading(true);
    axios.get(`${API_BASE}/api/aurora/history`)
      .then(r => setHistory(r.data))
      .catch(() => setHistory([]))
      .finally(() => setHistLoading(false));
  }, []);

  useEffect(() => {
    fetchData(CALGARY);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: 'My Location' };
          setUserLocation(loc);
          fetchData(loc);
        },
        () => {},
        { timeout: 8000 }
      );
    }
  }, [fetchData]);

  const handleSearch = (loc) => {
    setUserLocation(loc);
    fetchData(loc);
  };

  const handleShowRoute = (location, driveInfo) => {
    setActiveRoute({
      locationId: location.id,
      destination: location,
      geometry: driveInfo.geometry,
      driveInfo,
    });
    setSelected(location);
  };

  const handleClearRoute = () => setActiveRoute(null);

  const handleRefresh = useCallback(() => {
    fetchData(userLocation);
  }, [fetchData, userLocation]);

  const tonightForecast = forecast[0] || null;
  const topLocation     = locations[0] || null;

  return (
    <div className="min-h-screen" style={{ background: '#0a0d14', position: 'relative' }}>
      <div className="aurora-ambient" />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Header kp={kp} tonightForecast={tonightForecast} loading={loading} />

        <main className="max-w-7xl mx-auto px-4 py-5 space-y-4">
          <SearchBar onSearch={handleSearch} defaultValue={CALGARY.label} />

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: '#1a0808', border: '1px solid #7f1d1d' }}>
              {error}
            </div>
          )}

          <StatsRow kp={kp} moon={moon} topLocation={topLocation} loading={loading} lastUpdated={lastUpdated} onRefresh={handleRefresh} />
          <AIExplanation explanation={aiText} loading={loading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ height: '520px' }}>
              <MapView
                locations={locations}
                userLocation={userLocation}
                selected={selected}
                onSelect={setSelected}
                activeRoute={activeRoute}
                onClearRoute={handleClearRoute}
              />
            </div>

            <div className="space-y-3 overflow-y-auto pr-0.5" style={{ maxHeight: '520px' }}>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-2xl animate-pulse"
                      style={{ height: i === 0 ? 140 : 110, background: '#111827' }} />
                  ))
                : locations.map((loc, idx) => (
                    <LocationCard
                      key={loc.id}
                      location={loc}
                      userLocation={userLocation}
                      isTop={idx === 0}
                      isSelected={selected?.id === loc.id}
                      isRouteActive={activeRoute?.locationId === loc.id}
                      onShowRoute={handleShowRoute}
                      onClick={() => setSelected(loc)}
                    />
                  ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <HistoricalChart history={history} loading={histLoading} />
            <ForecastCalendar forecast={forecast} loading={loading} />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}