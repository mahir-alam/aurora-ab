const express = require('express');
const router = express.Router();
const axios = require('axios');

// Returns current date/time components in Mountain Time plus the UTC offset.
function getMtnComponents(now) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Edmonton',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(now).reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});

  const mtnYear  = parseInt(parts.year,  10);
  const mtnMonth = parseInt(parts.month, 10) - 1; // 0-indexed for Date.UTC
  const mtnDay   = parseInt(parts.day,   10);
  const mtnHour  = parseInt(parts.hour,  10) % 24; // guard against rare Intl "24" for midnight

  // MT = UTC + offsetHours, so offsetHours is negative (MDT = −6, MST = −7)
  const utcHour = now.getUTCHours();
  let offsetHours = mtnHour - utcHour;
  if (offsetHours >  12) offsetHours -= 24;
  if (offsetHours < -12) offsetHours += 24;

  return { mtnYear, mtnMonth, mtnDay, mtnHour, offsetHours };
}

// Convert a Mountain Time calendar point (year, month, day, hour) to a UTC Date.
// UTC = MT − offsetHours. Date.UTC handles hour overflow (e.g. hour 29 → +1 day, hour 5).
function mtnToUtc(year, month, day, hour, offsetHours) {
  return new Date(Date.UTC(year, month, day, hour - offsetHours, 0, 0));
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

    const now = new Date();
    const { mtnYear, mtnMonth, mtnDay, mtnHour, offsetHours } = getMtnComponents(now);

    // Tonight's aurora window: 11 PM MT (current calendar day) → 1 AM MT (next calendar day)
    const peakStart = mtnToUtc(mtnYear, mtnMonth, mtnDay,     23, offsetHours);
    const peakEnd   = mtnToUtc(mtnYear, mtnMonth, mtnDay + 1,  1, offsetHours);

    // Planned departure: arrive at peak start with 15-min buffer
    const leaveBy = new Date(peakStart.getTime() - (durationMin + 15) * 60 * 1000);

    const fmtTime = (d) => d.toLocaleTimeString('en-CA', {
      hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'America/Edmonton',
    });

    let leaveByStr;

    // 12:00–12:59 AM MT: tail of last night's window (11 PM–1 AM) may still be active
    if (mtnHour === 0) {
      const lastNightEnd = mtnToUtc(mtnYear, mtnMonth, mtnDay, 1, offsetHours); // 1 AM MT today
      if (now < lastNightEnd) {
        return res.json({ durationMin, distanceKm, leaveBy: 'Leave Now', geometry: route.geometry });
      }
    }

    if (now < leaveBy) {
      // Enough lead time — show the planned departure time
      leaveByStr = fmtTime(leaveBy);
    } else if (now < peakEnd) {
      // Past the departure window but aurora peak is active or imminent (11 PM–1 AM MT)
      leaveByStr = 'Leave Now';
    } else {
      // Past tonight's full window — calculate for tomorrow night's peak
      const tomorrowPeakStart = mtnToUtc(mtnYear, mtnMonth, mtnDay + 1, 23, offsetHours);
      const tomorrowLeaveBy   = new Date(tomorrowPeakStart.getTime() - (durationMin + 15) * 60 * 1000);
      leaveByStr = fmtTime(tomorrowLeaveBy) + ' (tomorrow)';
    }

    res.json({ durationMin, distanceKm, leaveBy: leaveByStr, geometry: route.geometry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
