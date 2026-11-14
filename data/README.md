# Nilam Pesum Data Architecture & Local Data Policy

## 1. Directory Structure

```text
/data
├── sources.json        # Central data catalog & provenance specification
├── SOURCES.md          # NASA integration log & attribution documentation
├── crops.json          # Agronomic crop parameters & rotation constraints
├── README.md           # This architecture guide
└── fields/
    ├── field01/        # Story County, Iowa (Primary Demonstration Field)
    │   ├── meta.json
    │   ├── power_daily.csv
    │   ├── ndvi.csv
    │   ├── soil.json
    │   ├── smap.csv
    │   ├── imerg.csv
    │   └── timelapse/
    │       └── 2023-06-15.png
    └── example/        # Champaign County, Illinois (Comparative Sample Parcel)
        ├── meta.json
        ├── power_daily.csv
        ├── ndvi.csv
        └── soil.json
```

---

## 2. Local Data Policy (Hybrid Architecture)

To ensure high availability, resilience against NASA service outages, and lightning-fast user interactions during judging demonstrations, Nilam Pesum adheres to a strict dual-mode data policy:

### Mode A: `LIVE_DATA=false` (Default Operational Setting)
- **Zero External API Calls**: The application executes entirely offline using authenticated local archives.
- **Affected Features**: Field Today, Rotation Engine, Historical Backtesting, What-If Simulator, Planting Window Test, and Time Machine read directly from `/data/fields/<fieldId>/`.
- **Latency & Reliability**: Instantaneous UI responses with guaranteed determinism and zero dependency on NASA server up-time.

### Mode B: `LIVE_DATA=true` (Live Monitoring Setting)
- **Live NASA POWER Requests**: Only the **Field Today** dashboard makes real-time queries to the NASA POWER Daily Point API to capture the most recent available 24-hour observation.
- **Graceful Fallback**: If the network is unavailable or NASA POWER returns an error/rate limit, the system automatically falls back to local cached data and displays an indicator badge: `CACHED (Offline Fallback)`.
- **Status Transparency**: Every reading displays a timestamp and provenance badge (`LIVE` vs `CACHED`).

---

## 3. Data File Specifications

### 3.1 NASA POWER Daily (`power_daily.csv`)
- **Header Line**: `date,PRECTOTCORR,T2M,T2M_MAX,T2M_MIN,RH2M,ALLSKY_SFC_SW_DWN,WS2M,GWETROOT,GWETTOP`
- **Fill Values**: NASA POWER fills missing or invalid observations with `-999.0` or `-999`. The data loader automatically sanitizes these into `null` or replaces them via backward-forward rolling window fill, with warnings logged.
- **Unit Standard**:
  - Precipitation: `mm/day` in raw CSV, converted to `inches` in frontend/analysis (`mm / 25.4`).
  - Temperature: `°C` in raw CSV, converted to `°F` (`°C * 1.8 + 32`).
  - Soil Wetness: `0.0 to 1.0` fraction, converted to `% Saturation` (`fraction * 100`).

### 3.2 NASA AppEEARS NDVI (`ndvi.csv`)
- **Header Line**: `date,ndvi,quality_flag,interpolated`
- **Scale Factor**: Values are stored in true NDVI range `[-0.20, 1.00]`.
- **Gap-Filling**: Cloud cover and satellite revisit gaps (16 days) are linearly interpolated for smooth plotting curves in the Time Machine. **Crucial Rule**: Every interpolated observation sets `interpolated=true`. Interpolated points are styled with dashed lines or hollow dots and explicitly labelled as "Gap-Filled" to preserve scientific integrity.

### 3.3 USDA SSURGO Soil Profile (`soil.json`)
- Stores physical and chemical soil properties (texture, % organic matter, pH, drainage class, and Available Water Capacity in inches of water per foot of soil depth).

---

## 4. Automatic Refresh Pipeline

Run:
```bash
npm run refresh-data -- --field field01
```

The refresh script performs:
1. Field configuration loading (`meta.json`).
2. Coordinate resolution.
3. NASA POWER daily point query with exponential backoff (3 attempts).
4. AppEEARS point task status verification (or honest unavailable reporting if credentials omitted).
5. GIBS true-color tile retrieval.
6. Local atomic writing (`.tmp` -> `.csv`) to prevent file corruption on interruption.
7. `sources.json` and `SOURCES.md` timestamp updates.
