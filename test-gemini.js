import { generateHealthAdvisory } from "./lib/gemini.js";

async function test() {
  try {
    const uiReading = {
      ward_name: "Test Ward",
      pm25: 50,
      pm10: 100,
      gas_level: 20,
      aqi_score: 150
    };
    console.log("Calling Gemini...");
    const result = await generateHealthAdvisory(uiReading);
    console.log("Result:", result);
  } catch (err) {
    console.error("Test Error:", err);
  }
}
test();
