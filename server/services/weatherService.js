const axios = require('axios');

async function getCloudCover(lat, lng) {
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) throw new Error('Missing OPENWEATHER_API_KEY');

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${key}`;
  const { data } = await axios.get(url, { timeout: 8000 });

  const cloudPct = data?.clouds?.all ?? 50;
  return Math.min(100, Math.max(0, cloudPct));
}

module.exports = { getCloudCover };
