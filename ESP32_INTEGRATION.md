# 🔌 ESP32 Hardware Integration Guide

Complete guide for integrating ESP32 sensors with the Smart City AQI Monitoring System.

---

## 📦 Required Hardware

### ESP32 Module
- ESP32-WROOM-32 or similar
- USB cable for programming

### Air Quality Sensors
1. **PM2.5/PM10 Sensor**
   - PMS5003 / PMS7003 (recommended)
   - or SDS011
   
2. **Gas Sensor**
   - MQ-135 (Air Quality)
   - or MQ-7 (CO)
   - or MQ-2 (LPG, Smoke)

### Additional Components
- Breadboard
- Jumper wires
- 5V power supply (optional, for standalone operation)

---

## 🔌 Wiring Diagram

### PMS5003 Connection
```
PMS5003    →    ESP32
VCC (5V)   →    VIN (5V)
GND        →    GND
TX         →    RX2 (GPIO 16)
RX         →    TX2 (GPIO 17)
```

### MQ-135 Connection
```
MQ-135     →    ESP32
VCC        →    3.3V
GND        →    GND
A0         →    GPIO 34 (ADC)
```

---

## 💻 Arduino Code

### Complete ESP32 Sketch

```cpp
/*
 * Smart City AQI Monitoring System
 * ESP32 Sensor Node
 * 
 * Reads PM2.5, PM10 from PMS5003 and Gas from MQ-135
 * Sends data to Next.js API endpoint
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ===== CONFIGURATION =====
// WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// API Configuration
const char* apiUrl = "http://your-app.vercel.app/api/sensor";
// For local testing: const char* apiUrl = "http://192.168.1.100:3000/api/sensor";

// Sensor Configuration
const int WARD_ID = 1; // Change this for each ward
const unsigned long SEND_INTERVAL = 60000; // Send data every 60 seconds

// Pin Definitions
#define PMS_RX 16
#define PMS_TX 17
#define MQ135_PIN 34

// ===== GLOBALS =====
HardwareSerial pmsSerial(2); // Use UART2 for PMS sensor
unsigned long lastSendTime = 0;

struct PMSData {
  uint16_t pm25;
  uint16_t pm10;
} pmsData;

// ===== FUNCTIONS =====

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=== Smart City AQI Monitor - ESP32 Node ===");
  
  // Initialize PMS sensor
  pmsSerial.begin(9600, SERIAL_8N1, PMS_RX, PMS_TX);
  Serial.println("✓ PMS sensor initialized");
  
  // Initialize analog pin for gas sensor
  pinMode(MQ135_PIN, INPUT);
  Serial.println("✓ Gas sensor initialized");
  
  // Connect to WiFi
  connectWiFi();
}

void loop() {
  // Maintain WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }
  
  // Read sensors and send data at interval
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    Serial.println("\n--- Reading Sensors ---");
    
    // Read PM sensor
    if (readPMSensor()) {
      // Read gas sensor
      float gasLevel = readGasSensor();
      
      // Send data to API
      sendDataToAPI(pmsData.pm25, pmsData.pm10, gasLevel);
    }
    
    lastSendTime = millis();
  }
  
  delay(1000);
}

// ===== WiFi CONNECTION =====
void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\n✗ WiFi connection failed!");
  }
}

// ===== READ PMS5003 SENSOR =====
bool readPMSensor() {
  uint8_t buffer[32];
  uint16_t sum = 0;
  
  // Wait for data
  int timeout = 1000;
  while (!pmsSerial.available() && timeout > 0) {
    delay(10);
    timeout -= 10;
  }
  
  if (pmsSerial.available() < 32) {
    Serial.println("✗ PMS sensor timeout");
    return false;
  }
  
  // Read 32 bytes
  for (int i = 0; i < 32; i++) {
    buffer[i] = pmsSerial.read();
  }
  
  // Verify start bytes
  if (buffer[0] != 0x42 || buffer[1] != 0x4d) {
    Serial.println("✗ Invalid PMS data");
    return false;
  }
  
  // Calculate checksum
  for (int i = 0; i < 30; i++) {
    sum += buffer[i];
  }
  uint16_t checksum = (buffer[30] << 8) | buffer[31];
  
  if (sum != checksum) {
    Serial.println("✗ PMS checksum failed");
    return false;
  }
  
  // Extract PM values (atmospheric environment)
  pmsData.pm25 = (buffer[12] << 8) | buffer[13];
  pmsData.pm10 = (buffer[14] << 8) | buffer[15];
  
  Serial.printf("✓ PM2.5: %d µg/m³, PM10: %d µg/m³\n", pmsData.pm25, pmsData.pm10);
  return true;
}

// ===== READ MQ-135 GAS SENSOR =====
float readGasSensor() {
  // Read analog value (0-4095 on ESP32)
  int rawValue = analogRead(MQ135_PIN);
  
  // Convert to voltage (0-3.3V)
  float voltage = rawValue * (3.3 / 4095.0);
  
  // Convert to ppm (simplified - calibrate for your sensor)
  float gasLevel = (rawValue / 4095.0) * 1000.0;
  
  Serial.printf("✓ Gas Level: %.1f (Raw: %d)\n", gasLevel, rawValue);
  return gasLevel;
}

// ===== SEND DATA TO API =====
void sendDataToAPI(float pm25, float pm10, float gas) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("✗ WiFi not connected, skipping upload");
    return;
  }
  
  HTTPClient http;
  http.begin(apiUrl);
  http.addHeader("Content-Type", "application/json");
  
  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["ward_id"] = WARD_ID;
  doc["pm25"] = pm25;
  doc["pm10"] = pm10;
  doc["gas"] = gas;
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("\n--- Sending to API ---");
  Serial.println(jsonString);
  
  // Send POST request
  int httpResponseCode = http.POST(jsonString);
  
  if (httpResponseCode > 0) {
    Serial.printf("✓ HTTP Response: %d\n", httpResponseCode);
    String response = http.getString();
    Serial.println("Response: " + response);
  } else {
    Serial.printf("✗ HTTP Error: %s\n", http.errorToString(httpResponseCode).c_str());
  }
  
  http.end();
}
```

