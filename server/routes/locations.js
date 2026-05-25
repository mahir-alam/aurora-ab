const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const locations = require('../data/locations.json');
const { getCurrentKP } = require('../services/noaaService');
const { getCloudCover } = require('../services/weatherService');
const { getMoonIllumination } = require('../services/moonService');
const { calculateScore, getScoreColor, getScoreHex, getScoreLabel } = require('../services/scoreService');
const SearchSession = require('../models/SearchSession');

router.get('/', async (req, res) => {
  try {
    const userLat = parseFloat(req.query.lat) || 51.0447;
    const userLng = parseFloat(req.query.lng) || -114.0719;
    const userLocation = req.query.location || 'Calgary, AB';

    const [kp, moon] = await Promise.all([
      getCurrentKP(),
      Promise.resolve(getMoonIllumination()),
    ]);

    const enriched = await Promise.all(
      locations.map(async (loc) => {
        const cloudPct = await getCloudCover(loc.lat, loc.lng).catch(() => 50);
        const score = calculateScore(kp, cloudPct, moon.pct);
        return {
          ...loc,
          cloudPct,
          score,
          scoreColor: getScoreColor(score),
          scoreHex: getScoreHex(score),
          scoreLabel: getScoreLabel(score),
          kp,
        };
      })
    );

    enriched.sort((a, b) => b.score - a.score);
    const topLocation = enriched[0]?.name || 'Jasper National Park';

    // Best-effort session log — silently fails if MongoDB is down
    if (mongoose.connection.readyState === 1) {
      SearchSession.create({
        userLocation,
        userLat,
        userLng,
        kpAtSearch: kp,
        topLocation,
        viewingScore: enriched[0]?.score || 0,
      }).catch(() => {});
    }

    res.json({ locations: enriched, kp, moon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
