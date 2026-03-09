# Pollutree Monitor — Smart City AQI Dashboard

Real-time, ward-level air quality monitoring with AI-powered health advisories and an admin control panel.

## Features

**Citizen Dashboard** (`/citizen`)
- Live AQI, PM2.5, PM10, and Gas readings
- Interactive Leaflet map with color-coded ward markers
- AI health advisory powered by Gemini 2.0 Flash
- Floating AI chatbot for AQI queries
- Manual refresh (no auto-refresh)

**Admin Dashboard** (`/admin`)
- City-wide AQI map with all ward markers
- AI pollution source detection with contribution breakdown (Traffic, Road Dust, Biomass, Industrial, Construction)
- Live sensor monitoring table with scrollable history
- Pollution alerts panel + mitigation quick actions (sprinklers, traffic control)
- Most polluted / safest ward stats

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 2.0 Flash |
| Auth | Clerk |
| Maps | Leaflet.js + React Leaflet |
| Deployment | Vercel |

## Local Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Create `.env.local` in the project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/admin
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/admin
CLERK_TRUST_HOST=true
NEXT_PUBLIC_BASE_URL=http://localhost:3000
DB_NAME=your_database_name
CORS_ORIGINS=*
```

### 3. Database setup
Run in Supabase SQL editor:
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

## API Reference

### POST `/api/sensor` — Ingest sensor data
```json
{
  "ward_id": 1,
  "ward_name": "Anand Vihar",
  "pm25_level": 155.5,
  "pm10_level": 230.2,
  "gas_level": 12.4,
  "aqi_score": 210
}
```
Accepts both `ward_id` (integer) or `ward_name` (string — auto-resolved to ID).

### GET `/api/readings?limit=100` — Fetch latest readings
### GET `/api/advisory` — AI health advisory
### POST `/api/qna` — Chatbot query
```json
{ "question": "Should I go for a walk today?" }
```

## Ward ID Mapping

| ID | Ward |
|---|---|
| 1 | Anand Vihar |
| 2 | Connaught Place |
| 3 | Lodhi Road |
| 4 | Dwarka Sector 8 |
| 5 | R.K. Puram |
| 6 | Dashashwamedh |
| 7 | Cantt |
| 8 | Lanka |
| 9 | Sarnath |

## AQI Color Scale

| Range | Category | Color |
|---|---|---|
| 0–50 | Good | 🟢 Green |
| 51–100 | Moderate | 🟡 Yellow |
| 101–150 | Unhealthy for Sensitive Groups | 🟠 Orange |
| 151–200 | Unhealthy | 🔴 Red |
| 201–300 | Very Unhealthy | 🟣 Purple |
| 300+ | Hazardous | 🟤 Maroon |

## ESP32 Hardware Integration

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid      = "YOUR_WIFI_SSID";
const char* password  = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://your-app.vercel.app/api/sensor";

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    String payload = "{";
    payload += "\"ward_id\":1,";
    payload += "\"ward_name\":\"Anand Vihar\",";
    payload += "\"pm25_level\":" + String(readPM25()) + ",";
    payload += "\"pm10_level\":" + String(readPM10()) + ",";
    payload += "\"gas_level\":"  + String(readGas());
    payload += "}";

    http.POST(payload);
    http.end();
  }
  delay(60000);
}
```

## Deployment (Vercel)

1. Push code to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add all environment variables in **Settings → Environment Variables**
4. Deploy

> **Note:** Do not commit `.env.local` — it is already in `.gitignore`.

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── sensor/       # Sensor data ingestion
│   │   ├── readings/     # Fetch AQI data
│   │   ├── advisory/     # AI health advisory
│   │   └── qna/          # Chatbot endpoint
│   ├── citizen/          # Citizen dashboard
│   ├── admin/            # Admin dashboard
│   └── page.js           # Landing page
├── components/
│   ├── AQIMap.jsx
│   ├── AQITrendChart.jsx
│   └── Chatbot.jsx
├── lib/
│   ├── supabase.js
│   ├── aqiCalculator.js
│   └── pollutionDetector.js
└── middleware.js
```

## Troubleshooting

**Map not loading** — Verify dynamic import of AQIMap with `{ ssr: false }`

**Gemini errors** — Check `GEMINI_API_KEY` and model quota at [aistudio.google.com](https://aistudio.google.com)

**Sensor 500 error** — Ward name not in `WARD_NAME_TO_ID` map in `app/api/sensor/route.js` — add it

**Admin redirect loop** — Ensure Clerk keys are correctly set and `CLERK_TRUST_HOST=true`

---

Built with Next.js · Supabase · Gemini AI · Clerk · Leaflet
