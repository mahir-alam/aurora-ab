const express = require('express');
const router = express.Router();
const { getCurrentKP, get3DayForecast, getHistoricalKP } = require('../services/noaaService');
const { getMoonIllumination } = require('../services/moonService');

router.get('/current', async (req, res) => {
  try {
    const [kp, moon] = await Promise.all([
      getCurrentKP(),
      Promise.resolve(getMoonIllumination()),
    ]);
    res.json({ kp, moon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/forecast', async (req, res) => {
  try {
    const forecast = await get3DayForecast();
    res.json(forecast);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await getHistoricalKP();
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
