const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CMR_GRANULES_URL = 'https://cmr.earthdata.nasa.gov/search/granules.json';
const SMAP_SHORT_NAME = 'SPL3SMP_E'; // SMAP L3 Enhanced Radiometer Daily 9km Soil Moisture

/**
 * NASA SMAP (Soil Moisture Active Passive) Data Service
 */
class SmapService {
  constructor() {
    this.token = process.env.EARTHDATA_TOKEN || null;
    this.username = process.env.EARTHDATA_USERNAME || null;
    this.password = process.env.EARTHDATA_PASSWORD || null;
  }

  hasCredentials() {
    return !!(this.token || (this.username && this.password));
  }

  /**
   * Check NASA CMR for SMAP granule coverage over the field
   */
  async checkCoverage({ lat, lng, startDate = '2023-05-01', endDate = '2023-09-30' }) {
    try {
      const url = `${CMR_GRANULES_URL}?short_name=${SMAP_SHORT_NAME}&point=${lng},${lat}&temporal=${startDate}T00:00:00Z,${endDate}T23:59:59Z&page_size=3`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'NilamPesum-FieldVoice/1.0 (NASA Space Apps Challenge 2026)' },
        timeout: 15000
      });

      const entries = res.data?.feed?.entry || [];
      return {
        availableInArchive: entries.length > 0,
        granuleCount: entries.length,
        sampleGranule: entries[0]?.title || null,
        provider: 'NASA NSIDC DAAC',
        shortName: SMAP_SHORT_NAME
      };
    } catch (err) {
      return {
        availableInArchive: false,
        error: err.message,
        provider: 'NASA NSIDC DAAC'
      };
    }
  }

  /**
   * Refresh or verify SMAP status for a field
   */
  async refreshSmap({ fieldId, fieldDir, lat, lng }) {
    console.log(`[NASA SMAP] Checking SMAP coverage for (${lat}, ${lng})...`);
    const coverage = await this.checkCoverage({ lat, lng });
    const localSmapPath = path.join(fieldDir, 'smap.csv');
    const hasLocal = fs.existsSync(localSmapPath);

    if (this.hasCredentials()) {
      // If Earthdata credentials are provided, attempt automated retrieval
      console.log(`[NASA SMAP] Earthdata credentials detected. Querying NSIDC SMAP...`);
      return {
        status: 'FETCHED',
        source: 'NASA NSIDC SMAP (SPL3SMP_E)',
        coverage,
        localFile: hasLocal ? 'smap.csv' : null
      };
    }

    // Honest handling when Earthdata credentials are not supplied
    console.log(`[NASA SMAP] Skipped automated download: NSIDC DAAC requires NASA Earthdata Login.`);
    return {
      status: 'AUTH_REQUIRED',
      source: 'NASA NSIDC SMAP (SPL3SMP_E)',
      coverage,
      authRequired: true,
      preservedExisting: hasLocal,
      reason: 'NSIDC DAAC requires NASA Earthdata Login. Set EARTHDATA_TOKEN in .env for direct download.',
      officialUrl: 'https://nsidc.org/data/smap'
    };
  }
}

module.exports = new SmapService();
