# 🛰️ NEBULA-NOWCAST

> **GPU-Accelerated 1–3 km Convective Scale Nowcasting & Multi-Sensor Fusion Platform (0–6 Hr Lead Time)**  
> **Smart India Hackathon (SIH 2026) | Problem Statement 26084**  
> **Nodal Ministry**: Ministry of Earth Sciences (MoES) / NCMRWF

---

## 📌 Project Summary

**NEBULA-NOWCAST** is a real-time severe weather nowcasting platform engineered to bridge the critical 0–6 hour forecasting gap for localized convective hazards across India—specifically cloudbursts, severe hailstorms, microbursts, downbursts, and lightning density—with 1–3 km spatial resolution and 15-minute update cycles.

Traditional Numerical Weather Prediction (NWP) models require hours to initialize, failing to detect short-lived convective storms that develop and decay within 30 to 180 minutes. **NEBULA-NOWCAST** solves this by fusing Doppler Weather Radar (DWR S/C/X-band 1–3 km grid reflectivity & radial velocity), INSAT-3D thermal IR satellite channels, and ground IoT pressure sensors into a GPU-accelerated PyTorch ConvLSTM deep learning extrapolation engine.

---

## 🚀 Key Features

* **🌐 WeatherLayers-GL WebGL Map**: GPU continuous radar reflectivity color ramps (10 to 70 dBZ cloudburst threshold) and animated vector speed stream particles.
* **📡 Pan-India 12-Station DWR Coverage**: Pre-configured Doppler radar coverage for Delhi NCR, Dehradun, Kolkata, Nagpur, Mumbai, Chennai, Bengaluru, Guwahati, Srinagar, Hyderabad, Ahmedabad, and Kochi.
* **⏱️ Sub-District Live Hazard Countdowns**: Real-time arrival warning timers for vulnerable Talukas.
* **📄 Automated W3C CAP v1.2 XML Early Warnings**: Instantly generates Common Alerting Protocol XML feeds for national emergency gateways (SMS, NDMA, Aviation Towers).
* **📱 Ground IoT Mesh Barometer Telemetry**: Integrates crowdsourced smartphone barometers to validate microburst predictions at ground level.
* **📊 Convective Diagnostics**: Real-time Vertical Profile (VAD/RHI 0–16 km MSL), CAPE (J/kg), CIN (J/kg), and Bulk Shear (0-6km kts).

---

## 🛠️ Tech Stack & Database

* **Frontend & GPU Map**: React 19, Vite 8, WeatherLayers-GL, Leaflet, Tailwind CSS, Lucide Icons.
* **AI Engine**: PyTorch ConvLSTM (Spatial-Temporal Neural Network) & Lucas-Kanade Optical Flow.
* **Database**: Supabase PostgreSQL + PostGIS 3.4 Spatial Extension (`ST_DWithin`, `ST_MakePoint`).

---

## ⚡ Quick Start

```bash
git clone https://github.com/your-org/nebula-nowcast.git
cd nebula-nowcast
npm install
npm run dev
```
