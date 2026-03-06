-- =================================================
-- Smart City AQI Monitoring System - Database Setup
-- CORRECTED VERSION FOR SUPABASE
-- =================================================

-- Create aqi_readings table
CREATE TABLE IF NOT EXISTS aqi_readings (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ward_id INTEGER NOT NULL,
  pm25_level NUMERIC NOT NULL,
  pm10_level NUMERIC NOT NULL,
  gas_level NUMERIC NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_aqi_readings_ward_id ON aqi_readings(ward_id);
CREATE INDEX IF NOT EXISTS idx_aqi_readings_created_at ON aqi_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aqi_readings_ward_time ON aqi_readings(ward_id, created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE aqi_readings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access" ON aqi_readings;
DROP POLICY IF EXISTS "Allow public insert" ON aqi_readings;

-- Allow public read access (for citizen dashboard)
CREATE POLICY "Allow public read access" ON aqi_readings
  FOR SELECT TO anon
  USING (true);

-- Allow public insert (for ESP32 sensors)
CREATE POLICY "Allow public insert" ON aqi_readings
  FOR INSERT TO anon
  WITH CHECK (true);

-- Insert sample/test data for all 5 wards
INSERT INTO aqi_readings (ward_id, pm25_level, pm10_level, gas_level) VALUES
-- Ward 1: Cantt - Unhealthy
(1, 155.5, 230.2, 450.0),
-- Ward 2: Dashashwamedh - Very Unhealthy (Hazardous)
(2, 240.8, 310.5, 680.0),
-- Ward 3: Assi Ghat - Moderate
(3, 85.2, 120.5, 220.0),
-- Ward 4: Lanka - Unhealthy for Sensitive Groups
(4, 120.3, 180.7, 340.0),
-- Ward 5: Sigra - Good
(5, 45.6, 68.2, 150.0);

-- Verify the data was inserted
SELECT 
  id,
  ward_id,
  pm25_level,
  pm10_level,
  gas_level,
  created_at
FROM aqi_readings
ORDER BY created_at DESC;
