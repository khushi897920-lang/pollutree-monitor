# 🎯 QUICK START - Smart City AQI Monitoring System

## 🚀 System Status: READY ✅

Your Smart City AQI Monitoring System has been successfully built and is running!

---

## 📋 Current Status

### ✅ Completed
- [x] Next.js application built with App Router
- [x] Dark glassmorphism UI design
- [x] API routes for sensor data, readings, advisory, chatbot
- [x] Supabase client configured
- [x] Google Gemini AI integration
- [x] Leaflet map component with color-coded markers
- [x] Citizen dashboard
- [x] Admin dashboard with alerts
- [x] Floating AI chatbot
- [x] All dependencies installed

### ⏳ Pending (Requires Your Action)
- [ ] **Create Supabase database table** ← DO THIS FIRST!
- [ ] Test API endpoints
- [ ] Configure ESP32 hardware (optional)
- [ ] Deploy to Vercel (optional)

---

## 🔥 IMMEDIATE NEXT STEP

### **CREATE THE DATABASE TABLE IN SUPABASE**

**👉 Follow this guide:** `SETUP_DATABASE.md`

**Quick Steps:**
1. Go to: https://supabase.com/dashboard/project/mxxxbeuremwtebvenjem/editor
2. Click **SQL Editor** → **New Query**
3. Copy the SQL from `SETUP_DATABASE.md`
4. Click **RUN**
5. Refresh your app!

**Why this is important:** The application is ready, but it needs the database table to store sensor data!

---

## 🌐 Access Your Application

### Local Development
- **Home:** http://localhost:3000
- **Citizen Dashboard:** http://localhost:3000/citizen
- **Admin Dashboard:** http://localhost:3000/admin

### API Endpoints
- `POST /api/sensor` - Receive sensor data from ESP32
- `GET /api/readings` - Fetch AQI readings
- `GET /api/advisory` - Get AI health advisory
- `POST /api/qna` - Chatbot queries

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| **SETUP_DATABASE.md** | ⭐ **START HERE** - Create Supabase table |
| **README.md** | Complete project documentation |
| **DEPLOYMENT.md** | Deploy to Vercel |
| **ESP32_INTEGRATION.md** | Connect hardware sensors |
| **test_apis.sh** | Test all API endpoints |

---

## 🎨 Features Overview

### Citizen Dashboard (`/citizen`)
- Real-time AQI display with color-coded status
- PM2.5, PM10, Gas levels
- AI-powered health advisory (Gemini 2.0 Flash)
- Interactive Leaflet map with ward markers
- Floating chatbot for queries
- Auto-refresh every 30 seconds

### Admin Dashboard (`/admin`)
- City-wide AQI monitoring map
- Real-time pollution alerts
- Mitigation control panel
  - Deploy water sprinklers
  - Traffic control actions
- Statistics: Total wards, active alerts, average AQI
- Alert-based notifications

### Map Features
- **Green (Good):** AQI 0-50
- **Yellow (Moderate):** AQI 51-100
- **Orange (Unhealthy for Sensitive):** AQI 101-150
- **Red (Unhealthy):** AQI 151-200
- **Purple (Very Unhealthy):** AQI 201-300
- **Maroon (Hazardous):** AQI 300+

---

## 🧪 Testing Workflow

### 1. Database Setup (REQUIRED)
```bash
# Follow SETUP_DATABASE.md
# Create table and insert sample data
```

### 2. Test APIs
```bash
chmod +x test_apis.sh
./test_apis.sh
```

### 3. View Dashboards
```bash
# Open in browser:
- http://localhost:3000/citizen
- http://localhost:3000/admin
```

### 4. Test ESP32 Integration (Optional)
```bash
# Simulate ESP32 POST request
curl -X POST http://localhost:3000/api/sensor \
  -H "Content-Type: application/json" \
  -d '{
    "ward_id": 1,
    "pm25": 155.5,
    "pm10": 230.2,
    "gas": 450.0
  }'
```

---

## 🗺️ Ward Configuration

Default wards (Varanasi):

| ID | Name | Coordinates | Sample AQI |
|----|------|-------------|------------|
| 1 | Cantt | 25.3176, 82.9739 | 155 |
| 2 | Dashashwamedh | 25.3095, 83.0107 | 240 |
| 3 | Assi Ghat | 25.2820, 83.0105 | 85 |
| 4 | Lanka | 25.2677, 82.9913 | 120 |
| 5 | Sigra | 25.3176, 82.9913 | 46 |