---

## 📚 Required Arduino Libraries

Install these libraries via Arduino IDE Library Manager:

1. **WiFi** (Built-in for ESP32)
2. **HTTPClient** (Built-in for ESP32)
3. **ArduinoJson** (by Benoit Blanchon)
   - Version: 6.x or higher

### Installation Steps

1. Open Arduino IDE
2. Go to **Sketch** → **Include Library** → **Manage Libraries**
3. Search for "ArduinoJson"
4. Click **Install**

---

## ⚙️ Configuration

### 1. WiFi Setup

Replace in code:
```cpp
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
```

### 2. API Endpoint

**For Vercel Deployment:**
```cpp
const char* apiUrl = "https://your-app.vercel.app/api/sensor";
```

**For Local Testing:**
```cpp
const char* apiUrl = "http://192.168.1.100:3000/api/sensor";
```

### 3. Ward ID

Each ESP32 should have a unique ward ID:
```cpp
const int WARD_ID = 1; // Change for each ward
```

### 4. Sampling Interval

Adjust data sending frequency:
```cpp
const unsigned long SEND_INTERVAL = 60000; // 60 seconds
```

---

## 🔧 Sensor Calibration

### PMS5003 Calibration

The PMS5003 is factory-calibrated. However, you can add offset corrections:

```cpp
// Add offset correction
pmsData.pm25 = pmsData.pm25 + PM25_OFFSET;
pmsData.pm10 = pmsData.pm10 + PM10_OFFSET;
```

### MQ-135 Calibration

For accurate gas readings, calibrate in clean air:

```cpp
// Calibration (run in clean air environment)
#define RL_VALUE 10         // Load resistance in kΩ
#define RO_CLEAN_AIR 9.83   // Sensor resistance in clean air

float calibrateMQ135() {
  float sensor_volt;
  float RS_air;
  float R0;
  
  // Take 100 samples
  int sum = 0;
  for(int i = 0; i < 100; i++) {
    sum += analogRead(MQ135_PIN);
    delay(10);
  }
  float average = sum / 100.0;
  
  sensor_volt = average * (3.3 / 4095.0);
  RS_air = ((3.3 * RL_VALUE) / sensor_volt) - RL_VALUE;
  R0 = RS_air / RO_CLEAN_AIR;
  
  return R0;
}
```

