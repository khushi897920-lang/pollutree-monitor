# Smart City Hyperlocal AQI Monitoring System

🌆 Real-time ward-level air quality monitoring platform with AI-powered health advisories.

## 🚀 Features

### Citizen Dashboard (`/citizen`)
- Real-time AQI visualization
- PM2.5, PM10, and Gas level monitoring  
- AI-powered health advisory (Gemini 2.0 Flash)
- Interactive Leaflet map with color-coded ward markers
- Floating AI chatbot for AQI queries

### Admin Dashboard (`/admin`)
- Live city-wide AQI monitoring map
- Pollution alerts for wards exceeding safe levels
- Mitigation control panel (water sprinklers, traffic control)
- Real-time statistics and analytics
- Alert-based action dispatching

### API Endpoints

#### 1. Sensor Data Ingestion
```bash
POST /api/sensor
Content-Type: application/json

{
  "ward_id": 1,
  "pm25": 155.5,
  "pm10": 230.2,
  "gas": 450.0
}
```

#### 2. Fetch AQI Readings
```bash
GET /api/readings?limit=50&ward_id=1
```

#### 3. AI Health Advisory
```bash
GET /api/advisory?ward_id=1
```

#### 4. Chatbot Q&A
```bash
POST /api/qna
Content-Type: application/json

{
  "question": "What precautions should I take today?",
  "ward_id": 1
}
```

## 🛠️ Tech Stack

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui
- **Backend:** Next.js API Routes (Node.js)
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini 2.0 Flash
- **Maps:** Leaflet.js + React Leaflet
- **Deployment:** Vercel

## 📦 Installation

### 1. Clone & Install Dependencies

```bash
cd /app
yarn install
```

### 2. Environment Setup

The `.env` file is already configured with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mxxxbeuremwtebvenjem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSyD...
```

### 3. Database Setup

Follow the instructions in `SUPABASE_SETUP.md` to:
1. Create the `aqi_readings` table
2. Insert sample data
3. Set up indexes

**Quick Setup SQL:**

```sql
CREATE TABLE aqi_readings (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  ward_id INTEGER NOT NULL,
  pm25_level NUMERIC NOT NULL,
  pm10_level NUMERIC NOT NULL,
  gas_level NUMERIC NOT NULL
);

CREATE INDEX idx_aqi_readings_ward_id ON aqi_readings(ward_id);
CREATE INDEX idx_aqi_readings_created_at ON aqi_readings(created_at DESC);

-- Insert test data
INSERT INTO aqi_readings (ward_id, pm25_level, pm10_level, gas_level) VALUES
(1, 155.5, 230.2, 450.0),
(2, 240.8, 310.5, 680.0),
(3, 85.2, 120.5, 220.0),
(4, 120.3, 180.7, 340.0),
(5, 45.6, 68.2, 150.0);
```

### 4. Run Development Server

```bash
yarn dev
```

Access:
- **Home:** http://localhost:3000
- **Citizen Dashboard:** http://localhost:3000/citizen
- **Admin Dashboard:** http://localhost:3000/admin

## 🌐 Ward Locations

Example wards (Varanasi):

| Ward ID | Name | Coordinates |
|---------|------|-------------|
| 1 | Cantt | 25.3176, 82.9739 |
| 2 | Dashashwamedh | 25.3095, 83.0107 |
| 3 | Assi Ghat | 25.2820, 83.0105 |
| 4 | Lanka | 25.2677, 82.9913 |
| 5 | Sigra | 25.3176, 82.9913 |

## 🎨 AQI Color Coding

| AQI Range | Category | Color | Marker |
|-----------|----------|-------|--------|
| 0-50 | Good | Green | 🟢 |
| 51-100 | Moderate | Yellow | 🟡 |
| 101-150 | Unhealthy for Sensitive | Orange | 🟠 |
| 151-200 | Unhealthy | Red | 🔴 |
| 201-300 | Very Unhealthy | Purple | 🟣 |
| 300+ | Hazardous | Maroon | 🟤 |

## 🤖 ESP32 Integration

### Arduino/ESP32 Code Example

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "https://your-app.vercel.app/api/sensor";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Read sensor values
    float pm25 = readPM25Sensor();
    float pm10 = readPM10Sensor();
    float gas = readGasSensor();
    
    // Create JSON payload
    String jsonPayload = "{";
    jsonPayload += "\"ward_id\":1,";
    jsonPayload += "\"pm25\":" + String(pm25) + ",";
    jsonPayload += "\"pm10\":" + String(pm10) + ",";
    jsonPayload += "\"gas\":" + String(gas);
    jsonPayload += "}";
    
    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.println(httpResponseCode);
      Serial.println(response);
    }
    
    http.end();
  }
  
  delay(60000); // Send data every 60 seconds
}
```

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Deploy!

### Environment Variables

Make sure to add all required environment variables in Vercel Dashboard → Settings → Environment Variables.

## 📊 Database Schema

```sql
aqi_readings
├── id (bigint, primary key)
├── created_at (timestamp with timezone)
├── ward_id (integer)
├── pm25_level (numeric)
├── pm10_level (numeric)
└── gas_level (numeric)
```

## 🧪 Testing APIs

### Test Sensor Ingestion

```bash
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "ward_id": 1,
    "pm25": 155.5,
    "pm10": 230.2,
    "gas": 450.0
  }'
```

### Test Health Advisory

```bash
curl http://localhost:3000/api/advisory
```

### Test Chatbot

```bash
curl -X POST http://localhost:3000/api/qna \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Should I go for a morning walk today?"
  }'
```

## 📝 Project Structure

```
/app
├── app/
│   ├── api/
│   │   ├── sensor/route.js        # ESP32 data ingestion
│   │   ├── readings/route.js      # Fetch AQI readings
│   │   ├── advisory/route.js      # AI health advisory
│   │   └── qna/route.js           # Chatbot endpoint
│   ├── citizen/page.js            # Citizen dashboard
│   ├── admin/page.js              # Admin dashboard
│   ├── page.js                    # Landing page
│   ├── layout.js                  # Root layout
│   └── globals.css                # Global styles
├── components/
│   ├── AQIMap.jsx                 # Leaflet map component
│   ├── Chatbot.jsx                # Floating chatbot
│   └── ui/                        # shadcn/ui components
├── lib/
│   ├── supabase.js                # Supabase client
│   ├── gemini.js                  # Gemini AI integration
│   └── aqiCalculator.js           # AQI calculation utilities
└── package.json
```

## 🎯 Key Features

✅ Real-time sensor data ingestion from ESP32  
✅ Supabase PostgreSQL storage  
✅ Ward-level AQI visualization on interactive maps  
✅ Color-coded markers (Green/Yellow/Orange/Red)  
✅ AI health advisories using Gemini 2.0 Flash  
✅ Floating chatbot for citizen queries  
✅ Admin alert system for high pollution wards  
✅ Mitigation control panel  
✅ Dark glassmorphism UI  
✅ Fully responsive design  
✅ Auto-refresh every 30 seconds  

## 🔧 Troubleshooting

### Map Not Loading
- Ensure Leaflet CSS is loaded in `layout.js`
- Check browser console for errors
- Verify dynamic import of Leaflet components

### Gemini API Errors
- Verify `GEMINI_API_KEY` is correct
- Check API quota limits
- Ensure model name is `gemini-2.0-flash-exp`

### Supabase Connection Issues
- Verify URL and anon key
- Check table exists and has data
- Review Supabase logs in dashboard

## 📄 License

MIT License - Built for Smart City Initiative

---

**Built with ❤️ using Next.js, Supabase, and Gemini AI**
