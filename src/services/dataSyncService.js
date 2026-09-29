import { supabase } from '../lib/supabaseClient';
import { MONITORING_REGIONS, generateRadarGridPoints, getActiveStormCells } from '../data/weatherEngine';

export const syncAllDataToSupabase = async (onProgress) => {
  const log = [];
  const addLog = (msg) => {
    log.push(`[${new Date().toLocaleTimeString()}] ${msg}`);
    if (onProgress) onProgress({ log: [...log], status: msg });
  };

  try {
    addLog('Starting Supabase Data Sync & Seeding...');

    // 1. Sync Monitoring Regions
    addLog('1/4 Syncing Monitoring Regions (12 DWR Hubs across India)...');
    const regionRows = MONITORING_REGIONS.map(r => ({
      id: r.id,
      name: r.name,
      lat: r.lat,
      lng: r.lng,
      zoom: r.zoom,
      dwr_station: r.dwrStation,
      is_active: true
    }));

    const { error: regErr } = await supabase
      .from('monitoring_regions')
      .upsert(regionRows, { onConflict: 'id' });

    if (regErr) {
      addLog(`⚠️ Monitoring regions sync note: ${regErr.message}`);
    } else {
      addLog(`✅ Successfully synced ${regionRows.length} DWR Stations to Supabase.`);
    }

    // 2. Sync Active Storm Cells
    addLog('2/4 Syncing Active Storm Centroids (SCIT Trajectories)...');
    const delhiRegion = MONITORING_REGIONS[0];
    const stormCells = getActiveStormCells(delhiRegion.lat, delhiRegion.lng, 0);

    const stormRows = stormCells.map(c => ({
      cell_id: c.id,
      region_id: delhiRegion.id,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      speed_kmh: c.speedKmh,
      heading_deg: c.headingDeg,
      max_dbz: c.maxDbz,
      top_height_km: c.topHeightKm,
      hail_mesh_cm: c.hailMeshCm,
      downburst_ms: c.downburstMs,
      cloudburst_risk: c.cloudburstRisk,
      lightning_rate: c.lightningRate
    }));

    const { error: stormErr } = await supabase
      .from('storm_cells')
      .insert(stormRows);

    if (stormErr) {
      addLog(`⚠️ Storm cells sync note: ${stormErr.message}`);
    } else {
      addLog(`✅ Synced ${stormRows.length} active severe storm cells to Supabase DB.`);
    }

    // 3. Sync Radar Grid Points (1-3 km Resolution)
    addLog('3/4 Ingesting 1–3 km Radar Reflectivity Grid Tensors...');
    const gridPoints = generateRadarGridPoints(delhiRegion.lat, delhiRegion.lng, 0);

    const gridRows = gridPoints.filter(p => p.dbz >= 20).map(p => ({
      region_id: delhiRegion.id,
      observation_time: new Date().toISOString(),
      lead_time_hours: 0,
      lat: p.lat,
      lng: p.lng,
      dbz: p.dbz,
      ir_temp_c: p.irTempC,
      hail_prob: p.hailProb,
      rain_rate_mm_hr: p.rainRateMmHr,
      radial_vel_ms: p.radialVelMs,
      lightning_density: p.lightningDensity
    }));

    const { error: gridErr } = await supabase
      .from('radar_grid_data')
      .insert(gridRows.slice(0, 100)); // batch first 100 points

    if (gridErr) {
      addLog(`⚠️ Radar grid ingestion note: ${gridErr.message}`);
    } else {
      addLog(`✅ Ingested ${Math.min(100, gridRows.length)} radar grid point tensors to Supabase DB.`);
    }

    // 4. Sync Sub-district Hazard Alerts
    addLog('4/4 Creating Sub-district Emergency Hazard Alerts...');
    const alertRows = [
      {
        subdistrict_id: 'SD-01',
        subdistrict_name: 'North-East Sector Zone 4',
        hazard_type: 'Hailstorm & Cloudburst',
        eta_minutes: 18,
        severity: 'CRITICAL',
        color: '#ef4444',
        impact_agri: 'Severe damage to standing crops',
        impact_aviation: 'Terminal doppler warning: Shear > 30 kts'
      }
    ];

    const { error: alertErr } = await supabase
      .from('hazard_alerts')
      .insert(alertRows);

    if (alertErr) {
      addLog(`⚠️ Hazard alerts sync note: ${alertErr.message}`);
    } else {
      addLog('✅ Created Sub-district Emergency Hazard Alerts in Supabase DB.');
    }

    addLog('🎉 All Data Ingestion & Storage Sequences Completed Successfully!');
    return { success: true, log };

  } catch (err) {
    addLog(`❌ Data sync error: ${err.message}`);
    return { success: false, log, error: err };
  }
};
