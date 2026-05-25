const SunCalc = require('suncalc');

function getMoonIllumination() {
  const data = SunCalc.getMoonIllumination(new Date());
  return {
    fraction: data.fraction,          // 0 (new) to 1 (full)
    pct: Math.round(data.fraction * 100),
    phase: data.phase,                // 0–1 cycle
    angle: data.angle,
  };
}

module.exports = { getMoonIllumination };
