// score = (KP/9 * 100 * 0.5) + ((100 - cloudPct) * 0.3) + ((100 - moonPct) * 0.2)
// Range: 0–100

function calculateScore(kp, cloudPct, moonPct) {
  const kpComponent    = (Math.min(9, Math.max(0, kp)) / 9) * 100 * 0.5;
  const cloudComponent = (100 - Math.min(100, Math.max(0, cloudPct))) * 0.3;
  const moonComponent  = (100 - Math.min(100, Math.max(0, moonPct))) * 0.2;
  const raw = kpComponent + cloudComponent + moonComponent;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 40) return 'yellow';
  return 'red';
}

function getScoreHex(score) {
  if (score >= 70) return '#00ff88';
  if (score >= 40) return '#fbbf24';
  return '#ef4444';
}

function getScoreLabel(score) {
  if (score >= 70) return 'Excellent';
  if (score >= 40) return 'Moderate';
  return 'Poor';
}

module.exports = { calculateScore, getScoreColor, getScoreHex, getScoreLabel };
