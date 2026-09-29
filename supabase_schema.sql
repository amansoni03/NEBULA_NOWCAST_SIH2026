-- ==========================================================================
-- SUPABASE SQL SCHEMA — SIH 2026 PS 26084 
-- Convective Scale Nowcasting System (0–6 Hr Lead Time, 1–3 km Resolution)
-- Copy & paste this entire file into Supabase SQL Editor and click "Run"
-- ==========================================================================

-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- =========================================
-- 1. MONITORING REGIONS (DWR Station Areas)
-- =========================================
CREATE TABLE monitoring_regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  zoom INTEGER DEFAULT 9,
  dwr_station TEXT NOT NULL,
  geom GEOMETRY(Point, 4326),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default monitoring regions
INSERT INTO monitoring_regions (id, name, lat, lng, zoom, dwr_station, geom) VALUES
  ('delhi-ncr', 'Delhi NCR & Western UP', 28.6139, 77.2090, 9, 'DWR Palam (500 kW S-Band)', ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)),
  ('dehradun', 'Dehradun & Garhwal Hills (Cloudburst Focus)', 30.3165, 78.0322, 10, 'DWR Surkanda Devi (X-Band)', ST_SetSRID(ST_MakePoint(78.0322, 30.3165), 4326)),
  ('kolkata', 'Gangetic West Bengal (Norwester Zone)', 22.5726, 88.3639, 9, 'DWR Kolkata (C-Band)', ST_SetSRID(ST_MakePoint(88.3639, 22.5726), 4326)),
  ('nagpur', 'Central India (Vidarbha Hail Corridor)', 21.1458, 79.0882, 9, 'DWR Nagpur (S-Band)', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326));

-- =========================================
-- 2. RADAR GRID DATA (1–3 km Resolution)
-- =========================================
CREATE TABLE radar_grid_data (
  id BIGSERIAL PRIMARY KEY,
  region_id TEXT REFERENCES monitoring_regions(id) ON DELETE CASCADE,
  observation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_time_hours REAL NOT NULL DEFAULT 0,  -- 0 = live, 0.25 to 6.0 = forecast
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326),
  -- Doppler Weather Radar (DWR)
  reflectivity_dbz REAL,           -- dBZ (0–72)
  radial_velocity_ms REAL,         -- m/s (-30 to +30)
  -- INSAT-3D Satellite
  ir_brightness_temp_c REAL,       -- Cloud-top IR temp (°C)
  -- Multi-Hazard Derived Metrics
  hail_probability_pct REAL,       -- MESH index (0–100%)
  rain_rate_mm_hr REAL,            -- Instantaneous rain rate
  lightning_density REAL,           -- flashes/km²/hr
  cloudburst_risk TEXT CHECK (cloudburst_risk IN ('LOW', 'MODERATE', 'HIGH', 'EXTREME')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for fast region queries
CREATE INDEX idx_radar_grid_geom ON radar_grid_data USING GIST(geom);
CREATE INDEX idx_radar_grid_region_time ON radar_grid_data (region_id, observation_time DESC);

-- =========================================
-- 3. STORM CELLS (SCIT Tracking)
-- =========================================
CREATE TABLE storm_cells (
  id TEXT PRIMARY KEY,  -- e.g. 'CELL-ALPHA-01'
  region_id TEXT REFERENCES monitoring_regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  observation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326),
  -- Motion Vector
  speed_kmh REAL,
  heading_deg REAL,
  -- Storm Characteristics
  max_reflectivity_dbz REAL,
  echo_top_height_km REAL,
  hail_mesh_cm REAL,               -- Maximum Expected Size of Hail
  downburst_speed_ms REAL,          -- Microburst wind gust potential
  lightning_rate_per_min REAL,
  cloudburst_risk TEXT CHECK (cloudburst_risk IN ('LOW', 'MODERATE', 'HIGH', 'EXTREME')),
  -- Pre-Rain Convective Initiation (CI)
  ci_thermal_drop_rate TEXT,        -- e.g. '-2.4°C / 5 min'
  ci_detected_at TIMESTAMPTZ,
  -- Lifecycle
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('INITIATING', 'ACTIVE', 'SEVERE', 'DISSIPATING')),
  first_detected_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_storm_cells_geom ON storm_cells USING GIST(geom);
CREATE INDEX idx_storm_cells_region ON storm_cells (region_id, status);

-- =========================================
-- 4. STORM CELL TRAJECTORIES (0–6 Hr Path)
-- =========================================
CREATE TABLE storm_cell_trajectories (
  id BIGSERIAL PRIMARY KEY,
  cell_id TEXT REFERENCES storm_cells(id) ON DELETE CASCADE,
  lead_time_hours REAL NOT NULL,    -- 0 to 6
  predicted_lat DOUBLE PRECISION NOT NULL,
  predicted_lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326),
  confidence_pct REAL,              -- Prediction confidence (%)
  predicted_dbz REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_trajectories_cell ON storm_cell_trajectories (cell_id, lead_time_hours);

