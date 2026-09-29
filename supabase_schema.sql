-- ==========================================================================
-- SUPABASE SQL SCHEMA — SIH 2026 PS 26084 
-- Convective Scale Nowcasting System (0–6 Hr Lead Time, 1–3 km Resolution)
-- Copy & paste this entire file into Supabase SQL Editor and click "Run"
-- ==========================================================================

-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Clean wipe existing tables if re-running
DROP TABLE IF EXISTS sensor_telemetry CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS barometer_readings CASCADE;
DROP TABLE IF EXISTS cap_alerts CASCADE;
DROP TABLE IF EXISTS hazard_alerts CASCADE;
DROP TABLE IF EXISTS storm_trajectories CASCADE;
DROP TABLE IF EXISTS storm_cells CASCADE;
DROP TABLE IF EXISTS radar_grid_data CASCADE;
DROP TABLE IF EXISTS monitoring_regions CASCADE;

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
  ('srinagar', 'Srinagar & Kashmir Valley (Western Disturbance)', 34.0837, 74.7973, 9, 'DWR Srinagar (X-Band)', ST_SetSRID(ST_MakePoint(74.7973, 34.0837), 4326)),
  ('kolkata', 'Gangetic West Bengal (Norwester Zone)', 22.5726, 88.3639, 9, 'DWR Kolkata (C-Band)', ST_SetSRID(ST_MakePoint(88.3639, 22.5726), 4326)),
  ('guwahati', 'Guwahati & Assam Valley (Flash Flood Zone)', 26.1445, 91.7362, 9, 'DWR Guwahati (S-Band)', ST_SetSRID(ST_MakePoint(91.7362, 26.1445), 4326)),
  ('nagpur', 'Central India (Vidarbha Hail Corridor)', 21.1458, 79.0882, 9, 'DWR Nagpur (S-Band)', ST_SetSRID(ST_MakePoint(79.0882, 21.1458), 4326)),
  ('mumbai', 'Mumbai & Konkan Coast (Urban Cloudburst Risk)', 19.0760, 72.8777, 10, 'DWR Veravali Mumbai (S-Band)', ST_SetSRID(ST_MakePoint(72.8777, 19.0760), 4326)),
  ('chennai', 'Chennai & Coromandel Coast', 13.0827, 80.2707, 9, 'DWR Chennai Port (S-Band)', ST_SetSRID(ST_MakePoint(80.2707, 13.0827), 4326)),
  ('bengaluru', 'Bengaluru & South Karnataka Plateau', 12.9716, 77.5946, 9, 'DWR Bengaluru (S-Band)', ST_SetSRID(ST_MakePoint(77.5946, 12.9716), 4326)),
  ('hyderabad', 'Hyderabad & Telangana Convective Zone', 17.3850, 78.4867, 9, 'DWR Begumpet (S-Band)', ST_SetSRID(ST_MakePoint(78.4867, 17.3850), 4326)),
  ('ahmedabad', 'Ahmedabad & Gujarat Coastal Belt', 23.0225, 72.5714, 9, 'DWR Bhuj / AHD (S-Band)', ST_SetSRID(ST_MakePoint(72.5714, 23.0225), 4326)),
  ('kochi', 'Kochi & Malabar Coast (Monsoon Onset)', 9.9312, 76.2673, 10, 'DWR Kochi (C-Band)', ST_SetSRID(ST_MakePoint(76.2673, 9.9312), 4326));

-- =========================================
-- 2. RADAR GRID DATA (1–3 km Resolution)
-- =========================================
CREATE TABLE radar_grid_data (
  id BIGSERIAL PRIMARY KEY,
  region_id TEXT REFERENCES monitoring_regions(id) ON DELETE CASCADE,
  observation_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lead_time_hours REAL NOT NULL DEFAULT 0,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326),
  reflectivity_dbz REAL,
  radial_velocity_ms REAL,
  ir_brightness_temp_c REAL,
  hail_probability_pct REAL,
  rain_rate_mm_hr REAL,
  lightning_density REAL,
  cloudburst_risk TEXT CHECK (cloudburst_risk IN ('LOW', 'MODERATE', 'HIGH', 'EXTREME')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_radar_grid_geom ON radar_grid_data USING GIST(geom);
CREATE INDEX idx_radar_grid_region_time ON radar_grid_data (region_id, observation_time DESC);

-- =========================================
-- 3. STORM CELL CENTROIDS (SCIT Nowcasts)
-- =========================================
CREATE TABLE storm_cells (
  id BIGSERIAL PRIMARY KEY,
  cell_id TEXT NOT NULL,
  region_id TEXT REFERENCES monitoring_regions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(Point, 4326),
  speed_kmh REAL NOT NULL,
  heading_deg REAL NOT NULL,
  max_dbz REAL NOT NULL,
  top_height_km REAL,
  hail_mesh_cm REAL,
  downburst_ms REAL,
  cloudburst_risk TEXT,
  lightning_rate REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_storm_cells_geom ON storm_cells USING GIST(geom);

-- =========================================
-- 4. STORM CELL TRAJECTORY VECTORS
-- =========================================
CREATE TABLE storm_trajectories (
  id BIGSERIAL PRIMARY KEY,
  storm_cell_id BIGINT REFERENCES storm_cells(id) ON DELETE CASCADE,
  lead_time_hours REAL NOT NULL,
  forecast_lat DOUBLE PRECISION NOT NULL,
  forecast_lng DOUBLE PRECISION NOT NULL,
  forecast_geom GEOMETRY(Point, 4326),
  max_dbz_forecast REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 5. SUB-DISTRICT HAZARD COUNTDOWNS
-- =========================================
CREATE TABLE hazard_alerts (
  id BIGSERIAL PRIMARY KEY,
  subdistrict_id TEXT NOT NULL,
  subdistrict_name TEXT NOT NULL,
  hazard_type TEXT NOT NULL,
  eta_minutes INTEGER NOT NULL,
  severity TEXT CHECK (severity IN ('WATCH', 'HIGH', 'CRITICAL', 'EMERGENCY')),
  color TEXT DEFAULT '#ef4444',
  impact_agri TEXT,
  impact_aviation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- 6. CAP (Common Alerting Protocol v1.2) ALERTS
-- =========================================
CREATE TABLE cap_alerts (
  id BIGSERIAL PRIMARY KEY,
  alert_identifier TEXT NOT NULL UNIQUE,
  sender TEXT NOT NULL DEFAULT 'alert-engine@ncmrwf.gov.in',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  event_type TEXT NOT NULL,
  urgency TEXT DEFAULT 'Immediate',
  severity TEXT DEFAULT 'Extreme',
  headline TEXT NOT NULL,
  description TEXT,
  instruction TEXT,
  area_desc TEXT,
  cap_xml TEXT NOT NULL,
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
  pressure_hpa REAL NOT NULL,
  pressure_delta_hpa REAL,
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
-- Safely add tables to publication
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'storm_cells') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE storm_cells;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'hazard_alerts') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE hazard_alerts;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'barometer_readings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE barometer_readings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sensor_telemetry') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE sensor_telemetry;
  END IF;
END $$;

-- =========================================
-- DONE! Your database is ready.
-- =========================================