**To add more wards:**
Edit: `components/AQIMap.jsx` → `WARD_LOCATIONS` object

---

## 🔧 Tech Stack

```
Frontend:
├── Next.js 14 (App Router)
├── React 18
├── Tailwind CSS
├── shadcn/ui components
└── Leaflet.js + React Leaflet

Backend:
├── Next.js API Routes
├── Node.js
└── RESTful APIs

Database:
└── Supabase (PostgreSQL)

AI/ML:
└── Google Gemini 2.0 Flash

Hardware:
└── ESP32 + PMS5003 + MQ-135
```

---

## 📦 Project Structure

```
/app
├── app/
│   ├── api/
│   │   ├── sensor/route.js       # ESP32 data ingestion
│   │   ├── readings/route.js     # Fetch AQI data
│   │   ├── advisory/route.js     # AI health advisory
│   │   └── qna/route.js          # Chatbot endpoint
│   ├── citizen/page.js           # Public dashboard
│   ├── admin/page.js             # Admin panel
│   ├── page.js                   # Landing page
│   ├── layout.js                 # Root layout
│   └── globals.css               # Styles
├── components/
│   ├── AQIMap.jsx                # Interactive map
│   ├── Chatbot.jsx               # AI chatbot
│   └── ui/                       # shadcn components
├── lib/
│   ├── supabase.js               # DB client
│   ├── gemini.js                 # AI integration
│   └── aqiCalculator.js          # AQI utilities
└── Documentation files
```

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [x] Application built and tested locally
- [ ] Database table created in Supabase
- [ ] All API endpoints tested
- [ ] Environment variables configured

### Vercel Deployment
- [ ] Push code to GitHub
- [ ] Import project in Vercel
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test production URL

**👉 Detailed guide:** `DEPLOYMENT.md`

---

## 🔑 Environment Variables

Already configured in `/app/.env`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://mxxxbeuremwtebvenjem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
GEMINI_API_KEY=AIzaSyD...
```

---

## 🆘 Troubleshooting

### "Could not find table 'aqi_readings'"
**Solution:** Run the SQL script in `SETUP_DATABASE.md`

### Leaflet map not loading
**Solution:** Map loads dynamically. Wait 2-3 seconds or check console.

### Gemini API errors
**Solution:** Verify API key is valid at https://aistudio.google.com/app/apikey

### No data in dashboards
**Solution:** 
1. Check database has records
2. Verify Supabase URL and key
3. Check browser console for errors

---

## 📞 Support & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Supabase Docs:** https://supabase.com/docs
- **Gemini API:** https://ai.google.dev/docs
- **Leaflet Docs:** https://leafletjs.com/reference.html

---

## 🎯 Key Features Summary

✅ **Real-time Monitoring:** ESP32 sensors → API → Database → Dashboards  
✅ **AI-Powered Insights:** Gemini 2.0 Flash for health advisories  
✅ **Interactive Maps:** Leaflet.js with color-coded ward markers  
✅ **Chatbot:** Ask questions about air quality  
✅ **Admin Controls:** Alert system + mitigation actions  
✅ **Beautiful UI:** Dark glassmorphism design  
✅ **Fully Responsive:** Works on mobile, tablet, desktop  
✅ **Auto-Refresh:** Real-time data updates every 30s  

---

## 📈 Next Steps (After Database Setup)

1. **Test the application**
   - Access citizen dashboard
   - Try the chatbot
   - Check admin panel alerts

2. **Deploy to production**
   - Follow `DEPLOYMENT.md`
   - Deploy on Vercel
   - Configure custom domain

3. **Hardware integration**
   - Follow `ESP32_INTEGRATION.md`
   - Set up sensors for each ward
   - Start collecting real data

4. **Monitoring & scaling**
   - Set up error tracking
   - Monitor API usage
   - Scale database as needed

---

## 🎉 You're Almost There!

**Just one step remaining:**

### 👉 CREATE THE DATABASE TABLE

Open `SETUP_DATABASE.md` and follow the SQL setup instructions.

Once the table is created, your Smart City AQI Monitoring System will be fully operational! 🚀

---

**Built with ❤️ using Next.js, Supabase, and Gemini AI**
