# NASA & Geospatial Data Sources Ledger (SOURCES.md)
*Nilam Pesum (FieldVoice) — NASA Space Apps Challenge 2026*

This document serves as the official provenance record and verification log for all NASA Earth Observation and agricultural datasets integrated into the Nilam Pesum platform.

---

## 1. NASA Prediction Of Worldwide Energy Resources (POWER)
- **Data Provider**: NASA Langley Research Center (LaRC) / Applied Science Program
- **Official Portal**: [https://power.larc.nasa.gov/](https://power.larc.nasa.gov/)
- **API Endpoint**: `https://power.larc.nasa.gov/api/temporal/daily/point`
- **Data Product**: Daily Agroclimatology (AG Community) Point API
- **Model / Assimilation Sources**: MERRA-2 (Modern-Era Retrospective analysis for Research and Applications, Version 2) and GEOS FP-IT (Goddard Earth Observing System Forward Processing for Instrument Teams)
- **Spatial Resolution**: 0.5° latitude x 0.625° longitude (~50 km grid cell)
- **Temporal Resolution**: Daily observations (1981 - Present, ~2 day latency)
- **Authentication**: None required (publicly accessible open NASA data)
- **Verified Parameters**:
  | Parameter Code | Description | Native Unit | Processed Unit | Measurement Type |
  | :--- | :--- | :--- | :--- | :--- |
  | `PRECTOTCORR` | Precipitation Corrected | mm/day | inches/day (`val / 25.4`) | Modeled / Gauge-Corrected |
  | `T2M` | Average Temperature at 2 Meters | °C | °F (`val * 9/5 + 32`) | Modeled / Reanalysis |
  | `T2M_MAX` | Maximum Temperature at 2 Meters | °C | °F (`val * 9/5 + 32`) | Modeled / Reanalysis |
  | `T2M_MIN` | Minimum Temperature at 2 Meters | °C | °F (`val * 9/5 + 32`) | Modeled / Reanalysis |
  | `RH2M` | Relative Humidity at 2 Meters | % | % | Modeled / Reanalysis |
  | `ALLSKY_SFC_SW_DWN` | All-Sky Surface Shortwave Downward Irradiance | MJ/m²/day | MJ/m²/day | Satellite-derived / Modeled |
  | `WS2M` | Wind Speed at 2 Meters | m/s | mph (`val * 2.23694`) | Modeled / Reanalysis |
  | `GWETROOT` | Root-Zone Soil Wetness (0-100cm depth) | 0.0 - 1.0 (fraction) | % Saturation (`val * 100`) | Land Surface Model (MERRA-2) |
  | `GWETTOP` | Surface Soil Wetness (0-5cm depth) | 0.0 - 1.0 (fraction) | % Saturation (`val * 100`) | Land Surface Model (MERRA-2) |

---

## 2. NASA AppEEARS / MODIS Vegetation Indices
- **Data Provider**: NASA Land Processes Distributed Active Archive Center (LP DAAC) / USGS EROS
- **Official Portal**: [https://appeears.earthdatacloud.nasa.gov/](https://appeears.earthdatacloud.nasa.gov/)
- **API Endpoint**: `https://appeears.earthdatacloud.nasa.gov/api/`
- **Product ID**: `MOD13Q1.061` (Terra MODIS Vegetation Indices 16-Day L3 Global 250m SIN Grid)
- **Spatial Resolution**: 250 meters
- **Temporal Resolution**: 16-day composite
- **Authentication**: Required — NASA Earthdata Login Bearer Token via `POST /api/login`
- **Verified Parameters**:
  | Parameter | Description | Scale Factor | Valid Range | Measurement Type |
  | :--- | :--- | :--- | :--- | :--- |
  | `_250m_16_days_NDVI` | Normalized Difference Vegetation Index | 0.0001 | -0.20 to +1.00 | Measured (Satellite Radiometry) |
  | `_250m_16_days_VI_Quality`| MODIS VI Quality Reliability Assessment | Bitmask | 0 - 65535 | Quality Flag |

---

## 3. NASA Global Imagery Browse Services (GIBS)
- **Data Provider**: NASA Earth Science Data and Information System (ESDIS)
- **Official Documentation**: [https://nasa-gibs.github.io/gibs-api-docs/](https://nasa-gibs.github.io/gibs-api-docs/)
- **API Endpoint**: `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi`
- **Layers**:
  - `MODIS_Terra_CorrectedReflectance_TrueColor` (250m resolution, daily)
  - `VIIRS_SNPP_CorrectedReflectance_TrueColor` (375m resolution, daily)
- **Projection**: Geographic (EPSG:4326) and Web Mercator (EPSG:3857)
- **Authentication**: None required (open web service)

---

## 4. NASA SMAP (Soil Moisture Active Passive) — Optional Supported
- **Data Provider**: NASA National Snow and Ice Data Center (NSIDC) DAAC / JPL
- **Official Portal**: [https://nsidc.org/data/smap](https://nsidc.org/data/smap)
- **Product ID**: `SPL3SMP_E` (Enhanced L3 Radiometer Soil Moisture 9km) & `SPL4SMGP` (Surface/Rootzone Soil Moisture Geophysical 9km)
- **Spatial Resolution**: 9 km grid
- **Temporal Resolution**: 3-day (L3) / Daily (L4)
- **Authentication**: Required — Earthdata Bearer Token

---

## 5. NASA GPM IMERG (Integrated Multi-satellitE Retrievals for GPM) — Optional Supported
- **Data Provider**: NASA Goddard Earth Sciences Data and Information Services Center (GES DISC)
- **Official Portal**: [https://gpm.nasa.gov/data](https://gpm.nasa.gov/data)
- **Product ID**: `GPM_3IMERGDF` (Daily Final Precipitation Estimation)
- **Spatial Resolution**: 0.1° x 0.1° (~10 km)
- **Temporal Resolution**: Daily
- **Authentication**: Required — Earthdata Bearer Token

---

## 6. USDA NRCS Soil Data Access / SSURGO
- **Data Provider**: United States Department of Agriculture (USDA) Natural Resources Conservation Service (NRCS)
- **Official Portal**: [https://websoilsurvey.nrcs.usda.gov/](https://websoilsurvey.nrcs.usda.gov/)
- **Service Endpoint**: `https://sdmdataaccess.nrcs.usda.gov/tabular/post.rest`
- **Parameters**: Soil texture class, organic matter (%), pH (1:1 water), natural drainage class, available water capacity (AWC in inches per foot of profile).
- **Authentication**: None required for tabular queries.

---

## 7. Retrieval Log & Field Inventory

| Field ID | Field Name | Lat, Lng | Datasets Available | Last Verified Retrieval |
| :--- | :--- | :--- | :--- | :--- |
| `field01` | Story County Pioneer Field | 42.0308, -93.6319 | POWER Daily, MODIS NDVI, SSURGO Soil, GIBS Imagery, SMAP, IMERG | 2024-12-01 |
| `example` | Champaign Prairie Parcel | 40.1164, -88.2434 | POWER Daily, MODIS NDVI, SSURGO Soil | 2024-11-20 |

- **2026-11-14T10:08:57.308Z**: Automated data refresh executed for field `field01`. Operations: 2 successful, 1 skipped, 0 failed.
- **2026-11-14T10:09:14.432Z**: Automated data refresh executed for field `example`. Operations: 2 successful, 1 skipped, 0 failed.
- **2026-11-14T12:07:03.816Z**: Automated data refresh executed for field `field_tn01`. Operations: 2 successful, 1 skipped, 0 failed.
- **2026-11-14T16:56:44.056Z**: Automated data refresh executed for field `field_tn01`. Operations: 0 successful, 2 skipped, 1 failed.
- **2026-11-14T17:03:09.608Z**: Automated data refresh executed for field `field_tn01`. Operations: 2 successful, 1 skipped, 0 failed.
- **2026-11-14T17:07:13.272Z**: Automated data refresh executed for field `field_tn01`. Operations: 0 successful, 4 skipped, 1 failed.
- **2026-11-14T17:14:24.778Z**: Automated data refresh executed for field `field_tn01`. Operations: 2 successful, 3 skipped, 0 failed.