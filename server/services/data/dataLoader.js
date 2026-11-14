const fs = require('fs');
const path = require('path');

const DATA_ROOT = path.resolve(__dirname, '../../../data');

class DataLoader {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Clear in-memory cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get field directory path
   */
  getFieldDir(fieldId) {
    return path.join(DATA_ROOT, 'fields', fieldId);
  }

  /**
   * Load metadata for a field
   */
  loadFieldMeta(fieldId) {
    const cacheKey = `meta_${fieldId}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const metaPath = path.join(this.getFieldDir(fieldId), 'meta.json');
    if (!fs.existsSync(metaPath)) {
      throw new Error(`Field metadata not found for fieldId: ${fieldId}`);
    }

    const data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Load soil profile for a field
   */
  loadSoilData(fieldId) {
    const cacheKey = `soil_${fieldId}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const soilPath = path.join(this.getFieldDir(fieldId), 'soil.json');
    if (!fs.existsSync(soilPath)) {
      return null;
    }

    const data = JSON.parse(fs.readFileSync(soilPath, 'utf8'));
    this.cache.set(cacheKey, data);
    return data;
  }

  /**
   * Load crop catalogue (crops.json)
   */
  loadCrops() {
    const cacheKey = 'crops_catalogue';
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const cropsPath = path.join(DATA_ROOT, 'crops.json');
    if (!fs.existsSync(cropsPath)) {
      throw new Error('crops.json not found in data directory');
    }

    const data = JSON.parse(fs.readFileSync(cropsPath, 'utf8'));
    this.cache.set(cacheKey, data.crops || []);
    return data.crops || [];
  }

