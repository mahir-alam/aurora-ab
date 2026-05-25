const express = require('express');
const router = express.Router();
const { getAuroraExplanation } = require('../services/openaiService');

router.post('/explain', async (req, res) => {
  try {
    const { kp, cloudCover, moonPct, topLocation, viewingScore } = req.body;
    const explanation = await getAuroraExplanation({ kp, cloudCover, moonPct, topLocation, viewingScore });
    res.json({ explanation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
