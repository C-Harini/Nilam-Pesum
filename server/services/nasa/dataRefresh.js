const fs = require('fs');
const path = require('path');
const powerService = require('./powerService');
const appeearsService = require('./appeearsService');
const gibsService = require('./gibsService');
const dataValidator = require('../data/dataValidator');

const DATA_ROOT = path.resolve(__dirname, '../../../data');

/**
 * Automated Data Refresh Pipeline
 */
class DataRefreshPipeline {
  /**
   * Refresh datasets for a specific field
   */
  async refreshField(fieldId, options = {}) {
    console.log(`\n======================================================`);
    console.log(`[DATA REFRESH] Initiating automated refresh for: ${fieldId}`);
    console.log(`======================================================\n`);

    const fieldDir = path.join(DATA_ROOT, 'fields', fieldId);
    if (!fs.existsSync(fieldDir)) {
      throw new Error(`Field directory does not exist: ${fieldDir}`);
    }

    const metaPath = path.join(fieldDir, 'meta.json');
    if (!fs.existsSync(metaPath)) {
      throw new Error(`meta.json not found in ${fieldDir}`);
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const { lat, lng } = meta.location;

    const summary = {
      fieldId,
      timestamp: new Date().toISOString(),
      successful: [],
      skipped: [],
      failed: []
    };

    // 1. Refresh NASA POWER Daily Agroclimatology
    try {
      console.log(`[Step 1/3] Refreshing NASA POWER Daily Data (Lat: ${lat}, Lng: ${lng})...`);
      const startDate = options.startDate || '20220101';
      const endDate = options.endDate || '20241031';

      const powerResult = await powerService.fetchPowerDaily({
        lat,
        lng,
        startDate,
        endDate,
        maxRetries: 3
      });

      if (powerResult && powerResult.success && powerResult.records.length > 0) {
        await powerService.savePowerCsv(fieldDir, powerResult.records);
        summary.successful.push({
          source: 'NASA POWER Daily Point API',
          records: powerResult.records.length,
          dateRange: `${powerResult.records[0].date} to ${powerResult.records[powerResult.records.length - 1].date}`
        });
      } else {
        throw new Error(powerResult?.error || 'No records returned from NASA POWER API');
      }
    } catch (err) {
      console.error(`[DATA REFRESH] NASA POWER refresh failed: ${err.message}`);
      summary.failed.push({
        source: 'NASA POWER Daily Point API',
        error: err.message,
        preservedExisting: fs.existsSync(path.join(fieldDir, 'power_daily.csv'))
      });
    }

    // 2. Refresh NASA Earthdata / AppEEARS NDVI
    try {
      console.log(`[Step 2/3] Checking NASA Earthdata / AppEEARS NDVI status...`);
      if (appeearsService.hasCredentials()) {
        console.log(`[AppEEARS] Earthdata credentials detected. Initiating sampling task...`);
        const taskResult = await appeearsService.submitPointTask({
          fieldId,
          lat,
          lng,
          startDate: '01-01-2023',
          endDate: '12-31-2023'
        });

        if (taskResult.success) {
          summary.successful.push({
            source: 'NASA AppEEARS MODIS NDVI',
            taskId: taskResult.taskId,
            status: taskResult.status
          });
        } else {
          summary.failed.push({
            source: 'NASA AppEEARS MODIS NDVI',
            error: taskResult.error
          });
        }
      } else {
        console.log(`[AppEEARS] Skipped: EARTHDATA_TOKEN or credentials not configured in environment.`);
        summary.skipped.push({
          source: 'NASA AppEEARS MODIS NDVI',
          reason: 'EARTHDATA_TOKEN or credentials not configured. Local archival NDVI preserved.'
        });
      }
    } catch (err) {
      console.warn(`[DATA REFRESH] AppEEARS check encountered error: ${err.message}`);
      summary.failed.push({
        source: 'NASA AppEEARS MODIS NDVI',
        error: err.message
      });
    }

    // 3. Refresh NASA GIBS Satellite Imagery
    try {
      console.log(`[Step 3/3] Refreshing NASA GIBS Satellite Imagery...`);
      const timelapseDir = path.join(fieldDir, 'timelapse');
      const targetDate = '2023-06-15'; // Peak vegetative greenness in Corn Belt
      const gibsResult = await gibsService.fetchFieldSatelliteImage({
        lat,
        lng,
        date: targetDate,
        outputDir: timelapseDir
      });

      if (gibsResult.success) {
        summary.successful.push({
          source: 'NASA GIBS WMS Satellite Tile',
          date: targetDate,
          file: path.basename(gibsResult.filePath)
        });
      } else {
        summary.skipped.push({
          source: 'NASA GIBS WMS Satellite Tile',
          reason: gibsResult.reason || gibsResult.error
        });
      }
    } catch (err) {
      summary.failed.push({
        source: 'NASA GIBS WMS Satellite Tile',
        error: err.message
      });
    }

    // 4. Update sources.json & SOURCES.md
    this.updateSourcesLedger(fieldId, summary);

    // 5. Update field metadata lastRefreshed timestamp
    meta.lastRefreshed = new Date().toISOString();
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');

    console.log(`\n[DATA REFRESH] Summary for ${fieldId}:`);
    console.log(`  Successful: ${summary.successful.length}`);
    console.log(`  Skipped:    ${summary.skipped.length}`);
    console.log(`  Failed:     ${summary.failed.length}\n`);

    return summary;
  }

  /**
   * Append refresh audit to SOURCES.md and update sources.json
   */
  updateSourcesLedger(fieldId, summary) {
    const sourcesJsonPath = path.join(DATA_ROOT, 'sources.json');
    if (fs.existsSync(sourcesJsonPath)) {
      try {
        const catalog = JSON.parse(fs.readFileSync(sourcesJsonPath, 'utf8'));
        catalog.lastCatalogAudit = new Date().toISOString().split('T')[0];
        fs.writeFileSync(sourcesJsonPath, JSON.stringify(catalog, null, 2), 'utf8');
      } catch (e) {
        console.warn('Could not update sources.json timestamp');
      }
    }

    const sourcesMdPath = path.join(DATA_ROOT, 'SOURCES.md');
    if (fs.existsSync(sourcesMdPath)) {
      const entry = `\n- **${new Date().toISOString()}**: Automated data refresh executed for field \`${fieldId}\`. Operations: ${summary.successful.length} successful, ${summary.skipped.length} skipped, ${summary.failed.length} failed.`;
      fs.appendFileSync(sourcesMdPath, entry, 'utf8');
    }
  }
}

module.exports = new DataRefreshPipeline();
