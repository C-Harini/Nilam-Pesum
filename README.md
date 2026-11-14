# Nilam Pesum (FieldVoice) 🌾🛰️
### AI Full-Stack Voice-First Agricultural Advisory Platform
**NASA Space Apps Challenge 2026 — Challenge: "Field Shift: Adapting Farms with NASA Data"**

[![NASA Earth Data](https://img.shields.io/badge/NASA-POWER%20%7C%20AppEEARS%20%7C%20GIBS-blue.svg)](https://power.larc.nasa.gov/)
[![USDA SSURGO](https://img.shields.io/badge/USDA-SSURGO%20Soil%20Survey-green.svg)](https://websoilsurvey.nrcs.usda.gov/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Summary & Vision

**Nilam Pesum (FieldVoice)** is a complete, voice-first agricultural decision-support platform that adapts farming operations to shifting climate patterns using authentic **NASA Earth observation data**, meteorological reanalysis, and soil survey science.

A farmer speaks naturally to the application:
> *"I have 160 acres of silt loam soil, no irrigation, and I grew corn last year. I want to protect my soil and lower my risk."*

Nilam Pesum:
1. **Listens and Extracts** field boundaries, soil texture, water regime, and strategic priorities using on-device Web Speech recognition and agronomic natural language processing.
2. **Retrieves Authentic NASA Datasets** via automated data pipelines connecting to the **NASA POWER Daily Point API**, **NASA AppEEARS / MODIS NDVI (MOD13Q1.061)**, and **NASA GIBS True-Color satellite imagery**.
3. **Optimizes 3-Season Crop Rotations** across 8 validated crops using a transparent 5-factor scoring model (**Yield**, **Water**, **Soil**, **Income**, **Risk**) with priority double-weighting.
4. **Performs Climate Stress What-If Simulations** (temperature $+0^\circ\text{F}$ to $+4^\circ\text{F}$, rainfall $-30\%$ to $+20\%$, planting delays) and calculates biological nitrogen balance in the **Soil Bank**.
5. **Replays History in the Time Machine (Primary Demonstration Feature)**: Allows judges and farmers to travel back through a completed growing season day-by-day, synchronizing actual historical rainfall, temperature, and root-zone moisture with satellite NDVI vegetation curves and GIBS true-color imagery.
6. **Conversational Talk Tab**: Answers agronomic inquiries (*"Is my soil dry?"*, *"Should I irrigate this week?"*, *"Why did you recommend this rotation?"*) grounded exclusively in verified measurements, with zero AI hallucination and deterministic offline fallbacks.

---

## 2. System Architecture & Hybrid Data Engineering

Nilam Pesum adheres to a resilient **Hybrid Architecture**:
$$\text{NASA APIs} \longrightarrow \text{Automated Refresh} \longrightarrow \text{Local Caching} \longrightarrow \text{Agronomic Engines} \longrightarrow \text{Voice \& UI}$$

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        OFFICIAL NASA DATA SOURCES                      │
│   NASA POWER Daily       NASA AppEEARS (MODIS)        NASA GIBS WMTS   │
│   (Precip, Temp, Soil)        (250m NDVI)           (Satellite Tiles)  │
└────────────────────┬─────────────────┬────────────────────┬────────────┘
                     │                 │                    │
                     ▼                 ▼                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                 DATA REFRESH PIPELINE (npm run refresh-data)           │
│  • Lat/Lng Coordinate Resolution      • Fill-value (-999) Sanitization │
│  • Exponential Backoff Retries        • Unit Conversions (mm→in, °C→°F)│
│  • Atomic File Writing (.tmp → .csv)  • Provenance Audit (SOURCES.md)  │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    LOCAL AUTHENTIC ARCHIVE (/data/fields/)             │
│  • field01/ (Story County, IA)        • crops.json (8 agronomic crops) │
│  • example/ (Champaign County, IL)    • sources.json (Data catalog)    │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
┌──────────────────────────────────────┐┌────────────────────────────────┐
│      LOCAL RUNTIME (LIVE_DATA=false) ││   LIVE MONITOR (LIVE_DATA=true)│
│  • Guaranteed 100% demo uptime       ││  • Live NASA POWER queries     │
│  • Zero external network dependence  ││  • Automatic cached fallback   │
│  • Sub-millisecond calculation speed ││  • LIVE vs CACHED status badge │
└───────────────────┬──────────────────┘└────────────────┬───────────────┘
                    │                                    │
                    └──────────────────┬─────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        AGRONOMIC ANALYSIS SERVICES                     │
│  • Rotation 5-Factor Scorer          • Historical Backtest Engine      │
│  • What-If Climate Stress Simulator   • Soil Bank (Nitrogen Ledger)    │
│  • Planting Window (Frost/Warm-up)    • Time Machine Replay Engine     │
└──────────────────────────────────────┬─────────────────────────────────┘
                                       │
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│              FRONTEND (React + Vite + Tailwind + Web Speech)           │
│  • Mobile-First Heartland Aesthetic  • Web Speech Audio In/Out (TTS)   │
│  • Recharts Geospatial Curves        • Interactive Leaflet Snapping    │
│  • Data Passport for Every Metric    • Time Machine Scrubber Slider    │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Verified NASA Data Integrations

| NASA Data Product | Provider | Spatial / Temporal Resolution | Parameters Utilized | Provenance Classification |
| :--- | :--- | :--- | :--- | :--- |
| **NASA POWER Daily Point API** | NASA Langley Research Center (LaRC) | $0.5^\circ \times 0.625^\circ$ (~50km) / Daily | `PRECTOTCORR`, `T2M`, `T2M_MAX`, `T2M_MIN`, `RH2M`, `ALLSKY_SFC_SW_DWN`, `WS2M`, `GWETROOT`, `GWETTOP` | **Modeled** (MERRA-2 Land Surface Model) |
| **NASA AppEEARS / MODIS NDVI** | NASA LP DAAC / USGS EROS | 250 meters / 16-day composite | `MOD13Q1.061` ($250\text{m}$ 16-day NDVI, VI Quality Flags) | **Measured** (Satellite Radiometry) |
| **NASA GIBS True-Color Imagery** | NASA ESDIS | 250m (MODIS) / Daily | `MODIS_Terra_CorrectedReflectance_TrueColor` WMS Tiles | **Measured** (Satellite Earth Imagery) |
| **NASA SMAP (Optional Supported)** | NASA NSIDC DAAC / JPL | 9km / Daily-3day | `SPL3SMP_E` / `SPL4SMGP` L-band radiometer soil moisture | **Measured / Assimilated** |
| **NASA GPM IMERG (Optional Supported)** | NASA GES DISC | 0.1° (~10km) / Daily | `GPM_3IMERGDF` multi-satellite precipitation | **Measured / Gauge-Corrected** |
| **USDA NRCS SSURGO** | USDA Natural Resources Conservation Service | Map unit polygon (~1:24,000) / Ground survey | Soil texture, organic matter %, pH, natural drainage class, available water capacity (AWC) | **Measured Ground Truth** |

---

## 4. Quickstart & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24 LTS recommended)
- **npm**: v9.0.0 or higher

### Step 1: Clone and Install
```bash
git clone https://github.com/nasa-spaceapps/nilam-pesum.git
cd nilam-pesum

# Install dependencies across monorepo
npm install
npm install --prefix server
npm install --prefix client
```

### Step 2: Environment Configuration
Copy the template configuration:
```bash
cp .env.example .env
```
Default configuration values in `.env`:
```env
PORT=5000
MONGO_URI=
JWT_SECRET=nilam_pesum_secure_jwt_secret_2026_fieldvoice

LLM_API_KEY=
LLM_PROVIDER=gemini

LIVE_DATA=false
AUTO_REFRESH=false

EARTHDATA_USERNAME=
EARTHDATA_PASSWORD=
EARTHDATA_TOKEN=

NASA_API_KEY=DEMO_KEY
```

> **Database Resilience Note**: If `MONGO_URI` is omitted or an external MongoDB instance is unreachable, Nilam Pesum automatically activates its built-in, file-backed local JSON persistence layer (`data/users.json` and `data/profiles.json`). It runs 100% reliably out of the box with zero external database dependencies.

### Step 3: Run the Automated Test Suite
Verify that all 15 scientific tests, loaders, and scoring engines pass:
```bash
npm test
```

### Step 4: Run the Application
Start both the backend server and frontend client concurrently:
```bash
npm run dev
```
- **Unified Application**: Open [http://localhost:5000](http://localhost:5000) (or Vite dev server at [http://localhost:3000](http://localhost:3000)).
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 5. Judge & Demonstration Credentials

To make judging seamless and instant, the platform includes a pre-configured **Judge 1-Click Demo** button on the welcome screen:

- **1-Click Demo**: Tap **"Enter Demo as John Miller (PIN 1234)"** on the login page.
- **Manual Credentials**:
  - **Phone**: `515-555-0199` (or any valid 10-digit number)
  - **PIN**: `1234`
- **Pre-Loaded Demonstration Fields**:
  1. `field01`: **Story County Pioneer Field** (Story County, Iowa — Prime Corn Belt, Lat: `42.0308`, Lng: `-93.6319`). Complete multi-year NASA POWER daily observations, MODIS NDVI, SSURGO silt loam profile, and GIBS satellite imagery.
  2. `example`: **Champaign Prairie Parcel** (Champaign County, Illinois — Lat: `40.1164`, Lng: `-88.2434`).

---

## 6. Automated NASA Data Refresh Pipeline

To refresh the local archive with real observations directly from NASA servers:
```bash
# Refresh Story County, Iowa field
npm run refresh-data -- --field field01

# Refresh Champaign County, Illinois parcel
npm run refresh-data -- --field example
```

The pipeline:
1. Queries the official NASA POWER Daily Point API with exponential backoff.
2. Sanitizes `-999` fill values and computes standard US customary units (`inches`, `°F`, `% saturation`).
3. Checks AppEEARS credentials for NDVI (honestly reports unavailable if token omitted, preserving existing archives without generating fake data).
4. Retrieves NASA GIBS true-color satellite imagery tiles for the farm coordinates.
5. Performs atomic file writing (`.tmp` $\rightarrow$ `.csv`) to prevent file corruption.
6. Updates `data/sources.json` and appends an entry to the retrieval log in `data/SOURCES.md`.

---

## 7. Feature Walkthrough by Development Phase

### Phase 1 — Authentication & Onboarding
- Farmer mobile phone sign-in with 4-digit PIN hashed via `bcryptjs`.
- JWT session management with auto-login persistence.
- Spoken audio greeting welcoming the farmer by name.

### Phase 2 — Voice Profile Building
- Voice prompt: *"Tell me about your land."*
- Web Speech API speech-to-text with real-time transcript streaming.
- Agronomic entity extraction (`POST /api/profile/extract`) extracting acreage, soil texture, water regime, and crops with rule-based fallback.
- Interactive Leaflet map with GPS locator and nearest-parcel snapping.
- Strategic Priority selection (Save water, Earn more, Protect my soil, Lower my risk).

### Phase 3 — Field Today Dashboard
- Root-zone soil wetness (`GWETROOT`), 30-day precipitation vs 10-year regional normal, 7-day temperature range chart (Recharts), and MODIS NDVI.
- Transparent field health classification (Healthy, Dry, Stressed).
- **Data Passport Modal**: Inspects provenance, provider, local file, date range, and official NASA portal URL for every measurement.
- Text-to-speech voice read-aloud button.

### Phase 4 & 5 — Crop Rotation Engine & Detail
- Generates valid 3-season crop sequences across 8 verified crops (`crops.json`).
- 5 transparent factor scores (0–100): **Yield**, **Water**, **Soil**, **Income**, and **Risk**.
- Selected farmer priorities receive double weight ($w=2.0$).
- **Historical Backtesting**: Simulates rotation performance across all recorded NASA POWER historical years, identifying the Best Year and Worst Year.
- **What-If Climate Stress Simulator**: Interactive sliders for temperature ($+0^\circ\text{F}$ to $+4^\circ\text{F}$), rainfall ($-30\%$ to $+20\%$), and planting delay ($-14$ to $+28$ days) with real-time score recalculation.
- **Soil Bank**: Biological nitrogen accounting ledger showing nitrogen credits from legumes ($+45\text{ lbs N/ac}$ from soybeans, $+85\text{ lbs N/ac}$ from crimson clover) and crop uptake from corn ($-165\text{ lbs N/ac}$).
- **Planting Window Test**: Analyzes last spring frost ($\le 32^\circ\text{F}$), $50^\circ\text{F}$ soil warm-up date, and field trafficability.
- One-tap **"Commit This Rotation as My Season Plan"**.

### Phase 6 — Season Companion
- Phenological crop calendar with dated management tasks and plain-language agronomic rationales.
- Real-time weather stress alerts:
  - **Dry Spell**: $<0.25"$ rain in 14 days **AND** root-zone wetness $<30\%$.
  - **Heat Stress**: $\ge 3$ days above $95^\circ\text{F}$ during critical pollination windows.
  - **Heavy Rain**: $>2.0"$ precipitation in 24 hours (erosion and nitrate leaching risk).
- On-farm voice scouting notes dictation and storage.

### Phase 7 — Time Machine (Main Innovation)
- **Historical Demo Clock & Interactive Scrubber Slider**: Progresses through the 2023 growing season (April 15 to October 31, 2023).
- Controls: **Play**, **Pause**, **Next Week (+7d)**, **Next Month (+30d)**, and continuous scrub.
- Synchronized day-by-day reveal of cumulative rainfall, temperature, and root-zone soil wetness.
- **Expected vs Actual Satellite NDVI Graph**: Compares idealized crop growth curve against actual MODIS radiometry observations, with gap-filled points explicitly marked.
- **NASA GIBS True-Color Satellite Imagery**: Displays actual overhead satellite tiles for the farm parcel.
- **Season Report Card**: End-of-season evaluation with letter grade, growth variance, Soil Bank balance, and next-season rotation recommendations.

### Phase 8 — Talk Tab (Voice Assistant)
- Conversational voice assistant answering farmer questions (*"Is my soil dry?"*, *"Should I irrigate this week?"*, *"Why did you recommend this rotation?"*).
- Built upon a structured JSON context containing only verified field measurements and calculations.
- Dual-mode architecture: swappable LLM integration (Gemini / OpenAI) with deterministic agronomic rule-based fallback that operates 100% offline without any API key.
- Never fabricates measurements. Text-to-speech audio response. Never stores raw audio.

### Phase 9 — County Extension Officer Dashboard (Stretch Feature)
- Regional overview dashboard for university extension specialists and USDA soil conservation officers.
- Regional map of monitored farms, crop rotation adoption rates, aggregate moisture stress index, and drought vulnerability indicators.
- All sample farms are visibly and clearly labelled as demonstration profiles.

---

## 8. Scientific Assumptions & Integrity Boundaries

1. **NDVI Scope**: Satellite NDVI measures photosynthetic vegetative greenness and canopy vigor. It is **not** a direct diagnostic sensor of specific pathogen species, fungal blights, or grain protein levels.
2. **Growing Degree Days**: Calculated using the standard NOAA / Iowa State University Modified 86/50 method with crop-specific base temperatures ($50^\circ\text{F}$ for corn/soybean/sorghum, $40^\circ\text{F}$ for wheat/clover, $34^\circ\text{F}$ for rye).
3. **Spatial Scale**: NASA POWER data represents a $0.5^\circ \times 0.625^\circ$ grid cell. Local microclimates or tile-drained farm sub-fields may exhibit local variance.
4. **What Nilam Pesum Does NOT Use**: Detailed in the Sources & Credits page (`/sources`), Nilam Pesum does **not** rely on expensive on-farm IoT capacitance probes, proprietary commercial radar feeds, or fabricated hyperspectral nitrogen imagery, ensuring accessible, democratized advisory worldwide.

See [ASSUMPTIONS.md](ASSUMPTIONS.md) and [data/SOURCES.md](data/SOURCES.md) for complete mathematical proofs, formulas, and parameters.

---

## 9. Monorepo File Structure

```text
nilam-pesum/
├── client/                     # Frontend React + Vite + Tailwind PWA
│   ├── src/
│   │   ├── components/         # Leaflet Map, Data Passport, Voice Mic, Navbar, BottomNav
│   │   ├── context/            # AuthContext, FieldContext, VoiceContext (Web Speech)
│   │   ├── i18n/               # i18next localized dictionary (en.json)
│   │   ├── pages/              # Welcome, Onboarding, FieldToday, RotationPlan,
│   │   │                       # SeasonCompanion, TimeMachine, Talk, DataCheck, Credits, Extension
│   │   ├── services/           # Axios API client
│   │   ├── App.jsx             # React Router structure
│   │   └── main.jsx
│   └── vite.config.js
├── server/                     # Backend Node.js + Express API
│   ├── config/                 # Resilient dual-mode database (MongoDB / JSON fallback)
│   ├── middleware/             # JWT auth & error handling
│   ├── models/                 # User & FieldProfile schemas
│   ├── routes/                 # Auth, Profile, Field, Rotation, Season, TimeMachine, Talk, Extension
│   ├── services/
│   │   ├── nasa/               # NASA POWER API, AppEEARS client, GIBS service, Refresh pipeline
│   │   ├── data/               # DataLoader (CSV/JSON caching), DataValidator (Audit engine)
│   │   ├── rotation/           # 5-factor scoring, backtesting, what-if, soil bank, planting window
│   │   ├── timemachine/        # Progressive seasonal day-by-day replay engine & report card
│   │   └── ai/                 # Talk assistant, speech fallback, voice entity extractor
│   ├── scripts/                # CLI runner: npm run refresh-data -- --field field01
│   ├── tests/                  # Automated test suite (npm test)
│   └── server.js
├── data/                       # Local Authentic Data Storage
│   ├── fields/
│   │   ├── field01/            # Story County, Iowa (power_daily.csv, ndvi.csv, soil.json, timelapse/)
│   │   └── example/            # Champaign County, Illinois
│   ├── crops.json              # 8 agronomic crops with GDD, water, yield, and N balance
│   ├── sources.json            # Central data catalog & provenance specification
│   ├── SOURCES.md              # NASA integration retrieval log & attribution ledger
│   └── README.md               # Data engineering & local data policy guide
├── .env.example                # Environment configuration template
├── ASSUMPTIONS.md              # Agronomic, mathematical, and meteorological assumptions
└── README.md                   # This document
```

---

## 10. License & NASA Attribution

Nilam Pesum is open-source software licensed under the [MIT License](LICENSE).

### Data Attribution
- Data courtesy of the **NASA POWER Project** funded through the NASA Earth Science / Applied Science Program.
- MODIS NDVI data courtesy of the **NASA Land Processes Distributed Active Archive Center (LP DAAC)** and **USGS EROS**.
- True-Color imagery provided by the **NASA Global Imagery Browse Services (GIBS)**, part of **NASA ESDIS**.
- Soil data provided by the **USDA Natural Resources Conservation Service (NRCS) Web Soil Survey**.
