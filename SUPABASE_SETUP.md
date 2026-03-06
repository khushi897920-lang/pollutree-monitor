# Supabase Database Setup

## Step 1: Create the `aqi_readings` Table

Go to your Supabase Dashboard → SQL Editor and run this query:

```sql
-- Create aqi_readings table
CREATE TABLE aqi_readings (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ward_id INTEGER NOT NULL,
  pm25_level NUMERIC NOT NULL,
  pm10_level NUMERIC NOT NULL,
  gas_level NUMERIC NOT NULL
);

-- Create index for faster queries
CREATE INDEX idx_aqi_readings_ward_id ON aqi_readings(ward_id);
CREATE INDEX idx_aqi_readings_created_at ON aqi_readings(created_at DESC);

-- Optional: Create a compound index for ward + time queries
CREATE INDEX idx_aqi_readings_ward_time ON aqi_readings(ward_id, created_at DESC);
```

## Step 2: Enable Realtime (Optional)

If you want real-time updates, enable realtime for the table:

1. Go to Database → Replication
2. Find `aqi_readings` table
3. Enable replication

## Step 3: Insert Sample Data (For Testing)

```sql
-- Insert sample sensor data for testing
INSERT INTO aqi_readings (ward_id, pm25_level, pm10_level, gas_level) VALUES
(1, 155.5, 230.2, 450.0),  -- Cantt - Unhealthy
(2, 240.8, 310.5, 680.0),  -- Dashashwamedh - Very Unhealthy
(3, 85.2, 120.5, 220.0),   -- Assi Ghat - Moderate
(4, 120.3, 180.7, 340.0),  -- Lanka - Unhealthy for Sensitive
(5, 45.6, 68.2, 150.0);    -- Sigra - Good

-- Verify data
SELECT * FROM aqi_readings ORDER BY created_at DESC;
```

## Step 4: Set Row Level Security (Optional - For Production)

For MVP, you can skip this. For production:

```sql
-- Enable RLS
ALTER TABLE aqi_readings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON aqi_readings
  FOR SELECT TO public
  USING (true);

-- Allow authenticated insert (for ESP32)
CREATE POLICY "Allow authenticated insert" ON aqi_readings
  FOR INSERT TO authenticated
  WITH CHECK (true);
```

## Database Schema

```
aqi_readings
├── id (bigint, primary key)
├── created_at (timestamp with timezone)
├── ward_id (integer)
├── pm25_level (numeric)
├── pm10_level (numeric)
└── gas_level (numeric)
```

## Testing the Database

After creating the table and inserting sample data, your application should automatically fetch and display the data on both citizen and admin dashboards.
