export function getAQICategory(pm25) {
  if (pm25 <= 50) return { category: 'Good', color: 'green', level: 'good' };
  if (pm25 <= 100) return { category: 'Moderate', color: 'yellow', level: 'moderate' };
  if (pm25 <= 150) return { category: 'Unhealthy for Sensitive Groups', color: 'orange', level: 'unhealthy' };
  if (pm25 <= 200) return { category: 'Unhealthy', color: 'red', level: 'unhealthy' };
  if (pm25 <= 300) return { category: 'Very Unhealthy', color: 'purple', level: 'very-unhealthy' };
  return { category: 'Hazardous', color: 'maroon', level: 'hazardous' };
}

export function calculateAQI(pm25) {
  if (pm25 <= 12) return Math.round((50 / 12) * pm25);
  if (pm25 <= 35.4) return Math.round(50 + ((100 - 50) / (35.4 - 12)) * (pm25 - 12));
  if (pm25 <= 55.4) return Math.round(100 + ((150 - 100) / (55.4 - 35.4)) * (pm25 - 35.4));
  if (pm25 <= 150.4) return Math.round(150 + ((200 - 150) / (150.4 - 55.4)) * (pm25 - 55.4));
  if (pm25 <= 250.4) return Math.round(200 + ((300 - 200) / (250.4 - 150.4)) * (pm25 - 150.4));
  return Math.round(300 + ((500 - 300) / (500.4 - 250.4)) * (pm25 - 250.4));
}

export function getMarkerColor(pm25) {
  const aqi = calculateAQI(pm25);
  if (aqi <= 50) return '#10b981';
  if (aqi <= 100) return '#fbbf24';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#a855f7';
  return '#7f1d1d';
}
