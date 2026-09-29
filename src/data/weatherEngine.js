// Meteorological Simulation Engine for SIH 2026 PS 26084
// Generates 1-3 km resolution grid metrics, storm centroids, multi-sensor telemetry & thermodynamic soundings

// All major Doppler Weather Radar (DWR) stations & high-vulnerability convective zones across ALL INDIA
export const MONITORING_REGIONS = [
  { id: 'delhi-ncr', name: 'Delhi NCR & Western UP', lat: 28.6139, lng: 77.2090, zoom: 9, dwrStation: 'DWR Palam (500 kW S-Band)', zone: 'North India' },
  { id: 'dehradun', name: 'Dehradun & Garhwal Hills (Cloudburst Focus)', lat: 30.3165, lng: 78.0322, zoom: 10, dwrStation: 'DWR Surkanda Devi (X-Band)', zone: 'Himalayan Foothills' },
  { id: 'srinagar', name: 'Srinagar & Kashmir Valley (Western Disturbance)', lat: 34.0837, lng: 74.7973, zoom: 9, dwrStation: 'DWR Srinagar (X-Band)', zone: 'North India' },
  { id: 'kolkata', name: 'Gangetic West Bengal (Nor\'wester Zone)', lat: 22.5726, lng: 88.3639, zoom: 9, dwrStation: 'DWR Kolkata (C-Band)', zone: 'East India' },
  { id: 'guwahati', name: 'Guwahati & Assam Valley (Flash Flood Zone)', lat: 26.1445, lng: 91.7362, zoom: 9, dwrStation: 'DWR Guwahati (S-Band)', zone: 'North-East India' },
  { id: 'nagpur', name: 'Central India (Vidarbha Hail Corridor)', lat: 21.1458, lng: 79.0882, zoom: 9, dwrStation: 'DWR Nagpur (S-Band)', zone: 'Central India' },
  { id: 'mumbai', name: 'Mumbai & Konkan Coast (Urban Cloudburst Risk)', lat: 19.0760, lng: 72.8777, zoom: 10, dwrStation: 'DWR Veravali Mumbai (S-Band)', zone: 'West Coast' },
  { id: 'chennai', name: 'Chennai & Coromandel Coast', lat: 13.0827, lng: 80.2707, zoom: 9, dwrStation: 'DWR Chennai Port (S-Band)', zone: 'South Coast' },
  { id: 'bengaluru', name: 'Bengaluru & South Karnataka Plateau', lat: 12.9716, lng: 77.5946, zoom: 9, dwrStation: 'DWR Bengaluru (S-Band)', zone: 'South India' },
  { id: 'hyderabad', name: 'Hyderabad & Telangana Convective Zone', lat: 17.3850, lng: 78.4867, zoom: 9, dwrStation: 'DWR Begumpet (S-Band)', zone: 'Deccan Plateau' },
  { id: 'ahmedabad', name: 'Ahmedabad & Gujarat Coastal Belt', lat: 23.0225, lng: 72.5714, zoom: 9, dwrStation: 'DWR Bhuj / AHD (S-Band)', zone: 'West India' },
  { id: 'kochi', name: 'Kochi & Malabar Coast (Monsoon Onset)', lat: 9.9312, lng: 76.2673, zoom: 10, dwrStation: 'DWR Kochi (C-Band)', zone: 'South Coast' }
];

// Reflectivity Color Scale (Standard WSR-88D / IMD Radar Scale)
export const REFLECTIVITY_SCALE = [
  { dbz: 10, color: '#00ecec', label: 'Light Mist' },
  { dbz: 20, color: '#00a0f0', label: 'Light Rain' },
  { dbz: 30, color: '#0000f0', label: 'Moderate Rain' },
  { dbz: 40, color: '#00e000', label: 'Heavy Rain / Thunderstorm' },
  { dbz: 45, color: '#ffff00', label: 'Severe Convective Cell' },
  { dbz: 50, color: '#e7c000', label: 'Hail Probability (>60%)' },
  { dbz: 55, color: '#ff9000', label: 'Severe Hail / Microburst' },
  { dbz: 60, color: '#ff0000', label: 'Extreme Downburst' },
  { dbz: 65, color: '#d00000', label: 'Cloudburst Threshold' },
  { dbz: 70, color: '#ff00ff', label: 'Tornado / Extreme Hazard' }
];

