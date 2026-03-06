-- ===================================================
-- Update AQI Data for Delhi Localities
-- ===================================================

-- First, clear existing Varanasi data
DELETE FROM aqi_readings;

-- Insert realistic Delhi AQI data
-- Delhi typically has higher pollution levels
INSERT INTO aqi_readings (ward_id, pm25_level, pm10_level, gas_level) VALUES
-- Ward 1: Connaught Place - Very Unhealthy (Central commercial area)
(1, 180.5, 250.8, 520.0),

-- Ward 2: Rohini - Unhealthy (Residential area in North-West)
(2, 145.2, 195.5, 380.0),

-- Ward 3: Dwarka - Moderate (Planned residential area)
(3, 95.8, 135.2, 280.0),

-- Ward 4: Mayur Vihar - Unhealthy for Sensitive Groups (East Delhi)
(4, 125.3, 170.7, 340.0),

-- Ward 5: Nehru Place - Very Unhealthy (Heavy traffic commercial hub)
(5, 195.6, 280.2, 580.0);

-- Verify the data
SELECT 
  ward_id,
  CASE ward_id
    WHEN 1 THEN 'Connaught Place'
    WHEN 2 THEN 'Rohini'
    WHEN 3 THEN 'Dwarka'
    WHEN 4 THEN 'Mayur Vihar'
    WHEN 5 THEN 'Nehru Place'
  END as ward_name,
  pm25_level,
  pm10_level,
  gas_level,
  created_at
FROM aqi_readings
ORDER BY ward_id;
