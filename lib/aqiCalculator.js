// Calculate AQI category and color based on PM2.5 levels
export function getAQICategory(pm25) {
  if (pm25 <= 50) {
    return { category: 'Good', color: 'green', level: 'good' };
  } else if (pm25 <= 100) {
    return { category: 'Moderate', color: 'yellow', level: 'moderate' };
  } else if (pm25 <= 150) {
    return { category: 'Unhealthy for Sensitive Groups', color: 'orange', level: 'unhealthy' };
  } else if (pm25 <= 200) {
    return { category: 'Unhealthy', color: 'red', level: 'unhealthy' };
  } else if (pm25 <= 300) {
    return { category: 'Very Unhealthy', color: 'purple', level: 'very-unhealthy' };
  } else {
    return { category: 'Hazardous', color: 'maroon', level: 'hazardous' };
  }
}

// Calculate overall AQI from PM2.5 (simplified)
export function calculateAQI(pm25) {
  // Simple linear approximation for AQI calculation
  if (pm25 <= 12) return Math.round((50 / 12) * pm25);
  if (pm25 <= 35.4) return Math.round(50 + ((100 - 50) / (35.4 - 12)) * (pm25 - 12));
  if (pm25 <= 55.4) return Math.round(100 + ((150 - 100) / (55.4 - 35.4)) * (pm25 - 35.4));
  if (pm25 <= 150.4) return Math.round(150 + ((200 - 150) / (150.4 - 55.4)) * (pm25 - 55.4));
  if (pm25 <= 250.4) return Math.round(200 + ((300 - 200) / (250.4 - 150.4)) * (pm25 - 150.4));
  return Math.round(300 + ((500 - 300) / (500.4 - 250.4)) * (pm25 - 250.4));
}

export function getMarkerColor(pm25) {
  const aqi = calculateAQI(pm25);
  if (aqi <= 50) return '#22c55e'; // green
  if (aqi <= 100) return '#eab308'; // yellow
  if (aqi <= 150) return '#f97316'; // orange
  if (aqi <= 200) return '#ef4444'; // red
  if (aqi <= 300) return '#a855f7'; // purple
  return '#7f1d1d'; // maroon
}