-- =========================================
-- 5. HAZARD ALERTS (Sub-district Countdowns)
-- =========================================
CREATE TABLE hazard_alerts (
  id TEXT PRIMARY KEY,
  region_id TEXT REFERENCES monitoring_regions(id) ON DELETE CASCADE,
  cell_id TEXT REFERENCES storm_cells(id) ON DELETE SET NULL,
  subdistrict_name TEXT NOT NULL,
  hazard_type TEXT NOT NULL,        -- 'Hailstorm', 'Cloudburst', 'Lightning', 'Downburst', 'Flash Flood'
  severity TEXT NOT NULL CHECK (severity IN ('WATCH', 'WARNING', 'CRITICAL', 'EMERGENCY')),
  eta_minutes INTEGER,              -- Estimated time of arrival
  -- Sector-Specific Impact Scores
  impact_agriculture TEXT CHECK (impact_agriculture IN ('LOW', 'MEDIUM', 'HIGH', 'EXTREME')),
  impact_aviation TEXT CHECK (impact_aviation IN ('LOW', 'MEDIUM', 'HIGH', 'EXTREME')),
  impact_urban_flood TEXT CHECK (impact_urban_flood IN ('LOW', 'MEDIUM', 'HIGH', 'EXTREME')),
  impact_description TEXT,
  -- Status
  is_active BOOLEAN DEFAULT true,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ
);

CREATE INDEX idx_hazard_alerts_active ON hazard_alerts (region_id, is_active, severity);

-- =========================================
-- 6. CAP ALERTS (Common Alerting Protocol)
-- =========================================
CREATE TABLE cap_alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_id TEXT REFERENCES hazard_alerts(id) ON DELETE CASCADE,
  cell_id TEXT REFERENCES storm_cells(id) ON DELETE SET NULL,
  cap_identifier TEXT UNIQUE NOT NULL,
  cap_xml TEXT NOT NULL,
  cap_status TEXT DEFAULT 'Actual' CHECK (cap_status IN ('Actual', 'Exercise', 'System', 'Test')),
  cap_severity TEXT DEFAULT 'Extreme' CHECK (cap_severity IN ('Minor', 'Moderate', 'Severe', 'Extreme')),
  cap_urgency TEXT DEFAULT 'Immediate' CHECK (cap_urgency IN ('Past', 'Future', 'Expected', 'Immediate')),
  sent_to_ndma BOOLEAN DEFAULT false,
  sent_to_sdma BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- =========================================
-- 7. CROWDSOURCED BAROMETER READINGS (IoT)
-- =========================================
CREATE TABLE barometer_readings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326),
  pressure_hpa REAL NOT NULL,       -- Barometric pressure in hPa
  pressure_delta_hpa REAL,          -- Change over last 5 minutes
  temperature_c REAL,
  humidity_pct REAL,
  source TEXT DEFAULT 'smartphone' CHECK (source IN ('smartphone', 'iot_station', 'manual')),
  is_verified BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_barometer_geom ON barometer_readings USING GIST(geom);
CREATE INDEX idx_barometer_time ON barometer_readings (submitted_at DESC);

-- =========================================
-- 8. USER PREFERENCES & SAVED VIEWS
-- =========================================
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_region_id TEXT REFERENCES monitoring_regions(id),
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  notification_enabled BOOLEAN DEFAULT true,
  alert_severity_filter TEXT[] DEFAULT ARRAY['CRITICAL', 'EMERGENCY'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 9. REALTIME SENSOR TELEMETRY LOG
-- =========================================
CREATE TABLE sensor_telemetry (
  id BIGSERIAL PRIMARY KEY,
  region_id TEXT REFERENCES monitoring_regions(id) ON DELETE CASCADE,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('DWR', 'INSAT_3D', 'LIGHTNING_NETWORK', 'AWS', 'BAROMETER')),
  sensor_name TEXT,
  status TEXT DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'DEGRADED', 'OFFLINE')),
  last_data_received_at TIMESTAMPTZ DEFAULT NOW(),
  data_latency_seconds REAL,
  metadata JSONB
);

CREATE INDEX idx_sensor_region ON sensor_telemetry (region_id, sensor_type);

-- =========================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================

-- Enable RLS on all tables
ALTER TABLE monitoring_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE radar_grid_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE storm_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cap_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE barometer_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_telemetry ENABLE ROW LEVEL SECURITY;

-- Public access policies (SELECT, INSERT, UPDATE) for monitoring & simulation data
CREATE POLICY "Public full access monitoring_regions" ON monitoring_regions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access radar_grid_data" ON radar_grid_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access storm_cells" ON storm_cells FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access hazard_alerts" ON hazard_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access cap_alerts" ON cap_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access sensor_telemetry" ON sensor_telemetry FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access barometer" ON barometer_readings FOR ALL USING (true) WITH CHECK (true);

-- Users manage their own preferences
CREATE POLICY "Users manage own prefs" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- =========================================
-- 11. REALTIME SUBSCRIPTIONS
-- =========================================
-- Enable Supabase Realtime on key tables for live dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE storm_cells;
ALTER PUBLICATION supabase_realtime ADD TABLE hazard_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE barometer_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_telemetry;

-- =========================================
-- DONE! Your database is ready.
-- =========================================
