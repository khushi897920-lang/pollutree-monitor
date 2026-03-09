# Pollutree Monitor — Smart City AQI Dashboard

Real-time, ward-level air quality monitoring with AI-powered health advisories, a floating chatbot, and an admin control center.

> 🚀 **Live Demo:** [pollutree-monitor.vercel.app](https://pollutree-monitor.vercel.app)

---

## Features

### Citizen Dashboard (`/citizen`)
- Live AQI score display with color-coded category badge
- PM2.5, PM10, and Gas Level sensor readings
- Interactive ward map (Leaflet.js) with color-coded markers per AQI level
- AI Health Advisory — powered by Gemini, with smart rule-based fallback when quota is limited
- AQI trend chart over time
- Pollution alert panel for wards crossing AQI 100
- Floating AI chatbot for natural language AQI queries

### Admin Dashboard (`/admin`) — Auth Protected
- City-wide AQI overview: total wards, most polluted, safest ward, active alert count
- Live city map with all ward markers
- AI Pollution Source Detection — identifies traffic, road dust, biomass burning, industrial exhaust, and construction dust based on sensor ratios
- Scrollable live sensor monitoring table with per-ward PM2.5, PM10, Gas, AQI, and timestamp
- Mitigation quick-action buttons (Deploy Sprinklers, Traffic Control) per alert ward

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React 18, Tailwind CSS, shadcn/ui |
| Backend | Next.js App Router API Routes |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 2.5 Flash |
| Auth | Clerk (role-based — admin protected) |
| Maps | Leaflet.js + React Leaflet |
| Charts | Recharts |
| Deployment | Vercel |

---

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment Variables
Create `.env.local` in the project root:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
CLERK_TRUST_HOST=true

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> ⚠️ Never commit `.env.local` — it is in `.gitignore`.

### 3. Supabase Database Setup
Run in the Supabase SQL editor:
```sql
CREATE TABLE aqi_readings (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ward_id     INTEGER NOT NULL,
  ward_name   TEXT,
  pm25_level  NUMERIC NOT NULL,
  pm10_level  NUMERIC,
  gas_level   NUMERIC,
  aqi_score   NUMERIC
);

CREATE INDEX idx_aqi_ward    ON aqi_readings(ward_id);
CREATE INDEX idx_aqi_created ON aqi_readings(created_at DESC);
```

### 4. Run dev server
```bash
npm run dev
```

| Page | URL |
|---|---|
| Home | http://localhost:3000 |
| Citizen | http://localhost:3000/citizen |
| Admin | http://localhost:3000/admin |

---

## API Reference

### `POST /api/sensor` — Ingest sensor data from hardware
Send JSON with sensor readings. The API accepts both `pm25` / `pm25_level` and `pm10` / `pm10_level` field names interchangeably.

```json
{
  "ward_id": 1,
  "ward_name": "Anand Vihar",
  "pm25": 155.5,
  "pm10": 230.2,
  "gas_level": 12.4,
  "aqi_score": 210
}
```

Returns `{ "success": true, "data": { ...inserted_row } }` on success.

> The API also accepts `ward_name` alone (without `ward_id`) — it will auto-resolve to the correct ward ID.

---

### `GET /api/readings?limit=100` — Fetch latest readings
Returns:
```json
{
  "success": true,
  "latestByWard": [ ...one entry per ward ],
  "readings": [ ...all readings ]
}
```
AQI is computed server-side using the EPA PM2.5 formula, ensuring consistent values across the UI.

---

### `GET /api/advisory` — AI Health Advisory
Returns a natural language health advisory based on the latest AQI reading.
- Uses Gemini 2.5 Flash when available
- Falls back to rule-based advisory based on AQI tier if Gemini is rate-limited or unavailable
- Results are cached for 10 minutes to prevent excessive API calls

---

### `POST /api/qna` — Chatbot
```json
{ "question": "Is it safe to go for a run today?" }
```
Returns `{ "success": true, "answer": "..." }`.
If Gemini is unavailable, returns a rule-based answer based on current AQI data.

---

## Ward ID Mapping

Only wards with these IDs will appear on the dashboard:

| ID | Ward Name |
|---|---|
| 1 | Anand Vihar |
| 2 | Connaught Place |
| 3 | Lodhi Road |
| 4 | Dwarka Sector 8 |
| 5 | R.K. Puram |

> To add new wards, update the `WARD_NAME_TO_ID` map in `app/api/sensor/route.js` and `wardMapping` in `app/api/readings/route.js`.

---

## AQI Color Scale

| Range | Category | Color |
|---|---|---|
| 0–50 | Good | 🟢 Green |
| 51–100 | Moderate | 🟡 Yellow |
| 101–150 | Unhealthy for Sensitive Groups | 🟠 Orange |
| 151–200 | Unhealthy | 🔴 Red |
| 201–300 | Very Unhealthy | 🟣 Purple |
| 300+ | Hazardous | 🟤 Maroon |

---

## ESP32 Hardware Integration

Flash this sketch to your ESP32 to push sensor data to the live dashboard every 60 seconds.

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid      = "YOUR_WIFI_SSID";
const char* password  = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://your-app.vercel.app/api/sensor";

// Set the ward this sensor belongs to
const int   WARD_ID   = 1;
const char* WARD_NAME = "Anand Vihar";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  Serial.println("WiFi connected");
}

