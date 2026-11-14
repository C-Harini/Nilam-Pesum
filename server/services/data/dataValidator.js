const fs = require('fs');
const path = require('path');
const dataLoader = require('./dataLoader');

const DATA_ROOT = path.resolve(__dirname, '../../../data');

class DataValidator {
  /**
   * Validate all datasets for all fields or a single field
   */
  validateField(fieldId) {
    const fieldDir = path.join(DATA_ROOT, 'fields', fieldId);
    if (!fs.existsSync(fieldDir)) {
      return { fieldId, exists: false, error: 'Field directory not found' };
    }

    const report = {
      fieldId,
      timestamp: new Date().toISOString(),
      datasets: {}
    };

    // 1. Meta validation
    const metaPath = path.join(fieldDir, 'meta.json');
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        report.meta = {
          status: 'VALID',
          name: meta.name,
          county: meta.county,
          state: meta.state,
          lat: meta.location?.lat,
          lng: meta.location?.lng,
          lastRefreshed: meta.lastRefreshed,
          dataSource: meta.dataSource
        };
      } catch (err) {
        report.meta = { status: 'CORRUPTED', error: err.message };
      }
    } else {
      report.meta = { status: 'MISSING' };
    }

    // 2. NASA POWER validation
    const powerPath = path.join(fieldDir, 'power_daily.csv');
    if (fs.existsSync(powerPath)) {
      try {
        const stats = fs.statSync(powerPath);
        const powerData = dataLoader.loadPowerDaily(fieldId);
        
        let missingPrecip = 0;
        let missingTemp = 0;
        let missingGwet = 0;

        powerData.forEach(r => {
          if (r.PRECTOTCORR === null) missingPrecip++;
          if (r.T2M === null) missingTemp++;
          if (r.GWETROOT === null) missingGwet++;
        });

        const rowCount = powerData.length;
        const missingPct = rowCount > 0 
          ? Number(((missingPrecip + missingTemp + missingGwet) / (rowCount * 3) * 100).toFixed(2))
          : 100;

        report.datasets.nasa_power = {
          name: 'NASA POWER Daily Agroclimatology',
          provider: 'NASA Langley Research Center',
          status: rowCount > 0 ? 'AVAILABLE' : 'EMPTY',
          fileSizeKb: (stats.size / 1024).toFixed(1),
          rowCount,
          startDate: rowCount > 0 ? powerData[0].date : null,
          endDate: rowCount > 0 ? powerData[rowCount - 1].date : null,
          missingPct,
          provenance: 'Authentic NASA POWER Daily Point API',
          warnings: missingPct > 5 ? ['Missing observations exceed 5% threshold'] : []
        };
      } catch (err) {
        report.datasets.nasa_power = { status: 'ERROR', error: err.message };
      }
    } else {
      report.datasets.nasa_power = {
        name: 'NASA POWER Daily Agroclimatology',
        status: 'MISSING',
        error: 'power_daily.csv does not exist. Run refresh-data to fetch.'
      };
    }

    // 3. AppEEARS NDVI validation
    const ndviPath = path.join(fieldDir, 'ndvi.csv');
    if (fs.existsSync(ndviPath)) {
      try {
        const stats = fs.statSync(ndviPath);
        const ndviData = dataLoader.loadNdvi(fieldId);
        const rowCount = ndviData.length;
        const gapFilledCount = ndviData.filter(d => d.interpolated).length;

        report.datasets.nasa_ndvi = {
          name: 'NASA AppEEARS / MODIS NDVI (MOD13Q1.061)',
          provider: 'NASA LP DAAC / USGS EROS',
          status: rowCount > 0 ? 'AVAILABLE' : 'EMPTY',
          fileSizeKb: (stats.size / 1024).toFixed(1),
          rowCount,
          startDate: rowCount > 0 ? ndviData[0].date : null,
          endDate: rowCount > 0 ? ndviData[rowCount - 1].date : null,
          gapFilledCount,
          gapFilledPct: rowCount > 0 ? Number(((gapFilledCount / rowCount) * 100).toFixed(1)) : 0,
          provenance: 'MODIS Terra 250m 16-Day L3 Vegetation Indices',
          warnings: gapFilledCount > 0 ? [`${gapFilledCount} data points interpolated for visualization`] : []
        };
      } catch (err) {
        report.datasets.nasa_ndvi = { status: 'ERROR', error: err.message };
      }
    } else {
      report.datasets.nasa_ndvi = {
        name: 'NASA AppEEARS / MODIS NDVI',
        status: 'UNAVAILABLE',
        reason: 'AppEEARS requires Earthdata credentials. Please supply EARTHDATA_TOKEN in .env or run refresh-data.'
      };
    }

    // 4. USDA Soil validation
    const soilPath = path.join(fieldDir, 'soil.json');
    if (fs.existsSync(soilPath)) {
      try {
        const soil = JSON.parse(fs.readFileSync(soilPath, 'utf8'));
        report.datasets.usda_soil = {
          name: 'USDA NRCS Web Soil Survey (SSURGO)',
          provider: 'USDA Natural Resources Conservation Service',
          status: 'AVAILABLE',
          texture: soil.texture,
          organicMatterPct: soil.organicMatterPct,
          pH: soil.pH,
          drainage: soil.drainage,
          awcInches: soil.awcInches,
          provenance: soil.source || 'USDA SSURGO'
        };
      } catch (err) {
        report.datasets.usda_soil = { status: 'ERROR', error: err.message };
      }
    } else {
      report.datasets.usda_soil = { status: 'MISSING' };
    }

    // 5. Optional datasets (SMAP & IMERG & GIBS)
    const smapPath = path.join(fieldDir, 'smap.csv');
    report.datasets.nasa_smap = {
      name: 'NASA SMAP L3 Soil Moisture',
      status: fs.existsSync(smapPath) ? 'AVAILABLE' : 'NOT_CONFIGURED',
      note: 'Optional dataset supported by architecture'
    };

    const imergPath = path.join(fieldDir, 'imerg.csv');
    report.datasets.nasa_imerg = {
      name: 'NASA GPM IMERG Precipitation',
      status: fs.existsSync(imergPath) ? 'AVAILABLE' : 'NOT_CONFIGURED',
      note: 'Optional dataset supported by architecture'
    };

    const timelapseDir = path.join(fieldDir, 'timelapse');
    const hasTimelapse = fs.existsSync(timelapseDir) && fs.readdirSync(timelapseDir).filter(f => f.endsWith('.png')).length > 0;
    report.datasets.nasa_gibs = {
      name: 'NASA GIBS Satellite Imagery',
      status: hasTimelapse ? 'AVAILABLE' : 'NOT_FETCHED',
      tileCount: hasTimelapse ? fs.readdirSync(timelapseDir).filter(f => f.endsWith('.png')).length : 0
    };

    return report;
  }

  /**
   * Validate all fields in data directory
   */
  validateAllFields() {
    const fieldsDir = path.join(DATA_ROOT, 'fields');
    if (!fs.existsSync(fieldsDir)) return [];

    const fieldDirs = fs.readdirSync(fieldsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    return fieldDirs.map(id => this.validateField(id));
  }
}

module.exports = new DataValidator();
