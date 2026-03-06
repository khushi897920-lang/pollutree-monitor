import { GoogleGenerativeAI } from '@google/generative-ai';

function getGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }
  
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getModel({ model: 'gemini-2.0-flash-exp' });
}

export async function generateHealthAdvisory(aqiData) {
  try {
    const model = getGeminiModel();
    
    const prompt = `Based on the following air quality data:
- Ward ID: ${aqiData.ward_id}
- PM2.5: ${aqiData.pm25_level} µg/m³
- PM10: ${aqiData.pm10_level} µg/m³
- Gas Level: ${aqiData.gas_level}

Provide a 2-sentence health advisory for citizens. Be concise and actionable.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate health advisory');
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
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Chatbot Error:', error);
    throw new Error('Failed to get chatbot response');
  }
}
