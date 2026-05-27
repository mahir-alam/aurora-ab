const express = require('express');
const router = express.Router();
const axios = require('axios');

// Returns a Date object for the next upcoming 11 PM Mountain Time peak start.
// Works correctly regardless of server timezone (UTC on Vercel).
function getMtnPeakStart(now) {
  // Get current date/time components in Mountain Time (handles MDT/MST automatically)
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Edmonton',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});

  const mtnYear  = parseInt(parts.year,  10);
  const mtnMonth = parseInt(parts.month, 10) - 1; // 0-indexed for Date.UTC
  const mtnDay   = parseInt(parts.day,   10);
  const mtnHour  = parseInt(parts.hour,  10) % 24; // guard against rare Intl "24" for midnight

  // Derive current MT UTC offset (−6 MDT or −7 MST) by comparing MT hour to UTC hour
  const utcHour = now.getUTCHours();
  let offsetHours = mtnHour - utcHour;
  if (offsetHours >  12) offsetHours -= 24;
  if (offsetHours < -12) offsetHours += 24;

  // 11 PM MT = hour 23 MT = (23 − offsetHours) UTC on the MT calendar day.
  // Date.UTC handles overflow (e.g. hour 29 → +1 day, hour 5 UTC).
  const peakHourUTC = 23 - offsetHours;
  let peakStart = new Date(Date.UTC(mtnYear, mtnMonth, mtnDay, peakHourUTC, 0, 0));

  // If tonight's peak has already passed, target tomorrow night's peak
  if (peakStart <= now) {
    peakStart = new Date(Date.UTC(mtnYear, mtnMonth, mtnDay + 1, peakHourUTC, 0, 0));
  }

  return peakStart;
}

router.get('/', async (req, res) => {
  try {
    const { from_lat, from_lng, to_lat, to_lng } = req.query;
    const token = process.env.MAPBOX_TOKEN;
    if (!token) return res.status(500).json({ error: 'Missing MAPBOX_TOKEN' });

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${from_lng},${from_lat};${to_lng},${to_lat}?access_token=${token}&overview=full&geometries=geojson`;
    const { data } = await axios.get(url, { timeout: 8000 });

    const route = data.routes?.[0];
    if (!route) return res.status(404).json({ error: 'No route found' });

    const durationMin = Math.round(route.duration / 60);
    const distanceKm  = Math.round(route.distance / 1000);

    const now       = new Date();
    const peakStart = getMtnPeakStart(now);

    // Depart: peak start (11 PM MT) minus drive time minus 15-min setup buffer
    const leaveByMs = peakStart.getTime() - (durationMin + 15) * 60 * 1000;
    const leaveBy   = new Date(leaveByMs);

    let leaveByStr;
    if (leaveBy <= now) {
      leaveByStr = 'Leave Now';
    } else {
      leaveByStr = leaveBy.toLocaleTimeString('en-CA', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Edmonton',
      });
    }

    res.json({ durationMin, distanceKm, leaveBy: leaveByStr, geometry: route.geometry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
