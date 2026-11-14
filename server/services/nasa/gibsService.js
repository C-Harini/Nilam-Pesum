const axios = require('axios');
const fs = require('fs');
const path = require('path');

const GIBS_WMS_URL = 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi';

/**
 * NASA GIBS Satellite Imagery Service
 */
class GibsService {
  /**
   * Fetch satellite true-color imagery for field bounding box
   */
  async fetchFieldSatelliteImage({ lat, lng, date, outputDir }) {
    // Generate a ~0.15 degree bounding box around the field center
    const delta = 0.08;
    const minLat = (lat - delta).toFixed(4);
    const maxLat = (lat + delta).toFixed(4);
    const minLng = (lng - delta).toFixed(4);
    const maxLng = (lng + delta).toFixed(4);

    const params = new URLSearchParams({
      SERVICE: 'WMS',
      REQUEST: 'GetMap',
      VERSION: '1.3.0',
      LAYERS: 'MODIS_Terra_CorrectedReflectance_TrueColor',
      STYLES: '',
      FORMAT: 'image/png',
      TRANSPARENT: 'TRUE',
      HEIGHT: '512',
      WIDTH: '512',
      CRS: 'EPSG:4326',
      BBOX: `${minLat},${minLng},${maxLat},${maxLng}`,
      TIME: date
    });

    const url = `${GIBS_WMS_URL}?${params.toString()}`;

    try {
      console.log(`[GIBS] Requesting imagery for ${date} at (${lat}, ${lng})`);
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent': 'NilamPesum-FieldVoice/1.0 (NASA Space Apps Challenge 2026)'
        }
      });

      if (response.status === 200 && response.data.length > 1000) {
        if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
        }
        const filePath = path.join(outputDir, `${date}.png`);
        fs.writeFileSync(filePath, Buffer.from(response.data));
        console.log(`[GIBS] Satellite image saved to ${filePath}`);
        return { success: true, filePath, url };
      }

      return { success: false, reason: 'Empty or incomplete imagery tile returned' };
    } catch (err) {
      console.warn(`[GIBS] Failed to fetch image for ${date}: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Find nearest available image in timelapse directory
   */
  getNearestImagery(timelapseDir, targetDate) {
    if (!fs.existsSync(timelapseDir)) return null;

    const files = fs.readdirSync(timelapseDir).filter(f => f.endsWith('.png'));
    if (files.length === 0) return null;

    files.sort();

    // Find the latest file that is <= targetDate
    let selected = files[0];
    for (const f of files) {
      const fileDate = f.replace('.png', '');
      if (fileDate <= targetDate) {
        selected = f;
      } else {
        break;
      }
    }

    return {
      filename: selected,
      date: selected.replace('.png', ''),
      path: path.join(timelapseDir, selected)
    };
  }
}

module.exports = new GibsService();