---

## 🧪 Testing

### 1. Serial Monitor Test

1. Upload code to ESP32
2. Open Serial Monitor (115200 baud)
3. Check output:

```
=== Smart City AQI Monitor - ESP32 Node ===
✓ PMS sensor initialized
✓ Gas sensor initialized
Connecting to WiFi.....
✓ WiFi connected!
IP Address: 192.168.1.150

--- Reading Sensors ---
✓ PM2.5: 45 µg/m³, PM10: 68 µg/m³
✓ Gas Level: 234.5 (Raw: 965)

--- Sending to API ---
{"ward_id":1,"pm25":45,"pm10":68,"gas":234.5}
✓ HTTP Response: 201
Response: {"success":true,"message":"Sensor data received"}
```

### 2. API Test

Check if data appears in dashboard:
- Visit: `http://localhost:3000/citizen`
- Check if ward marker updates

---

## 🚨 Troubleshooting

### WiFi Won't Connect
- ✓ Check SSID and password
- ✓ Verify 2.4GHz network (ESP32 doesn't support 5GHz)
- ✓ Move closer to router

### PMS Sensor Not Reading
- ✓ Check wiring (RX→TX, TX→RX)
- ✓ Verify 5V power supply
- ✓ Wait 30 seconds for sensor warmup

### API Upload Fails
- ✓ Check API URL is correct
- ✓ Test with curl from computer first
- ✓ Verify Supabase table exists
- ✓ Check network firewall settings

### Invalid Sensor Readings
- ✓ Let sensors warm up (1-2 minutes)
- ✓ Calibrate gas sensor
- ✓ Check for loose connections

---

## 📊 Data Flow

```
ESP32 Sensors → WiFi → API Endpoint → Supabase → Dashboards
                                                    ↓
                                            Gemini AI Advisory
```

---

## 🔋 Power Options

### USB Power (Development)
- Connect via USB cable
- Draws ~500mA @ 5V

### Battery Power (Deployment)
- Use 3.7V LiPo battery with boost converter
- Add deep sleep mode for power saving:

```cpp
// Deep sleep example
esp_sleep_enable_timer_wakeup(60 * 1000000); // 60 seconds
esp_deep_sleep_start();
```

### Solar Power (Outdoor)
- 5V 2W solar panel
- 3.7V 2000mAh LiPo battery
- TP4056 charging module

---

## 🛡️ Security Considerations

1. **API Authentication:** Consider adding API key header
2. **HTTPS:** Use HTTPS endpoints in production
3. **Rate Limiting:** Implement on server side
4. **Data Validation:** Verify sensor ranges before sending

---

## 📈 Advanced Features

### 1. Add More Sensors
```cpp
// Temperature & Humidity (DHT22)
#include <DHT.h>
DHT dht(DHT_PIN, DHT22);

float temp = dht.readTemperature();
float humidity = dht.readHumidity();
```

### 2. Local Data Logging
```cpp
// Save to SD card for offline backup
#include <SD.h>
File dataFile = SD.open("aqi_log.txt", FILE_WRITE);
dataFile.println(jsonString);
dataFile.close();
```

### 3. OTA Updates
```cpp
// Enable Over-The-Air firmware updates
#include <ArduinoOTA.h>
ArduinoOTA.begin();
```

---

## 📝 Ward Deployment Checklist

For each ESP32 node:

- [ ] Configure unique WARD_ID
- [ ] Test sensors on breadboard
- [ ] Verify WiFi connection
- [ ] Test API upload
- [ ] Install in weatherproof enclosure
- [ ] Mount at 2-3 meters height
- [ ] Provide stable power supply
- [ ] Document GPS coordinates
- [ ] Test for 24 hours
- [ ] Add to monitoring system

---

**🎉 Your ESP32 sensor node is ready to monitor air quality!**
