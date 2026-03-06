# 🚀 QUICK START GUIDE - Supabase Database Setup

## ⚠️ IMPORTANT: Database Setup Required

Your application is built and running, but you need to create the database table in Supabase first!

---

## 📝 Step-by-Step Setup

### Step 1: Go to Supabase SQL Editor

1. Open: https://supabase.com/dashboard/project/mxxxbeuremwtebvenjem/editor
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy & Paste This Complete SQL Script

```sql
-- =================================================
-- Smart City AQI Monitoring System - Database Setup
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

-- Allow public read access (for citizen dashboard)
CREATE POLICY IF NOT EXISTS "Allow public read access" ON aqi_readings
  FOR SELECT TO anon
  USING (true);

-- Allow public insert (for ESP32 sensors)
CREATE POLICY IF NOT EXISTS "Allow public insert" ON aqi_readings
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
```

### Step 3: Run the Query

1. After pasting the SQL above, click **RUN** button (or press Ctrl+Enter)
2. You should see **"Success. No rows returned"** message
3. Scroll down to see the verification results showing your 5 sample records

### Step 4: Verify Table Creation

Run this simple check:

```sql
SELECT COUNT(*) as total_records FROM aqi_readings;
```

You should see: `total_records: 5`

---

## ✅ Verification Checklist

After running the SQL script, check these:

- [ ] Table `aqi_readings` created successfully
- [ ] 5 sample records inserted (wards 1-5)
- [ ] Indexes created (for performance)
- [ ] RLS policies enabled (for security)

---

## 🎯 What Happens Next?

Once the table is created:

1. **Refresh your application** at:
   - Home: http://localhost:3000
   - Citizen Dashboard: http://localhost:3000/citizen
   - Admin Dashboard: http://localhost:3000/admin

2. **You should see:**
   - ✅ Real-time AQI data from all 5 wards
   - ✅ Color-coded map markers (green/yellow/orange/red)
   - ✅ AI health advisory from Gemini
   - ✅ Working chatbot
   - ✅ Admin alerts for high-pollution wards

---

## 🧪 Testing ESP32 Sensor Integration

After database setup, test the sensor API:

```bash
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "ward_id": 1,
    "pm25": 175.5,
    "pm10": 245.0,
    "gas": 500.0
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Sensor data received and stored",
  "data": { ... }
}
```

---

## 📍 Ward Locations Reference

| Ward ID | Ward Name | Coordinates | Sample AQI |
|---------|-----------|-------------|------------|
| 1 | Cantt | 25.3176, 82.9739 | 155 (Unhealthy) |
| 2 | Dashashwamedh | 25.3095, 83.0107 | 240 (Hazardous) |
| 3 | Assi Ghat | 25.2820, 83.0105 | 85 (Moderate) |
| 4 | Lanka | 25.2677, 82.9913 | 120 (USG) |
| 5 | Sigra | 25.3176, 82.9913 | 46 (Good) |

---

## 🆘 Troubleshooting

### Issue: "Table already exists" error
**Solution:** The table is created! Just run the INSERT statements separately.

### Issue: "Permission denied" error
**Solution:** Make sure you're logged into the correct Supabase project.

### Issue: Can't see SQL Editor
**Solution:** Go to: Dashboard → Your Project → SQL Editor (left sidebar)

### Issue: RLS policy conflicts
**Solution:** Drop existing policies first:
```sql
DROP POLICY IF EXISTS "Allow public read access" ON aqi_readings;
DROP POLICY IF EXISTS "Allow public insert" ON aqi_readings;
```
Then re-run the policy creation commands.

---

## 🔗 Quick Links

- **Supabase Dashboard:** https://supabase.com/dashboard/project/mxxxbeuremwtebvenjem
- **SQL Editor:** https://supabase.com/dashboard/project/mxxxbeuremwtebvenjem/editor
- **Table Editor:** https://supabase.com/dashboard/project/mxxxbeuremwtebvenjem/editor
- **API Docs:** https://supabase.com/dashboard/project/mxxxbeuremwtebvenjem/api

---

## 🎉 Once Setup is Complete

Your Smart City AQI Monitoring System will be fully functional with:

✅ Real-time sensor data ingestion  
✅ AI-powered health advisories (Gemini 2.0 Flash)  
✅ Interactive ward-level maps  
✅ Citizen & Admin dashboards  
✅ Floating chatbot  
✅ Pollution alerts  
✅ Mitigation controls  

**Ready to monitor your city's air quality! 🌍💨**
