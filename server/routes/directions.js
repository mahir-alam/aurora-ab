const express = require('express');
const router = express.Router();
const axios = require('axios');

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

    // Target arrival: 10 PM local (Edmonton/Mountain time)
    const now = new Date();
    const targetArrival = new Date();
    targetArrival.setHours(22, 0, 0, 0);
    if (targetArrival <= now) targetArrival.setDate(targetArrival.getDate() + 1);

    const leaveByMs = targetArrival.getTime() - durationMin * 60 * 1000;
    const leaveBy = new Date(leaveByMs);

    let leaveByStr;
    if (leaveBy <= now) {
      leaveByStr = 'Leave Now';
    } else {
      leaveByStr = leaveBy.toLocaleTimeString('en-CA', {
        hour: '2-digit',
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