// Generate Grid Heatmap Points (1–3 km spatial resolution simulation)
export const generateRadarGridPoints = (centerLat, centerLng, leadTimeHours = 0) => {
  const points = [];
  const rows = 20;
  const cols = 20;
  const step = 0.025; // approx 2.5 km grid cell spacing

  // Storm centroid shift based on lead time
  const latShift = leadTimeHours * 0.08;
  const lngShift = leadTimeHours * 0.12;

  // Storm Cell 1 Centroid (Main Supercell)
  const cell1Lat = centerLat + 0.05 + latShift;
  const cell1Lng = centerLng + 0.04 + lngShift;

  // Storm Cell 2 Centroid (Secondary Convective Line)
  const cell2Lat = centerLat - 0.12 + (latShift * 0.8);
  const cell2Lng = centerLng - 0.08 + (lngShift * 0.8);

  for (let r = -rows / 2; r < rows / 2; r++) {
    for (let c = -cols / 2; c < cols / 2; c++) {
      const pointLat = centerLat + r * step;
      const pointLng = centerLng + c * step;

      // Distance to Cell 1 & Cell 2
      const dist1 = Math.sqrt(Math.pow(pointLat - cell1Lat, 2) + Math.pow(pointLng - cell1Lng, 2));
      const dist2 = Math.sqrt(Math.pow(pointLat - cell2Lat, 2) + Math.pow(pointLng - cell2Lng, 2));

      let dbz = 5 + Math.random() * 8; // Background noise

      if (dist1 < 0.15) {
        dbz += (1 - dist1 / 0.15) * 62;
      }
      if (dist2 < 0.10) {
        dbz += (1 - dist2 / 0.10) * 48;
      }

      // Decay intensity slightly at 4+ hours lead time
      if (leadTimeHours > 3) {
        dbz *= (1 - (leadTimeHours - 3) * 0.08);
      }

      dbz = Math.min(72, Math.max(5, Math.round(dbz)));

      const irTempC = Math.round(20 - (dbz * 1.2) - (Math.random() * 4));
      const hailProb = dbz >= 48 ? Math.min(99, Math.round((dbz - 45) * 4.2)) : 0;
      const rainRateMmHr = Math.round(Math.pow(10, (dbz - 16) / 20) * 0.035 * 100);

      points.push({
        lat: pointLat,
        lng: pointLng,
        dbz,
        irTempC,
        hailProb,
        rainRateMmHr,
        radialVelMs: Math.round((Math.random() * 30 - 15) + (dbz > 50 ? 18 : 0)),
        lightningDensity: dbz > 45 ? Math.round((dbz - 40) * 1.8) : 0
      });
    }
  }

  return points;
};

// Generate Active Storm Centroids with Trajectory Vectors
export const getActiveStormCells = (centerLat, centerLng, leadTimeHours = 0) => {
  const latShift = leadTimeHours * 0.08;
  const lngShift = leadTimeHours * 0.12;

  return [
    {
      id: 'CELL-ALPHA-01',
      name: 'Supercell Alpha (Severe Hail & Cloudburst Hazard)',
      lat: centerLat + 0.05 + latShift,
      lng: centerLng + 0.04 + lngShift,
      speedKmh: 42,
      headingDeg: 65,
      maxDbz: Math.max(40, 68 - Math.round(leadTimeHours * 3)),
      topHeightKm: 14.8,
      hailMeshCm: (leadTimeHours <= 2 ? 3.8 : 2.1),
      downburstMs: 28.4,
      cloudburstRisk: leadTimeHours <= 2 ? 'HIGH' : 'MODERATE',
      lightningRate: 142, // flashes/min
      ciThermalDropRate: '-2.4°C / 5 min'
    },
    {
      id: 'CELL-BETA-02',
      name: 'Squall Line Beta (Downburst & Microburst Zone)',
      lat: centerLat - 0.12 + (latShift * 0.8),
      lng: centerLng - 0.08 + (lngShift * 0.8),
      speedKmh: 36,
      headingDeg: 55,
      maxDbz: Math.max(35, 54 - Math.round(leadTimeHours * 2)),
      topHeightKm: 11.2,
      hailMeshCm: 1.2,
      downburstMs: 22.1,
      cloudburstRisk: 'LOW',
      lightningRate: 64,
      ciThermalDropRate: '-1.1°C / 5 min'
    }
  ];
};

