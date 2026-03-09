import { GoogleGenerativeAI } from '@google/generative-ai';

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
}

export async function generateHealthAdvisory(aqiData) {
  try {
    const model = getGeminiModel();

    const prompt = `Based on the following air quality data:
- Ward Name: ${aqiData.ward_name}
- PM2.5: ${aqiData.pm25} µg/m³
- PM10: ${aqiData.pm10} µg/m³
- Gas Level: ${aqiData.gas_level}
- AQI Score: ${aqiData.aqi_score}

Provide a 2-sentence health advisory for citizens. Be concise and actionable.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    const msg = error?.message || '';
    console.error('Gemini Advisory Error:', msg);

    // Return a deterministic fallback advisory based on AQI score
    const aqi = aqiData?.aqi_score ?? 0;
    if (aqi >= 300) return `🚨 AQI ${aqi} — HAZARDOUS. All outdoor activities should be completely avoided today. Keep doors and windows tightly closed. Wear an N95/KN95 mask even indoors if you have respiratory issues. Run air purifiers continuously. Elderly, children, and those with heart or lung conditions are at serious risk — seek medical attention if you experience shortness of breath or chest pain.`;
    if (aqi >= 200) return `⛔ AQI ${aqi} — VERY UNHEALTHY. Avoid any outdoor exercise or prolonged time outside. If you must go out, wear an N95 or KN95 mask at all times. Keep windows and doors closed; use an air purifier if available. Sensitive groups including children, elderly, and people with asthma or heart disease should stay indoors for the entire day.`;
    if (aqi >= 150) return `⚠️ AQI ${aqi} — UNHEALTHY. Outdoor jogging, cycling, or heavy exercise is not recommended today. If you must be outside, keep it brief and wear a mask. Sensitive groups (children, elderly, asthma/heart patients) should remain indoors. Close windows during peak traffic hours and ventilate only in the late evening when levels may drop.`;
    if (aqi >= 100) return `🟠 AQI ${aqi} — UNHEALTHY FOR SENSITIVE GROUPS. Healthy adults can do light outdoor activities, but children, elderly, and people with respiratory or heart conditions should limit outdoor time. Avoid strenuous exercise outdoors. A 3-ply surgical mask is advisable if you're staying outside for extended periods.`;
    if (aqi >= 50) return `🟡 AQI ${aqi} — MODERATE. Air quality is acceptable for most people. Unusually sensitive individuals may experience mild discomfort during prolonged outdoor activity. Consider doing heavy exercise early morning or evening when pollution levels are typically lower. No mask required for healthy adults.`;
    return `✅ AQI ${aqi} — GOOD. Air quality is excellent and poses little or no health risk. It's a great day for outdoor activities — jogging, cycling, or spending time in parks is perfectly safe. Enjoy the fresh air!`;
  }
}

export async function chatbotResponse(question, aqiContext) {
  try {
    const model = getGeminiModel();

    const prompt = `You are an AI assistant for a Smart City Air Quality Monitoring System.

Current AQI Context:
${JSON.stringify(aqiContext, null, 2)}

User Question: ${question}

Provide a helpful, concise answer based on the AQI data. If the question is about health impacts, provide specific advice. Keep the response under 100 words.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    const msg = error?.message || '';
    console.error('Gemini Chatbot Error:', msg);

    // Fallback rule-based responses when Gemini is unavailable
    const q = question.toLowerCase();
    const aqi = aqiContext?.aqi_score ?? 0;

    if (q.includes('aqi') || q.includes('air quality') || q.includes('pollution')) {
      return `The current AQI is ${aqi}. ${aqi >= 150 ? 'Air quality is unhealthy — limit outdoor activities.' : aqi >= 100 ? 'Air quality is moderate — sensitive groups should take care.' : 'Air quality is good today!'}`;
    }
    if (q.includes('pm2.5') || q.includes('pm 2.5')) {
      return `Current PM2.5 level is ${aqiContext?.pm25 ?? 'N/A'} µg/m³. WHO safe limit is 15 µg/m³ daily average.`;
    }
    if (q.includes('pm10')) {
      return `Current PM10 level is ${aqiContext?.pm10 ?? 'N/A'} µg/m³. WHO safe limit is 45 µg/m³ daily average.`;
    }
    if (q.includes('outdoor') || q.includes('exercise') || q.includes('run') || q.includes('walk')) {
      return aqi >= 150
        ? 'With current AQI levels, it\'s best to avoid outdoor exercise. Try indoor workouts today.'
        : 'Current air quality allows for outdoor activities. Stay hydrated and avoid peak traffic hours.';
    }
    if (q.includes('mask') || q.includes('protect')) {
      return aqi >= 150
        ? 'An N95 or KN95 mask is recommended when going outside given the current AQI levels.'
        : 'A mask is optional for healthy adults at current AQI levels. Sensitive individuals may want to take precautions.';
    }

    return `The current AQI for your area is ${aqi}. Feel free to ask me about specific pollutants, health advice, or activity recommendations!`;
  }
}
