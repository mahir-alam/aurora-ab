const axios = require('axios');

const CURRENT_KP_URL = 'https://services.swpc.noaa.gov/json/planetary_k_index_1m.json';
const FORECAST_URL = 'https://services.swpc.noaa.gov/text/3-day-forecast.txt';

async function getCurrentKP() {
  const { data } = await axios.get(CURRENT_KP_URL, { timeout: 8000 });
  if (!Array.isArray(data) || data.length === 0) throw new Error('Empty KP response');
  const latest = data[data.length - 1];
  const kp = parseFloat(latest.kp_index ?? latest[1] ?? 0);
  return isNaN(kp) ? 0 : kp;
}

async function get3DayForecast() {
  const { data: text } = await axios.get(FORECAST_URL, { timeout: 8000 });
  return parseForecastText(text);
}

function parseForecastText(text) {
  const lines = text.split('\n');
  const headerIdx = lines.findIndex(l => l.includes('NOAA Kp index forecast'));

  if (headerIdx === -1) return getDefaultForecast();

  const dateLine = lines[headerIdx + 1] || '';
  const dateMatches = dateLine.match(/([A-Z][a-z]{2}\s+\d{1,2})/g) || [];

  const dayKp = [[], [], []];

  for (let i = 2; i <= 9; i++) {
    const line = lines[headerIdx + i] || '';
    if (!line.trim() || !line.match(/\d{2}-\d{2}UT/i)) continue;
    // Match values like 3(unsettled) or 5.33(storm)
    const vals = line.match(/(\d+(?:\.\d+)?)\([^)]+\)/g) || [];
    for (let d = 0; d < 3; d++) {
      if (vals[d]) {
        const num = parseFloat(vals[d].match(/^[\d.]+/)[0]);
        if (!isNaN(num)) dayKp[d].push(num);
      }
    }
  }

  const labels = ['Tonight', 'Tomorrow', 'Night After'];
  return labels.map((label, i) => {
    const vals = dayKp[i];
    const maxKp = vals.length ? Math.max(...vals) : 2;
    const avgKp = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 2;
    return {
      label,
      date: dateMatches[i] || `Day ${i + 1}`,
      maxKp: parseFloat(maxKp.toFixed(1)),
      avgKp: parseFloat(avgKp.toFixed(1)),
      color: maxKp >= 5 ? 'green' : maxKp >= 3 ? 'yellow' : 'red',
      level: maxKp >= 7 ? 'Storm' : maxKp >= 5 ? 'Active' : maxKp >= 3 ? 'Unsettled' : 'Quiet',
    };
  });
}

function getDefaultForecast() {
  return ['Tonight', 'Tomorrow', 'Night After'].map((label, i) => ({
    label,
    date: `Day ${i + 1}`,
    maxKp: 2,
    avgKp: 2,
    color: 'red',
    level: 'Quiet',
  }));
}

module.exports = { getCurrentKP, get3DayForecast };
