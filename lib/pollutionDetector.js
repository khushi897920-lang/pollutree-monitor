// Pollution source detection logic based on PM2.5, PM10, and gas levels

export function detectPollutionSource(pm25, pm10, gas) {
  const pm25Topm10Ratio = pm10 > 0 ? pm25 / pm10 : 0;

  // High PM10 relative to PM2.5 indicates construction dust
  if (pm10 > 150 && pm25Topm10Ratio < 0.6) {
    return {
      source: 'Construction Dust',
      confidence: 'High',
      description: 'High PM10 levels indicate dust from construction activities or road work',
      icon: '🏗️',
      color: '#f97316',
    };
  }

  // High PM2.5 + High gas = Biomass burning
  if (pm25 > 100 && gas > 400) {
    return {
      source: 'Biomass Burning',
      confidence: 'High',
      description: 'Elevated PM2.5 and gas levels suggest burning of agricultural waste or garbage',
      icon: '🔥',
      color: '#dc2626',
    };
  }

  // High gas alone = Industrial emissions
  if (gas > 500 && pm25 < 100) {
    return {
      source: 'Industrial Emissions',
      confidence: 'Medium',
      description: 'High gas levels indicate nearby industrial activity or factories',
      icon: '🏭',
      color: '#6366f1',
    };
  }

  // Moderate PM2.5 + Moderate PM10 = Traffic pollution
  if (pm25 > 50 && pm25 < 150 && pm10 > 80 && pm10 < 200 && pm25Topm10Ratio > 0.5) {
    return {
      source: 'Vehicular Traffic',
      confidence: 'High',
      description: 'Balanced PM2.5 and PM10 levels typical of vehicular emissions',
      icon: '🚗',
      color: '#eab308',
    };
  }

  // High PM2.5 alone = Secondary aerosols (photochemical reactions)
  if (pm25 > 120 && pm10 < 150 && gas < 300) {
    return {
      source: 'Secondary Aerosols',
      confidence: 'Medium',
      description: 'High PM2.5 suggests atmospheric chemical reactions producing fine particles',
      icon: '☁️',
      color: '#8b5cf6',
    };
  }

  // Low levels = Background pollution
  if (pm25 < 50 && pm10 < 80) {
    return {
      source: 'Background Pollution',
      confidence: 'Low',
      description: 'Normal background air quality with no major pollution source detected',
      icon: '✅',
      color: '#22c55e',
    };
  }

  // Default - Mixed sources
  return {
    source: 'Mixed Sources',
    confidence: 'Low',
    description: 'Multiple pollution sources contributing to current air quality',
    icon: '🌫️',
    color: '#64748b',
  };
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
