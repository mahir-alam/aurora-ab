const OpenAI = require('openai');

let client = null;
function getClient() {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

async function getAuroraExplanation({ kp, cloudCover, moonPct, topLocation, viewingScore }) {
  const openai = getClient();

  const prompt = `You are a friendly aurora borealis expert advising stargazers in Alberta, Canada.
Current conditions:
- KP Index: ${kp} (scale 0–9; 5+ means good aurora activity)
- Cloud Cover: ${cloudCover}%
- Moon Illumination: ${moonPct}%
- Best Viewing Location Tonight: ${topLocation}
- Overall Viewing Score: ${viewingScore}/100

Write exactly 3 sentences. Sentence 1: describe what the KP level means for aurora visibility tonight. Sentence 2: comment on weather and moon conditions and how they affect the view. Sentence 3: give a specific, actionable recommendation about where to go and when to leave.`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 220,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content?.trim() || getFallback(kp, topLocation);
}

function getFallback(kp, topLocation) {
  if (kp >= 5) {
    return `With a KP of ${kp}, geomagnetic activity is elevated and auroras should be visible across Alberta tonight. Head to a dark location away from city lights for the best view. ${topLocation} is your top pick — aim to arrive before 11 PM.`;
  }
  return `Tonight's KP index of ${kp} indicates quiet geomagnetic conditions, so aurora activity will be faint. Clear skies will still let you see the Milky Way from dark sites. ${topLocation} offers the best chance if a surprise outburst occurs — keep an eye on live KP updates.`;
}

module.exports = { getAuroraExplanation };
