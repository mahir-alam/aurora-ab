import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Search, MapPin } from 'lucide-react';

export default function SearchBar({ onSearch, defaultValue }) {
  const [query,       setQuery]       = useState(defaultValue || '');
  const [suggestions, setSuggestions] = useState([]);
  const [open,        setOpen]        = useState(false);
  const [focused,     setFocused]     = useState(false);
  const debounce = useRef(null);
  const token    = import.meta.env.VITE_MAPBOX_TOKEN;

  const fetchSuggestions = async (q) => {
    if (!q || q.length < 2 || !token || token === 'your_mapbox_token_here') return;
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?country=ca&proximity=-114.0719,51.0447&access_token=${token}&types=place,region,district,locality&limit=5`;
      const { data } = await axios.get(url);
      setSuggestions(data.features || []);
      setOpen(true);
    } catch (_) {}
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => fetchSuggestions(val), 280);
  };

  const handleSelect = (feature) => {
    const [lng, lat] = feature.center;
    onSearch({ lat, lng, label: feature.place_name });
    setQuery(feature.place_name);
    setSuggestions([]);
    setOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (suggestions.length > 0) handleSelect(suggestions[0]);
    setOpen(false);
  };

  return (
    <div className="relative" style={{ maxWidth: '420px' }}>
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search size={15} className="absolute left-3.5 pointer-events-none" style={{ color: '#334155' }} />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => { setFocused(true); if (suggestions.length > 0) setOpen(true); }}
            onBlur={() => { setFocused(false); setTimeout(() => setOpen(false), 160); }}
            placeholder="Search your city in Alberta…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
            style={{
              background:  '#131722',
              border:      `1px solid ${focused ? '#00ff9d' : '#1e2638'}`,
              color:       '#f1f5f9',
            }}
          />
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-xl overflow-hidden shadow-xl"
          style={{ background: '#131722', border: '1px solid #1e2638' }}>
          {suggestions.map((f) => (
            <li
              key={f.id}
              onMouseDown={() => handleSelect(f)}
              className="flex items-center gap-2.5 px-4 py-2.5 cursor-pointer"
              style={{ fontSize: '0.9375rem', color: '#f1f5f9', transition: 'background 0.1s', borderBottom: '1px solid #1e2638' }}
              onMouseEnter={e => e.currentTarget.style.background = '#1e2638'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MapPin size={13} style={{ color: '#00ff9d', flexShrink: 0 }} />
              <span className="truncate">{f.place_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
