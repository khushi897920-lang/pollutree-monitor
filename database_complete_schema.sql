-- ====================================================
-- Smart City AQI - Complete Database Schema
-- ====================================================

-- 1. AQI Readings Table (already exists, but here for reference)
CREATE TABLE IF NOT EXISTS aqi_readings (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ward_id INTEGER NOT NULL,
  pm25_level NUMERIC NOT NULL,
  pm10_level NUMERIC NOT NULL,
  gas_level NUMERIC NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_aqi_readings_ward_id ON aqi_readings(ward_id);
CREATE INDEX IF NOT EXISTS idx_aqi_readings_created_at ON aqi_readings(created_at DESC);

-- 2. Mitigation Actions Table (NEW)
CREATE TABLE IF NOT EXISTS mitigation_actions (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ward_id INTEGER NOT NULL,
  action_type TEXT NOT NULL, -- 'sprinklers', 'warning', 'inspection'
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  triggered_by TEXT, -- admin user email
  aqi_at_trigger NUMERIC,
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_mitigation_ward ON mitigation_actions(ward_id);
CREATE INDEX IF NOT EXISTS idx_mitigation_status ON mitigation_actions(status);
CREATE INDEX IF NOT EXISTS idx_mitigation_created ON mitigation_actions(created_at DESC);

-- 3. Pollution Alerts Table (NEW)
CREATE TABLE IF NOT EXISTS pollution_alerts (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ward_id INTEGER NOT NULL,
  aqi_level NUMERIC NOT NULL,
  alert_type TEXT NOT NULL, -- 'hazardous', 'very_unhealthy', 'unhealthy'
  message TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_alerts_ward ON pollution_alerts(ward_id);
CREATE INDEX IF NOT EXISTS idx_alerts_ack ON pollution_alerts(acknowledged);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON pollution_alerts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE mitigation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pollution_alerts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mitigation_actions
DROP POLICY IF EXISTS "Allow public read mitigation" ON mitigation_actions;
CREATE POLICY "Allow public read mitigation" ON mitigation_actions
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow public insert mitigation" ON mitigation_actions;
CREATE POLICY "Allow public insert mitigation" ON mitigation_actions
  FOR INSERT TO anon
  WITH CHECK (true);

-- RLS Policies for pollution_alerts
DROP POLICY IF EXISTS "Allow public read alerts" ON pollution_alerts;
CREATE POLICY "Allow public read alerts" ON pollution_alerts
  FOR SELECT TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow public insert alerts" ON pollution_alerts;
CREATE POLICY "Allow public insert alerts" ON pollution_alerts
  FOR INSERT TO anon
  WITH CHECK (true);

-- Verify tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('aqi_readings', 'mitigation_actions', 'pollution_alerts');