  /**
   * Load and parse NASA POWER daily records
   */
  loadPowerDaily(fieldId) {
    const cacheKey = `power_${fieldId}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const filePath = path.join(this.getFieldDir(fieldId), 'power_daily.csv');
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length <= 1) return [];

    // Parse header
    const headerLine = lines[0];
    const headers = headerLine.split(',').map(h => h.trim());

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < headers.length) continue;

      const row = {};
      headers.forEach((h, idx) => {
        const val = parts[idx];
        if (h === 'date') {
          row.date = val;
        } else {
          const num = parseFloat(val);
          row[h] = isNaN(num) || num === -999 || num <= -900 ? null : num;
        }
      });

      // Conversions for US customary agricultural use
      const precMm = row.PRECTOTCORR;
      const t2mC = row.T2M;
      const tMaxC = row.T2M_MAX;
      const tMinC = row.T2M_MIN;
      const gwetRoot = row.GWETROOT;
      const gwetTop = row.GWETTOP;

      row.precipInches = precMm !== null ? Number((precMm / 25.4).toFixed(3)) : null;
      row.tempF = t2mC !== null ? Number((t2mC * 1.8 + 32).toFixed(1)) : null;
      row.tempMaxF = tMaxC !== null ? Number((tMaxC * 1.8 + 32).toFixed(1)) : null;
      row.tempMinF = tMinC !== null ? Number((tMinC * 1.8 + 32).toFixed(1)) : null;
      row.rootWetnessPct = gwetRoot !== null ? Number((gwetRoot * 100).toFixed(1)) : null;
      row.surfaceWetnessPct = gwetTop !== null ? Number((gwetTop * 100).toFixed(1)) : null;

      records.push(row);
    }

    // Sort chronologically
    records.sort((a, b) => a.date.localeCompare(b.date));

    this.cache.set(cacheKey, records);
    return records;
  }

  /**
   * Load and parse NDVI observations with transparent gap-filling
   */
  loadNdvi(fieldId) {
    const cacheKey = `ndvi_${fieldId}`;
    if (this.cache.has(cacheKey)) return this.cache.get(cacheKey);

    const filePath = path.join(this.getFieldDir(fieldId), 'ndvi.csv');
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length <= 1) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const dateIdx = headers.indexOf('date');
    const ndviIdx = headers.indexOf('ndvi');
    const qualIdx = headers.indexOf('quality_flag');
    const interpIdx = headers.indexOf('interpolated');

    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(p => p.trim());
      if (parts.length < 2) continue;

      const date = parts[dateIdx];
      const rawNdvi = parseFloat(parts[ndviIdx]);
      if (isNaN(rawNdvi) || rawNdvi < -0.2 || rawNdvi > 1.0) continue;

      records.push({
        date,
        ndvi: Number(rawNdvi.toFixed(4)),
        quality_flag: qualIdx !== -1 ? parts[qualIdx] : 'good',
        interpolated: interpIdx !== -1 ? parts[interpIdx].toLowerCase() === 'true' : false
      });
    }

    records.sort((a, b) => a.date.localeCompare(b.date));
    this.cache.set(cacheKey, records);
    return records;
  }

  /**
   * Calculate 30-day rainfall comparison against historical average
   */
  getRainfallLast30Days(fieldId, targetDateStr) {
    const power = this.loadPowerDaily(fieldId);
    if (!power || power.length === 0) {
      return { totalLast30dInches: 0, historicalAvg30dInches: 3.5, diffPct: 0 };
    }

    const targetIndex = targetDateStr
      ? power.findIndex(r => r.date === targetDateStr)
      : power.length - 1;

    const endIdx = targetIndex >= 0 ? targetIndex : power.length - 1;
    const startIdx = Math.max(0, endIdx - 29);

    const last30 = power.slice(startIdx, endIdx + 1);
    let totalInches = 0;
    for (const r of last30) {
      if (r.precipInches !== null) {
        totalInches += r.precipInches;
      }
    }

    // Historical monthly baseline for Midwest Corn Belt is ~3.6 inches in spring/summer
    const historicalAvg30dInches = 3.65;
    const diffPct = Number((((totalInches - historicalAvg30dInches) / historicalAvg30dInches) * 100).toFixed(1));

    return {
      totalLast30dInches: Number(totalInches.toFixed(2)),
      historicalAvg30dInches,
      diffPct,
      daysSampled: last30.length
    };
  }

  /**
   * Get 7-day temperature trend
   */
  getTempTrend7Days(fieldId, targetDateStr) {
    const power = this.loadPowerDaily(fieldId);
    if (!power || power.length === 0) return [];

    const targetIndex = targetDateStr
      ? power.findIndex(r => r.date === targetDateStr)
      : power.length - 1;

    const endIdx = targetIndex >= 0 ? targetIndex : power.length - 1;
    const startIdx = Math.max(0, endIdx - 6);

    return power.slice(startIdx, endIdx + 1).map(r => ({
      date: r.date,
      tempF: r.tempF,
      tempMaxF: r.tempMaxF,
      tempMinF: r.tempMinF,
      precipInches: r.precipInches
    }));
  }

  /**
   * Determine field health status based on real NASA parameters
   */
  evaluateFieldHealth(latestReading, rainfall30d) {
    if (!latestReading) return { status: 'Unknown', reason: 'No data available' };

    const rootWet = latestReading.rootWetnessPct; // 0-100%
    const rainDiff = rainfall30d.diffPct;

    if (rootWet < 28 || (rainDiff < -40 && rootWet < 35)) {
      return {
        status: 'Dry',
        color: '#D97706', // Amber
        badge: 'Moisture Deficit',
        summary: `Root-zone moisture is at ${rootWet}%, significantly below optimal field capacity. 30-day precipitation is ${Math.abs(rainDiff)}% below regional normal.`
      };
    }

    if (latestReading.tempMaxF >= 95 || rootWet < 20) {
      return {
        status: 'Stressed',
        color: '#DC2626', // Red
        badge: 'Thermal / Moisture Stress',
        summary: `Field is exhibiting agronomic stress: maximum temperatures reached ${latestReading.tempMaxF}°F with low available soil moisture.`
      };
    }

    return {
      status: 'Healthy',
      color: '#16A34A', // Green
      badge: 'Favorable Conditions',
      summary: `Root-zone soil wetness is optimal at ${rootWet}%. Soil moisture reserves and temperature range (${latestReading.tempMinF}°F - ${latestReading.tempMaxF}°F) support active growth.`
    };
  }
}

module.exports = new DataLoader();
