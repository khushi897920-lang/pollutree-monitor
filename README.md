# 🌳 Pollutree Monitor

### Reclaiming our right to breathe, one neighborhood at a time. A hyper-local AQI intelligence system for Indian cities.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-brightgreen?style=flat-square&logo=vercel)](https://pollutree-monitor.vercel.app)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-blue?style=flat-square&logo=supabase)
![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Advisories-orange?style=flat-square&logo=google-gemini)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)
![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=flat-square)

---

In India, air pollution is not just a seasonal headline; it's a persistent, structural civic emergency. Yet, city-wide averages obscure the reality—masking toxic, localized hotspots under a blanket of generic municipal AQI scores. **Pollutree Monitor** is built to break through these blind spots. By pairing low-cost, open-source ESP32 IoT hardware with an AI-enriched live dashboard, it democratizes access to ward-level air quality data. Pollutree translates raw dust and gas readings into immediate, Gemini-powered health recommendations and automated source detection, giving citizens and local leaders the data they need to protect their health and demand accountability.

> 🚀 **Live Demo:** [pollutree-monitor.vercel.app](https://pollutree-monitor.vercel.app)

> 📸 Screenshots coming soon — PRs with screenshots welcome!

---

## ✨ Features

### 👤 Citizen Dashboard (`/citizen`) — *Democratizing Data*
* 🌡️ **Live Ward-Level Pulse:** Real-time AQI scores, color-coded by severity, giving you visibility into the exact air your neighborhood is breathing.
* 🧪 **Granular Sensor Breakdown:** Real-time metrics for PM2.5, PM10, and hazardous gas levels collected straight from local physical monitors.
* 🗺️ **Interactive Neighborhood Heatmap:** A beautiful, responsive Leaflet.js map dotted with live, color-coded markers for each monitored ward.
* 🧠 **Gemini-Powered Health Advisories:** Smarter, hyper-local safety recommendations powered by Gemini AI, with a bulletproof rule-based fallback system for when API quotas get tight.
* 📈 **AQI Trendlines:** Interactive Recharts trendlines mapping historical shifts to help you identify patterns and peak spike times.
* 🚨 **Active Alert Panel:** Instantly flags wards that breach the critical AQI 100 threshold so communities can stay informed.
* 💬 **Floating AI Chatbot:** Ask natural language questions like *"Is it safe to go for a run in Lodhi Road?"* or *"Explain what PM2.5 does"* and get immediate answers.

### 🛡️ Admin Dashboard (`/admin`) — *Municipal Action Center (Auth Protected)*
* 📊 **City-Wide Control Center:** A consolidated overview tracking active alerts, safest zones, and total active reporting nodes.
* 📍 **Spatial Tracking:** Admin-exclusive spatial visualizations to monitor sensor coverage.
* 🔍 **AI-Driven Source Detection:** Algorithmically guesses the most likely pollution source (e.g., construction dust, industrial exhaust, biomass burning, traffic) based on particulate/gas ratio analysis.
* 📝 **Real-Time Data Table:** A scrollable, live data grid displaying every reading with instant AQI conversion and microsecond timestamps.
* ⚡ **Mitigation Quick Actions:** Instant administrative buttons to deploy road water sprinklers or trigger traffic diversion systems in critical wards.

---

## 🛠️ Tech Stack & Architecture Choices

| Layer | Technology | Why we chose it |
|---|---|---|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, shadcn/ui | Blazing fast page loads, clean responsive design, and highly reusable components for a modern look. |
| **Backend** | Next.js App Router API Routes | Quick, serverless API endpoints to ingest sensor data and serve frontends without managing complex servers. |
| **Database** | Supabase (PostgreSQL) | Instant PostgreSQL database with RESTful APIs, perfect for continuous time-series sensor ingestion. |
| **AI** | Google Gemini 2.5 Flash | Lightning-fast token generation to provide real-time, context-aware health advisories and chatbot Q&As. |
| **Auth** | Clerk (role-based) | Zero-fuss user authentication and role management to securely protect the administrative dashboard. |
| **Maps** | Leaflet.js + React Leaflet | Open-source, lightweight map components without the heavy page loads and pricing of proprietary map APIs. |
| **Charts** | Recharts | Declarative, interactive React charts that make historical AQI trendlines clean and readable. |
| **Deployment** | Vercel | Seamless continuous integration and sub-second cold starts for serverless routes. |

---

## 🏗️ Architecture Overview

The system operates on an automated ingestion and delivery loop, routing physical particulate readings to live web clients and AI advisory layers in seconds:

```
          ┌──────────────────────────────────┐
          │     ESP32 IoT Physical Sensor    │
          │  (MQ-135 Gas / PMS5003 PM Sensor)│
          └────────────────┬─────────────────┘
                           │
                           │ POST /api/sensor (JSON Payload)
                           ▼
          ┌──────────────────────────────────┐
          │    Next.js /api/sensor Route     │
          │   (Server-side AQI calculation)  │
          └────────────────┬─────────────────┘
                           │
                           │ Store reading
                           ▼
          ┌──────────────────────────────────┐
          │     Supabase Database (Postgres)  │
          └──────────┬──────────────────────┬┘
                     │                      │
                     │ GET /api/readings    │ Run AI context queries
                     ▼                      ▼
          ┌─────────────────────┐   ┌─────────────────────┐
          │  Citizen & Admin    │   │  Gemini 2.5 Flash   │
          │  Dashboards (UI)    │◄──┤ (/api/advisory, QnA)│
          └─────────────────────┘   └─────────────────────┘
```

---

## ⚙️ Local Setup

### Quick Start (TL;DR)
Get the app running locally in 4 commands:
```bash
git clone https://github.com/yourusername/pollutree-monitor.git
cd pollutree-monitor
npm install
npm run dev
```

---

### Step-by-Step Installation

#### 📦 Clone & Install
```bash
git clone https://github.com/yourusername/pollutree-monitor.git
cd pollutree-monitor
npm install
```

#### 🔑 Configure Environment
Create a `.env.local` file in the project root with the following keys:
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
> [!WARNING]
> Never commit `.env.local` to public repositories. It is already included in `.gitignore`.

#### 🗄️ Initialize Database Schema
Execute the following SQL queries inside your Supabase SQL Editor to set up the readings table and optimize indexes:
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

#### 🚀 Spin Up Development Server
```bash
npm run dev
```

Navigate to:
| Page | URL |
|---|---|
| 🏠 Home | [http://localhost:3000](http://localhost:3000) |
| 👤 Citizen | [http://localhost:3000/citizen](http://localhost:3000/citizen) |
| 🛡️ Admin | [http://localhost:3000/admin](http://localhost:3000/admin) |

---

## 🔌 ESP32 Hardware Integration

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
* MQ-135 (Gas / VOC)
* PMS5003 / SDS011 (PM2.5 + PM10)

> [!TIP]
> **Don't have hardware?** Use our mock sensor script to simulate data locally:
> ```bash
> node sensor-simulator.js
> ```
> Or send a one-off mock reading using `curl`:
> ```bash
> curl -X POST http://localhost:3000/api/sensor \
>   -H "Content-Type: application/json" \
>   -d '{"ward_id": 1, "ward_name": "Anand Vihar", "pm25": 145.2, "pm10": 210.5, "gas_level": 350.0}'
> ```

---

## 📡 API Reference

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

**Response (Success):**
Returns `{ "success": true, "data": { ...inserted_row } }` on success.

> [!NOTE]
> The API also accepts `ward_name` alone (without `ward_id`) — it will auto-resolve to the correct ward ID.

---

### `GET /api/readings?limit=100` — Fetch latest readings
**Response (Success):**
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
* Uses Gemini 2.5 Flash when available.
* Falls back to a rule-based advisory based on the AQI tier if Gemini is rate-limited or unavailable.
* Results are cached for 10 minutes to prevent excessive API calls.

---

### `POST /api/qna` — Chatbot
**Request:**
```json
{ "question": "Is it safe to go for a run today?" }
```
**Response:**
Returns `{ "success": true, "answer": "..." }`.
If Gemini is unavailable, returns a rule-based answer based on current AQI data.

---

## 📌 Ward ID Mapping

Only wards with these IDs will appear on the dashboard:

| ID | Ward Name |
|---|---|
| 1 | Anand Vihar |
| 2 | Connaught Place |
| 3 | Lodhi Road |
| 4 | Dwarka Sector 8 |
| 5 | R.K. Puram |

> [!NOTE]
> To add new wards, update the `WARD_NAME_TO_ID` map in `app/api/sensor/route.js` and `wardMapping` in `app/api/readings/route.js`.

---

## 🎨 AQI Color Scale

| Range | Category | Color |
|---|---|---|
| 0–50 | Good | 🟢 Green |
| 51–100 | Moderate | 🟡 Yellow |
| 101–150 | Unhealthy for Sensitive Groups | 🟠 Orange |
| 151–200 | Unhealthy | 🔴 Red |
| 201–300 | Very Unhealthy | 🟣 Purple |
| 300+ | Hazardous | 🟤 Maroon |

---

## 📂 Project Structure

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

## 📦 Deployment (Vercel)

1. Push code to GitHub.
2. Import repo at [vercel.com](https://vercel.com).
3. Add all environment variables in **Settings → Environment Variables**.
4. Deploy — Vercel auto-redeploys on every push to `main`.

---

## 🔍 Troubleshooting

| Issue | Fix |
|---|---|
| Map not loading | AQIMap uses `dynamic(..., { ssr: false })` — verify this is in place |
| Advisory always shows fallback text | Gemini free tier quota exhausted — resets per minute. Check [aistudio.google.com](https://aistudio.google.com) |
| Sensor POST returns 400 | `ward_id` not in range 1–5, or `pm25` field missing |
| Admin redirects to sign-in | Clerk keys not set or `CLERK_TRUST_HOST=true` missing in env vars |
| "Audit Ward" appears in readings | Old test data in Supabase with correct ward_id but wrong name — safe to delete from Supabase table |

---

## 🤝 Contributing to Pollutree Monitor

We welcome contributors of all skill levels — whether you fix a typo or build a full feature. Let's build a healthier, more transparent civic ecosystem together.

### 🌟 Good First Issues
If you are looking to get your feet wet, try starting with these:
* 🏙️ **Add more Indian cities/wards** to the ward mapping in `app/api/sensor/route.js` and `app/api/readings/route.js`.
* 📱 **Improve mobile responsiveness** of the citizen dashboard (responsive maps and chart containers).
* 🧪 **Write unit tests** for `aqiCalculator.js` to ensure the EPA AQI formula works flawlessly under various inputs.
* 📦 **Add PWA support** (manifest + service worker setup) to allow installing the dashboard on mobile.
* 🗣️ **Translate UI strings to Hindi** (or other regional Indian languages) to make data accessible to local residents.
* 🌙 **Add a Dark Mode toggle** using Tailwind theme classes for night-time reading.

### 🚀 Intermediate Issues
Ready for a slightly larger challenge?
* 📅 **Add historical AQI trend comparison** (e.g. week-over-week or month-over-month graphs).
* 🔔 **Build a ward-level alert notification system** to send automated emails or SMS warnings using Resend or Twilio.
* 📊 **Add export to CSV** in the admin readings table to help researchers download historical records.

### 🛠️ How to Contribute
1. **Fork the Repository:** Click the 'Fork' button at the top right of this page.
2. **Create a Branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. **Commit with Conventions:** Make your changes, following conventional commits:
   ```bash
   git commit -m "feat: add dark mode toggle"
   ```
4. **Push & Open a PR:** Push changes to your fork and submit a Pull Request against our `main` branch.
5. **PR Template:** Fill out the PR template detail sheets completely.

### 📋 Pull Request Guidelines
* Keep pull requests small, clean, and highly focused on a single issue.
* Always add before/after screenshots or screen recordings for UI changes.
* **Do not** commit `.env.local` or any API keys.
* Respect existing codebase formatting (ESLint + Prettier).

### 🤝 Code of Conduct
Be kind, welcoming, and constructive. We are building this for public good. Harassment of any kind, dismissive behavior, or toxic comments will not be tolerated. Let's make breathing easier for everyone, together!

### 🏆 Recognition
All contributors will be credited in the README Contributors section. We appreciate your brainpower!

---

## 🌍 Roadmap

- [x] **Phase 1 (Current):** Real-time AQI tracking, Gemini-powered health advisories, physical ESP32 sensor integration, and admin mitigation center ✅
- [ ] **Phase 2 (In Progress):** Mobile app (React Native / Expo), historical analytics charts, and SMS alerts 🔄
- [ ] **Phase 3 (Planned):** Public OpenAPI for third-party integrations, regional language translations, and wider national ward coverage 📋

---

## 👥 Contributors

Thanks to these wonderful people:

<!-- Add your name here via a PR! -->

Built with ❤️ by Khushi and open-source contributors.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Made for India 🇮🇳 · Built at India Innovates 2026 · Powered by open source
</p>
