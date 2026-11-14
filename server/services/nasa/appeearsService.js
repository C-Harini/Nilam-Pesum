const axios = require('axios');
const fs = require('fs');
const path = require('path');

const APPEEARS_API_BASE = 'https://appeears.earthdatacloud.nasa.gov/api';

/**
 * NASA Earthdata / AppEEARS Service
 */
class AppEEARSService {
  constructor() {
    this.token = process.env.EARTHDATA_TOKEN || null;
    this.username = process.env.EARTHDATA_USERNAME || null;
    this.password = process.env.EARTHDATA_PASSWORD || null;
  }

  /**
   * Check if credentials are present
   */
  hasCredentials() {
    return !!(this.token || (this.username && this.password));
  }

  /**
   * Authenticate with Earthdata / AppEEARS
   */
  async login() {
    if (this.token) {
      return this.token;
    }

    if (!this.username || !this.password) {
      return null;
    }

    try {
      const authHeader = 'Basic ' + Buffer.from(`${this.username}:${this.password}`).toString('base64');
      const res = await axios.post(`${APPEEARS_API_BASE}/login`, {}, {
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        timeout: 15000
      });

      if (res.data && res.data.token) {
        this.token = res.data.token;
        return this.token;
      }
      return null;
    } catch (err) {
      console.warn(`[AppEEARS] Authentication failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Submit a point sample task for MOD13Q1.061 NDVI
   */
  async submitPointTask({ fieldId, lat, lng, startDate, endDate }) {
    const token = await this.login();
    if (!token) {
      return {
        success: false,
        error: 'Earthdata authentication credentials missing or invalid. Set EARTHDATA_TOKEN or EARTHDATA_USERNAME/PASSWORD.'
      };
    }

    const payload = {
      task_type: 'point',
      task_name: `nilam_pesum_${fieldId}_${Date.now()}`,
      params: {
        dates: [
          {
            startDate: startDate, // e.g. "01-01-2023"
            endDate: endDate      // e.g. "12-31-2023"
          }
        ],
        layers: [
          {
            product: 'MOD13Q1.061',
            layer: '_250m_16_days_NDVI'
          },
          {
            product: 'MOD13Q1.061',
            layer: '_250m_16_days_VI_Quality'
          }
        ],
        coordinates: [
          {
            latitude: lat,
            longitude: lng,
            id: fieldId
          }
        ]
      }
    };

    try {
      const res = await axios.post(`${APPEEARS_API_BASE}/task`, payload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 20000
      });

      return {
        success: true,
        taskId: res.data.task_id,
        status: res.data.status
      };
    } catch (err) {
      return {
        success: false,
        error: `Failed to submit AppEEARS task: ${err.response?.data?.message || err.message}`
      };
    }
  }

  /**
   * Check status of submitted task
   */
  async checkTaskStatus(taskId) {
    const token = await this.login();
    if (!token) return { success: false, error: 'Unauthorized' };

    try {
      const res = await axios.get(`${APPEEARS_API_BASE}/task/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 10000
      });

      return {
        success: true,
        status: res.data.status,
        progress: res.data.progress,
        error: res.data.error || null
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * List files in completed task bundle
   */
  async getTaskBundle(taskId) {
    const token = await this.login();
    if (!token) return { success: false, error: 'Unauthorized' };

    try {
      const res = await axios.get(`${APPEEARS_API_BASE}/bundle/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        timeout: 15000
      });

      return {
        success: true,
        files: res.data.files || []
      };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Download a specific file from task bundle
   */
  async downloadBundleFile(taskId, fileId) {
    const token = await this.login();
    if (!token) return { success: false, error: 'Unauthorized' };

    try {
      const res = await axios.get(`${APPEEARS_API_BASE}/bundle/${taskId}/${fileId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'text',
        timeout: 30000
      });

      return { success: true, data: res.data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Parse downloaded NDVI records and save to ndvi.csv
   */
  saveNdviRecords(fieldDir, records) {
    if (!records || records.length === 0) {
      throw new Error('Refusing to save empty NDVI dataset.');
    }

    const headers = ['date', 'ndvi', 'quality_flag', 'interpolated'];
    const lines = [headers.join(',')];

    for (const r of records) {
      lines.push(`${r.date},${r.ndvi.toFixed(4)},${r.quality_flag || 'good'},${r.interpolated ? 'true' : 'false'}`);
    }

    const targetPath = path.join(fieldDir, 'ndvi.csv');
    const tempPath = path.join(fieldDir, 'ndvi.csv.tmp');

    fs.writeFileSync(tempPath, lines.join('\n'), 'utf8');
    fs.renameSync(tempPath, targetPath);
    console.log(`[AppEEARS] Saved ${records.length} NDVI records to ${targetPath}`);
  }
}

module.exports = new AppEEARSService();
