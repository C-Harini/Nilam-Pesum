const axios = require('axios');
const fs = require('fs');
const path = require('path');

const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
const PARAMETERS = [
  'PRECTOTCORR',
  'T2M',
  'T2M_MAX',
  'T2M_MIN',
  'RH2M',
  'ALLSKY_SFC_SW_DWN',
  'WS2M',
  'GWETROOT',
  'GWETTOP'
].join(',');

/**
 * Fetch daily agroclimatology data from NASA POWER with exponential backoff
 */
async function fetchPowerDaily({ lat, lng, startDate, endDate, maxRetries = 3 }) {
  const url = `${NASA_POWER_BASE_URL}?parameters=${PARAMETERS}&community=AG&longitude=${lng}&latitude=${lat}&start=${startDate}&end=${endDate}&format=JSON`;
  
  let attempt = 0;
  let delay = 1000;

  while (attempt < maxRetries) {
    try {
      attempt++;
      console.log(`[NASA POWER] Requesting data for (${lat}, ${lng}) [${startDate} to ${endDate}] - Attempt ${attempt}/${maxRetries}`);
      
      const response = await axios.get(url, {
        timeout: 25000,
        headers: {
          'User-Agent': 'NilamPesum-FieldVoice/1.0 (NASA Space Apps Challenge 2026)'
        }
      });

      if (!response.data || !response.data.properties || !response.data.properties.parameter) {
        throw new Error('Invalid NASA POWER API response structure');
      }

      const params = response.data.properties.parameter;
      const dates = Object.keys(params.T2M || {});
      dates.sort();

      const records = dates.map(dateStr => {
        // Format YYYYMMDD to YYYY-MM-DD
        const formattedDate = `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
        
        const sanitize = (val) => {
          if (val === undefined || val === null || val === -999 || val <= -900) return null;
          return Number(val);
        };

        return {
          date: formattedDate,
          PRECTOTCORR: sanitize(params.PRECTOTCORR ? params.PRECTOTCORR[dateStr] : null),
          T2M: sanitize(params.T2M ? params.T2M[dateStr] : null),
          T2M_MAX: sanitize(params.T2M_MAX ? params.T2M_MAX[dateStr] : null),
          T2M_MIN: sanitize(params.T2M_MIN ? params.T2M_MIN[dateStr] : null),
          RH2M: sanitize(params.RH2M ? params.RH2M[dateStr] : null),
          ALLSKY_SFC_SW_DWN: sanitize(params.ALLSKY_SFC_SW_DWN ? params.ALLSKY_SFC_SW_DWN[dateStr] : null),
          WS2M: sanitize(params.WS2M ? params.WS2M[dateStr] : null),
          GWETROOT: sanitize(params.GWETROOT ? params.GWETROOT[dateStr] : null),
          GWETTOP: sanitize(params.GWETTOP ? params.GWETTOP[dateStr] : null)
        };
      });

      console.log(`[NASA POWER] Successfully retrieved ${records.length} daily records.`);
      return { success: true, records, meta: response.data.header || {} };
    } catch (err) {
      console.warn(`[NASA POWER] Error on attempt ${attempt}: ${err.message}`);
      if (attempt >= maxRetries) {
        return { success: false, error: err.message };
      }
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
}

/**
 * Format records to CSV string with standard headers
 */
function recordsToCsv(records) {
  const headers = ['date', 'PRECTOTCORR', 'T2M', 'T2M_MAX', 'T2M_MIN', 'RH2M', 'ALLSKY_SFC_SW_DWN', 'WS2M', 'GWETROOT', 'GWETTOP'];
  const lines = [headers.join(',')];

  for (const r of records) {
    const row = headers.map(h => (r[h] !== null && r[h] !== undefined ? r[h] : ''));
    lines.push(row.join(','));
  }

  return lines.join('\n');
}

/**
 * Save records safely to CSV file (atomic write)
 */
async function savePowerCsv(fieldDir, records) {
  if (!records || records.length === 0) {
    throw new Error('Refusing to save empty dataset over existing records.');
  }

  const csvContent = recordsToCsv(records);
  const targetPath = path.join(fieldDir, 'power_daily.csv');
  const tempPath = path.join(fieldDir, 'power_daily.csv.tmp');

  fs.writeFileSync(tempPath, csvContent, 'utf8');
  fs.renameSync(tempPath, targetPath);
  console.log(`[NASA POWER] Saved ${records.length} records to ${targetPath}`);
}

module.exports = {
  fetchPowerDaily,
  recordsToCsv,
  savePowerCsv
};