float readPM25()  { return 95.3;  } // Replace with actual sensor read
float readPM10()  { return 140.2; } // Replace with actual sensor read
float readGas()   { return 310.0; } // Replace with actual sensor read

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["ward_id"]   = WARD_ID;
    doc["ward_name"] = WARD_NAME;
    doc["pm25"]      = readPM25();
    doc["pm10"]      = readPM10();
    doc["gas_level"] = readGas();

    String payload;
    serializeJson(doc, payload);

    int code = http.POST(payload);
    Serial.printf("Sensor POST → HTTP %d\n", code);
    http.end();
  }
  delay(60000); // Send every 60 seconds
}
```

**Sensors tested with:**
- MQ-135 (Gas / VOC)
- PMS5003 / SDS011 (PM2.5 + PM10)

---

## Project Structure

```
pollutree-monitor/
├── app/
│   ├── api/
│   │   ├── sensor/         # POST — hardware data ingestion
│   │   ├── readings/       # GET  — fetch & transform AQI data
│   │   ├── advisory/       # GET  — AI health advisory (cached 10 min)
│   │   └── qna/            # POST — chatbot Q&A
│   ├── citizen/            # Citizen-facing dashboard
│   ├── admin/              # Admin control center (Clerk-protected)
│   └── page.js             # Landing / home page
├── components/
│   ├── AQIMap.jsx          # Leaflet map with ward markers
│   ├── AQITrendChart.jsx   # Recharts trend line
│   └── Chatbot.jsx         # Floating chat widget
├── lib/
│   ├── supabase.js         # Supabase client
│   ├── gemini.js           # Gemini AI + fallback logic
│   ├── aqiCalculator.js    # EPA AQI formula + color scale
│   └── pollutionDetector.js# AI-based source detection logic
└── middleware.js            # Clerk auth — protects /admin
```

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables in **Settings → Environment Variables**
4. Deploy — Vercel auto-redeploys on every push to `main`

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Map not loading | AQIMap uses `dynamic(..., { ssr: false })` — verify this is in place |
| Advisory always shows fallback text | Gemini free tier quota exhausted — resets per minute. Check [aistudio.google.com](https://aistudio.google.com) |
| Sensor POST returns 400 | `ward_id` not in range 1–5, or `pm25` field missing |
| Admin redirects to sign-in | Clerk keys not set or `CLERK_TRUST_HOST=true` missing in env vars |
| "Audit Ward" appears in readings | Old test data in Supabase with correct ward_id but wrong name — safe to delete from Supabase table |

---

Built with Next.js · Supabase · Gemini AI · Clerk · Leaflet · Recharts
