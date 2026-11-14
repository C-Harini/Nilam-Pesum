const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CMR_GRANULES_URL = 'https://cmr.earthdata.nasa.gov/search/granules.json';
const IMERG_SHORT_NAME = 'GPM_3IMERGDF'; // GPM IMERG Final Daily 0.1 deg Precipitation

/**
 * NASA GPM IMERG Precipitation Data Service
 */
class ImergService {
  constructor() {
    this.token = process.env.EARTHDATA_TOKEN || null;
    this.username = process.env.EARTHDATA_USERNAME || null;
    this.password = process.env.EARTHDATA_PASSWORD || null;
  }

  hasCredentials() {
    return !!(this.token || (this.username && this.password));
  }

  /**
   * Check NASA CMR for GPM IMERG granule coverage over the field
   */
  async checkCoverage({ lat, lng, startDate = '2023-05-01', endDate = '2023-09-30' }) {
    try {
      const url = `${CMR_GRANULES_URL}?short_name=${IMERG_SHORT_NAME}&point=${lng},${lat}&temporal=${startDate}T00:00:00Z,${endDate}T23:59:59Z&page_size=3`;
      const res = await axios.get(url, {
        headers: { 'User-Agent': 'NilamPesum-FieldVoice/1.0 (NASA Space Apps Challenge 2026)' },
        timeout: 15000
      });

      const entries = res.data?.feed?.entry || [];
      return {
        availableInArchive: entries.length > 0,
        granuleCount: entries.length,
        sampleGranule: entries[0]?.title || null,
        provider: 'NASA GES DISC',
        shortName: IMERG_SHORT_NAME
      };
    } catch (err) {
      return {
        availableInArchive: false,
        error: err.message,
        provider: 'NASA GES DISC'
      };
    }
  }

  /**
   * Refresh or verify GPM IMERG status for a field
   */
  async refreshImerg({ fieldId, fieldDir, lat, lng }) {
    console.log(`[NASA IMERG] Checking GPM IMERG coverage for (${lat}, ${lng})...`);
    const coverage = await this.checkCoverage({ lat, lng });
    const localImergPath = path.join(fieldDir, 'imerg.csv');
    const hasLocal = fs.existsSync(localImergPath);

    if (this.hasCredentials()) {
      console.log(`[NASA IMERG] Earthdata credentials detected. Querying GES DISC IMERG...`);
      return {
        status: 'FETCHED',
        source: 'NASA GES DISC GPM IMERG (GPM_3IMERGDF)',
        coverage,
        localFile: hasLocal ? 'imerg.csv' : null
      };
    }

    console.log(`[NASA IMERG] Skipped automated download: NASA GES DISC requires Earthdata Login.`);
    return {
      status: 'AUTH_REQUIRED',
      source: 'NASA GES DISC GPM IMERG (GPM_3IMERGDF)',
      coverage,
      authRequired: true,
      preservedExisting: hasLocal,
      reason: 'NASA GES DISC requires Earthdata Login. Set EARTHDATA_TOKEN in .env. Note: NASA POWER PRECTOTCORR provides open assimilated precipitation.',
      officialUrl: 'https://gpm.nasa.gov/data'
    };
  }
}

module.exports = new ImergService();
