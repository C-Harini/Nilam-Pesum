const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const dataLoader = require('../services/data/dataLoader');
const dataValidator = require('../services/data/dataValidator');
const powerService = require('../services/nasa/powerService');

const DATA_ROOT = path.resolve(__dirname, '../../data');

/**
 * GET /api/fields - List all fields with coordinates and nearest snapping support
 */
router.get('/fields', (req, res) => {
  try {
    const fieldsDir = path.join(DATA_ROOT, 'fields');
    if (!fs.existsSync(fieldsDir)) return res.json([]);

    const entries = fs.readdirSync(fieldsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);

    const fields = entries.map(fieldId => {
      try {
        const meta = dataLoader.loadFieldMeta(fieldId);
        const soil = dataLoader.loadSoilData(fieldId);
        return {
          fieldId,
          name: meta.name,
          county: meta.county,
          state: meta.state,
          location: meta.location,
          areaAcres: meta.areaAcres,
          waterSource: meta.waterSource,
          currentCrop: meta.currentCrop,
          soil: soil ? {
            texture: soil.texture,
            organicMatterPct: soil.organicMatterPct,
            pH: soil.pH,
            awcInches: soil.awcInches
          } : null,
          dataSource: meta.dataSource
        };
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    // If query contains user lat/lng, calculate nearest field
    const userLat = parseFloat(req.query.lat);
    const userLng = parseFloat(req.query.lng);

    let nearest = null;
    if (!isNaN(userLat) && !isNaN(userLng) && fields.length > 0) {
      let minDist = Infinity;
      fields.forEach(f => {
        const dLat = f.location.lat - userLat;
        const dLng = f.location.lng - userLng;
        const dist = Math.sqrt(dLat * dLat + dLng * dLng);
        if (dist < minDist) {
          minDist = dist;
          nearest = f.fieldId;
        }
      });
    }

    return res.json({
      fields,
      nearestFieldId: nearest || (fields.length > 0 ? fields[0].fieldId : null)
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve fields: ' + err.message });
  }
});

/**
 * GET /api/field/today - Phase 3: Field Today Dashboard
 */
router.get('/field/today', async (req, res) => {
  try {
    const fieldId = req.query.fieldId || 'field01';
    const isLiveRequested = process.env.LIVE_DATA === 'true';

    const meta = dataLoader.loadFieldMeta(fieldId);
    let powerRecords = dataLoader.loadPowerDaily(fieldId);
    let isLive = false;
    let liveError = null;

    // If LIVE_DATA=true, attempt live query to NASA POWER for today
    if (isLiveRequested) {
      try {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const endFormatted = `${yyyy}${mm}${dd}`;
        
        // Query recent 7 days
        const pastWeek = new Date(today.getTime() - 7 * 86400000);
        const startFormatted = `${pastWeek.getFullYear()}${String(pastWeek.getMonth() + 1).padStart(2, '0')}${String(pastWeek.getDate()).padStart(2, '0')}`;

        const liveRes = await powerService.fetchPowerDaily({
          lat: meta.location.lat,
          lng: meta.location.lng,
          startDate: startFormatted,
          endDate: endFormatted,
          maxRetries: 1
        });

        if (liveRes.success && liveRes.records.length > 0) {
          isLive = true;
          // Append or merge live record
          powerRecords = powerRecords.concat(liveRes.records);
        }
      } catch (err) {
        liveError = 'Live NASA POWER query timed out. Reverted to cached local dataset.';
      }
    }

    if (!powerRecords || powerRecords.length === 0) {
      return res.status(404).json({ error: 'No NASA POWER records available for this field.' });
    }

    const latestPower = powerRecords[powerRecords.length - 1];
    const rainfall30d = dataLoader.getRainfallLast30Days(fieldId, latestPower.date);
    const tempTrend7d = dataLoader.getTempTrend7Days(fieldId, latestPower.date);
    const ndviRecords = dataLoader.loadNdvi(fieldId);
    const latestNdvi = ndviRecords.length > 0 ? ndviRecords[ndviRecords.length - 1] : null;
    const soil = dataLoader.loadSoilData(fieldId);

    const health = dataLoader.evaluateFieldHealth(latestPower, rainfall30d);

    // Build Data Passport for each metric
    const passports = {
      rootZoneWetness: {
        metric: 'Root-Zone Soil Wetness',
        value: `${latestPower.rootWetnessPct}% saturation`,
        dataset: 'NASA POWER Agroclimatology (GWETROOT)',
        provider: 'NASA Langley Research Center / MERRA-2',
        sourceFile: 'power_daily.csv',
        observationDate: latestPower.date,
        type: 'Modeled (Land Surface Model Assimilation)',
        officialUrl: 'https://power.larc.nasa.gov/'
      },
      rainfall30d: {
        metric: '30-Day Precipitation Accumulation',
        value: `${rainfall30d.totalLast30dInches} inches (${rainfall30d.diffPct >= 0 ? '+' : ''}${rainfall30d.diffPct}% vs normal)`,
        dataset: 'NASA POWER Agroclimatology (PRECTOTCORR)',
        provider: 'NASA Langley Research Center',
        sourceFile: 'power_daily.csv',
        dateRange: `Last 30 days ending ${latestPower.date}`,
        type: 'Modeled / Gauge-Calibrated',
        officialUrl: 'https://power.larc.nasa.gov/'
      },
      temperature7d: {
        metric: '7-Day Temperature Trend',
        value: `${latestPower.tempF}°F (Max: ${latestPower.tempMaxF}°F, Min: ${latestPower.tempMinF}°F)`,
        dataset: 'NASA POWER Agroclimatology (T2M / T2M_MAX / T2M_MIN)',
        provider: 'NASA Langley Research Center',
        sourceFile: 'power_daily.csv',
        observationDate: latestPower.date,
        type: 'Modeled / Atmospheric Reanalysis',
        officialUrl: 'https://power.larc.nasa.gov/'
      },
      ndvi: {
        metric: 'Vegetation Greenness Index (NDVI)',
        value: latestNdvi ? latestNdvi.ndvi.toFixed(3) : 'N/A',
        dataset: 'MODIS Terra 250m 16-Day NDVI (MOD13Q1.061)',
        provider: 'NASA LP DAAC / AppEEARS',
        sourceFile: 'ndvi.csv',
        observationDate: latestNdvi ? latestNdvi.date : 'N/A',
        type: 'Measured (Satellite Radiometry)',
        officialUrl: 'https://appeears.earthdatacloud.nasa.gov/'
      },
      soilProfile: {
        metric: 'Soil Horizon Classification',
        value: soil ? `${soil.texture} (${soil.organicMatterPct}% OM, pH ${soil.pH})` : 'Loam',
        dataset: 'USDA NRCS SSURGO Database',
        provider: 'USDA Natural Resources Conservation Service',
        sourceFile: 'soil.json',
        type: 'Surveyed Ground Truth',
        officialUrl: 'https://websoilsurvey.nrcs.usda.gov/'
      }
    };

    // Spoken Read-Aloud Summary
    const spokenSummary = `Here is your Field Today report for ${meta.name}. Root-zone soil wetness is at ${latestPower.rootWetnessPct}%. Over the last 30 days, your field received ${rainfall30d.totalLast30dInches} inches of rainfall, which is ${Math.abs(rainfall30d.diffPct)}% ${rainfall30d.diffPct >= 0 ? 'above' : 'below'} normal. Field health status is currently ${health.status}.`;

    return res.json({
      fieldId,
      fieldName: meta.name,
      location: meta.location,
      latestDate: latestPower.date,
      mode: isLive ? 'LIVE' : 'CACHED',
      liveError,
      health,
      metrics: {
        rootZoneWetnessPct: latestPower.rootWetnessPct,
        surfaceWetnessPct: latestPower.surfaceWetnessPct,
        rainfall30d,
        temperature: {
          currentF: latestPower.tempF,
          maxF: latestPower.tempMaxF,
          minF: latestPower.tempMinF,
          trend7d: tempTrend7d
        },
        ndvi: latestNdvi ? {
          value: latestNdvi.ndvi,
          date: latestNdvi.date,
          interpolated: latestNdvi.interpolated
        } : null,
        soil
      },
      passports,
      spokenSummary
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to generate Field Today report: ' + err.message });
  }
});

/**
 * GET /api/data-check - Scientific Integrity & Validation Audit
 */
router.get('/data-check', (req, res) => {
  try {
    const report = dataValidator.validateAllFields();
    return res.json(report);
  } catch (err) {
    return res.status(500).json({ error: 'Validation check failed: ' + err.message });
  }
});

/**
 * GET /api/sources - Sources Catalog & Credits
 */
router.get('/sources', (req, res) => {
  try {
    const sourcesPath = path.join(DATA_ROOT, 'sources.json');
    const catalog = JSON.parse(fs.readFileSync(sourcesPath, 'utf8'));

    const notUsed = [
      {
        dataset: 'Real-time On-Farm IoT Capacitance Probes',
        reason: 'Nilam Pesum is designed to democratize agricultural advisory without requiring expensive in-situ hardware installations; it relies on NASA remote sensing and land surface models.'
      },
      {
        dataset: 'Commercial Proprietary Weather Radar Feeds',
        reason: 'Strict adherence to open-access NASA Earth observation products (POWER, IMERG, MODIS) ensures worldwide reproducibility.'
      },
      {
        dataset: 'Hyperspectral Nitrogen Spectrometry',
        reason: 'Broadband MODIS/VIIRS NDVI provides canopy greenness/vigor. Soil nitrogen is calculated via USDA-validated biological nitrogen budgeting in the Soil Bank, not fabricated from satellite imagery.'
      }
    ];

    return res.json({
      catalog: catalog.sources,
      lastAudit: catalog.lastCatalogAudit,
      notUsed
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load sources: ' + err.message });
  }
});

module.exports = router;
