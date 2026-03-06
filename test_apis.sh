#!/bin/bash

# ========================================
# Smart City AQI Monitoring - API Testing
# ========================================

BASE_URL="http://localhost:3000"

echo "🧪 Testing Smart City AQI Monitoring APIs"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Sensor API Health Check..."
curl -s -X GET "$BASE_URL/api/sensor" | jq '.' || echo "Response received"
echo ""
echo ""

# Test 2: Insert Sensor Data (ESP32 Simulation)
echo "2️⃣ Testing Sensor Data Ingestion (Simulating ESP32)..."
curl -s -X POST "$BASE_URL/api/sensor" \
  -H "Content-Type: application/json" \
  -d '{
    "ward_id": 1,
    "pm25": 175.5,
    "pm10": 245.0,
    "gas": 500.0
  }' | jq '.' || echo "Response received"
echo ""
echo ""

# Test 3: Fetch All Readings
echo "3️⃣ Testing Readings API..."
curl -s -X GET "$BASE_URL/api/readings?limit=10" | jq '.' || echo "Response received"
echo ""
echo ""

# Test 4: AI Health Advisory
echo "4️⃣ Testing AI Health Advisory (Gemini)..."
curl -s -X GET "$BASE_URL/api/advisory" | jq '.' || echo "Response received"
echo ""
echo ""

# Test 5: Chatbot Q&A
echo "5️⃣ Testing AI Chatbot (Gemini)..."
curl -s -X POST "$BASE_URL/api/qna" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Should I go for a morning walk today based on current AQI?"
  }' | jq '.' || echo "Response received"
echo ""
echo ""

# Test 6: Multiple Sensor Insertions (Different Wards)
echo "6️⃣ Testing Multiple Ward Data Insertion..."
for ward in 2 3 4 5; do
  pm25=$((50 + RANDOM % 200))
  pm10=$((80 + RANDOM % 300))
  gas=$((200 + RANDOM % 500))
  
  echo "   Ward $ward: PM2.5=$pm25, PM10=$pm10, Gas=$gas"
  curl -s -X POST "$BASE_URL/api/sensor" \
    -H "Content-Type: application/json" \
    -d "{
      \"ward_id\": $ward,
      \"pm25\": $pm25,
      \"pm10\": $pm10,
      \"gas\": $gas
    }" > /dev/null
done
echo ""
echo "✅ Test data inserted for wards 2-5"
echo ""

echo "=========================================="
echo "✅ API Testing Complete!"
echo "=========================================="
echo ""
echo "📍 Next Steps:"
echo "1. Visit http://localhost:3000/citizen for Citizen Dashboard"
echo "2. Visit http://localhost:3000/admin for Admin Dashboard"
echo "3. Check the map for color-coded ward markers"
echo "4. Try the AI chatbot in citizen dashboard"
echo ""