// Generate Advanced Convective Diagnostics Analytics & Sounding Profile
export const getConvectiveAnalytics = (activeRegion, leadTimeHours = 0) => {
  const baseCape = 2450 - (leadTimeHours * 180);
  const cin = Math.min(220, 15 + Math.round(Math.random() * 25));
  const bulkShearKts = Math.round(45 + Math.random() * 10);
  const precipitableWaterMm = Math.round(58 - leadTimeHours * 2);

  // Vertical Profile Data (0 to 16 km Altitude)
  const verticalProfile = [
    { heightKm: 0, dbz: 32, tempC: 28, windKts: 12 },
    { heightKm: 2, dbz: 48, tempC: 18, windKts: 22 },
    { heightKm: 4, dbz: 64, tempC: 4, windKts: 35 },
    { heightKm: 6, dbz: 68, tempC: -10, windKts: 48 }, // Bright band / freezing level
    { heightKm: 8, dbz: 58, tempC: -24, windKts: 55 },
    { heightKm: 10, dbz: 44, tempC: -40, windKts: 62 },
    { heightKm: 12, dbz: 28, tempC: -55, windKts: 70 },
    { heightKm: 14, dbz: 14, tempC: -68, windKts: 45 },
    { heightKm: 16, dbz: 4, tempC: -74, windKts: 20 }
  ];

  return {
    regionName: activeRegion.name,
    dwrStation: activeRegion.dwrStation,
    zone: activeRegion.zone,
    capeJkg: baseCape,
    cinJkg: cin,
    bulkShearKts,
    precipitableWaterMm,
    liftedIndex: -6.4,
    kIndex: 38,
    helicitySrh: 240, // m²/s²
    verticalProfile,
    microburstProbability: baseCape > 2000 ? 88 : 45,
    cloudburstThresholdMmHr: 100,
    currentRainPeakMmHr: Math.round(85 - leadTimeHours * 5)
  };
};

// Generate Live Sub-district Hazard Countdown Clocks
export const getSubdistrictCountdowns = (leadTimeHours = 0) => {
  return [
    {
      id: 'SD-01',
      name: 'North-East Sector Zone 4',
      hazardType: 'Hailstorm & Cloudburst',
      etaMinutes: Math.max(0, 18 - Math.round(leadTimeHours * 60)),
      severity: 'CRITICAL',
      color: '#ef4444',
      impactAgri: 'Severe damage to standing wheat/mustard crops',
      impactAviation: 'Terminal doppler warning: Shear > 30 kts'
    },
    {
      id: 'SD-02',
      name: 'Central Industrial Corridor',
      hazardType: 'Lightning Density & Downdraft',
      etaMinutes: Math.max(0, 42 - Math.round(leadTimeHours * 60)),
      severity: 'HIGH',
      color: '#f97316',
      impactAgri: 'Moderate rain accumulation (25 mm/hr)',
      impactAviation: 'Gust front alert at 500m AGL'
    },
    {
      id: 'SD-03',
      name: 'South Foothills Bypass',
      hazardType: 'Flash Flood / Convective Initiation',
      etaMinutes: Math.max(0, 75 - Math.round(leadTimeHours * 60)),
      severity: 'WATCH',
      color: '#eab308',
      impactAgri: 'Soil saturation warning',
      impactAviation: 'Minor turbulence expected'
    }
  ];
};

// Simulated CAP (Common Alerting Protocol v1.2) Generator
export const generateCAPAlertXML = (cell, subdistrict) => {
  const dateStr = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8"?>
<alert xmlns="urn:oasis:names:tc:emergency:cap:1.2">
  <identifier>NCMRWF-NOWCAST-${cell.id}-${Date.now()}</identifier>
  <sender>alert-engine@ncmrwf.gov.in</sender>
  <sent>${dateStr}</sent>
  <status>Actual</status>
  <msgType>Alert</msgType>
  <scope>Public</scope>
  <info>
    <category>Met</category>
    <event>Severe Thunderstorm &amp; Cloudburst Nowcast</event>
    <urgency>Immediate</urgency>
    <severity>Extreme</severity>
    <certainty>Observed</certainty>
    <eventCode>
      <valueName>SAME</valueName>
      <value>SVR</value>
    </eventCode>
    <expires>${new Date(Date.now() + 3600 * 1000 * 3).toISOString()}</expires>
    <headline>URGENT NOWCAST: ${cell.name} affecting ${subdistrict.name}</headline>
    <description>Doppler Radar reflectivity reaching ${cell.maxDbz} dBZ with vertical cloud top at ${cell.topHeightKm} km. Hail probability >90% (MESH ${cell.hailMeshCm} cm). Instantaneous precipitation rate exceeds cloudburst threshold.</description>
    <instruction>Take shelter immediately in a sturdy building. Avoid low-lying riverbeds, open fields, and electrical poles. Farmers should protect standing crops.</instruction>
    <area>
      <areaDesc>${subdistrict.name}</areaDesc>
      <circle>${cell.lat.toFixed(4)},${cell.lng.toFixed(4)},5000</circle>
    </area>
  </info>
</alert>`;
};
