export function detectPollutionSource(pm25, pm10, gas) {
  const ratio = pm10 > 0 ? pm25 / pm10 : 0;

  if (pm10 > 150 && ratio < 0.6) {
    return {
      source: 'Construction Dust',
      confidence: 'High',
      description: 'High PM10 levels indicate dust from construction activities or road work',
      icon: '🏗️',
      color: '#f97316',
    };
  }

  if (pm25 > 100 && gas > 400) {
    return {
      source: 'Biomass Burning',
      confidence: 'High',
      description: 'Elevated PM2.5 and gas levels suggest burning of agricultural waste or garbage',
      icon: '🔥',
      color: '#dc2626',
    };
  }

  if (gas > 500 && pm25 < 100) {
    return {
      source: 'Industrial Emissions',
      confidence: 'Medium',
      description: 'High gas levels indicate nearby industrial activity or factories',
      icon: '🏭',
      color: '#6366f1',
    };
  }

  if (pm25 > 50 && pm25 < 150 && pm10 > 80 && pm10 < 200 && ratio > 0.5) {
    return {
      source: 'Vehicular Traffic',
      confidence: 'High',
      description: 'Balanced PM2.5 and PM10 levels typical of vehicular emissions',
      icon: '🚗',
      color: '#eab308',
    };
  }

  if (pm25 > 120 && pm10 < 150 && gas < 300) {
    return {
      source: 'Secondary Aerosols',
      confidence: 'Medium',
      description: 'High PM2.5 suggests atmospheric chemical reactions producing fine particles',
      icon: '☁️',
      color: '#8b5cf6',
    };
  }

  if (pm25 < 50 && pm10 < 80) {
    return {
      source: 'Background Pollution',
      confidence: 'Low',
      description: 'Normal background air quality with no major pollution source detected',
      icon: '✅',
      color: '#22c55e',
    };
  }

  return {
    source: 'Mixed Sources',
    confidence: 'Low',
    description: 'Multiple pollution sources contributing to current air quality',
    icon: '🌫️',
    color: '#64748b',
  };
}

export function getPollutionContributions(pm25, pm10, gas) {
  const p25 = Math.max(0, Number(pm25) || 0);
  const p10 = Math.max(0, Number(pm10) || 0);
  const g = Math.max(0, Number(gas) || 0);

  const ratio = p10 > 0 ? p25 / p10 : 0;
  const coarseFrac = p10 > 0 ? Math.max(0, (p10 - p25) / p10) : 0;

  const trafficScore = Math.min(100, ratio * 100 * 0.9 + Math.min(p25, 150) * 0.2);
  const roadDustScore = Math.min(100, coarseFrac * 80 + (p10 > 100 ? 20 : 0));
  const biomassScore = Math.min(100, (Math.min(p25, 200) / 200) * 50 + (Math.min(g, 600) / 600) * 50);
  const industrialScore = Math.min(100, (Math.min(g, 600) / 600) * 80 + (p25 < 80 ? 20 : 0));
  const constructionScore = Math.min(100, (Math.min(p10, 300) / 300) * 60 + (coarseFrac > 0.5 ? 40 : coarseFrac * 80));

  const total = trafficScore + roadDustScore + biomassScore + industrialScore + constructionScore || 1;

  return [
    { label: 'Traffic', score: trafficScore, color: '#eab308', icon: '🚗' },
    { label: 'Road Dust', score: roadDustScore, color: '#f97316', icon: '🛣️' },
    { label: 'Biomass', score: biomassScore, color: '#dc2626', icon: '🔥' },
    { label: 'Industrial', score: industrialScore, color: '#6366f1', icon: '🏭' },
    { label: 'Construction', score: constructionScore, color: '#a78bfa', icon: '🏗️' },
  ]
    .map(s => ({ ...s, pct: Math.round((s.score / total) * 100) }))
    .sort((a, b) => b.pct - a.pct);
}

export function getPollutionRecommendation(source) {
  const recommendations = {
    'Construction Dust': [
      'Deploy water sprinklers at construction sites',
      'Enforce dust control measures',
      'Cover exposed soil and materials',
    ],
    'Biomass Burning': [
      'Issue burning ban notices',
      'Deploy inspection teams',
      'Promote alternative waste management',
    ],
    'Industrial Emissions': [
      'Inspect nearby factories',
      'Enforce emission standards',
      'Monitor industrial activity',
    ],
    'Vehicular Traffic': [
      'Implement traffic diversions',
      'Promote public transport',
      'Consider odd-even vehicle restrictions',
    ],
    'Secondary Aerosols': [
      'Monitor regional air quality',
      'Coordinate with neighboring areas',
      'Issue health advisories',
    ],
    'Mixed Sources': [
      'Deploy comprehensive monitoring',
      'Issue general pollution warnings',
      'Activate all mitigation measures',
    ],
  };

  return recommendations[source] || [
    'Monitor air quality continuously',
    'Issue health advisories to residents',
    'Deploy appropriate mitigation measures',
  ];
}
