// Standard EPA AQI breakpoints
export function calculateAQI(pm25) {
  if (!pm25 || isNaN(pm25) || pm25 <= 0) return 0;
  if (pm25 <= 12)    return Math.round((50  / 12)          * pm25);
  if (pm25 <= 35.4)  return Math.round(50  + (50  / 23.4) * (pm25 - 12));
  if (pm25 <= 55.4)  return Math.round(100 + (50  / 20)   * (pm25 - 35.4));
  if (pm25 <= 150.4) return Math.round(150 + (50  / 95)   * (pm25 - 55.4));
  if (pm25 <= 250.4) return Math.round(200 + (100 / 100)  * (pm25 - 150.4));
  return                     Math.round(300 + (200 / 250)  * (pm25 - 250.4));
}

// Accepts an AQI score (0-500)
export function getAQICategory(aqi) {
  if (aqi <= 50)  return { category: 'Good',                          color: '#22c55e', level: 'good' };
  if (aqi <= 100) return { category: 'Moderate',                      color: '#eab308', level: 'moderate' };
  if (aqi <= 150) return { category: 'Unhealthy for Sensitive Groups', color: '#f97316', level: 'sensitive' };
  if (aqi <= 200) return { category: 'Unhealthy',                     color: '#ef4444', level: 'unhealthy' };
  if (aqi <= 300) return { category: 'Very Unhealthy',                color: '#a855f7', level: 'very-unhealthy' };
  return           { category: 'Hazardous',                           color: '#7f1d1d', level: 'hazardous' };
}

// Accepts an AQI score (0-500)
export function getMarkerColor(aqi) {
  if (aqi <= 50)  return '#22c55e';
  if (aqi <= 100) return '#eab308';
  if (aqi <= 150) return '#f97316';
  if (aqi <= 200) return '#ef4444';
  if (aqi <= 300) return '#a855f7';
  return '#7f1d1d';
}
