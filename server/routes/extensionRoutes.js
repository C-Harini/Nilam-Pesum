const express = require('express');
const router = express.Router();
const FieldProfileModel = require('../models/FieldProfile');
const dataLoader = require('../services/data/dataLoader');

/**
 * GET /api/extension/overview - Regional Extension Officer Dashboard
 */
router.get('/extension/overview', async (req, res) => {
  try {
    const fields = [
      {
        id: 'field01',
        farmerName: 'John Miller (Demonstration Farmer)',
        isSample: true,
        farmName: 'Pioneer Corn Belt Parcel',
        county: 'Story County',
        state: 'Iowa',
        location: { lat: 42.0308, lng: -93.6319 },
        acres: 160,
        currentCrop: 'Corn',
        rotation: 'Corn → Soybean + Cereal Rye',
        soilTexture: 'Silt loam',
        rootWetnessPct: 34.2,
        waterStressIndex: 'Low',
        nitrogenStatus: 'Balanced (+45 lbs credit next season)',
        adoptionStatus: 'Active Plan Committed'
      },
      {
        id: 'example',
        farmerName: 'Sarah Jenkins (Demonstration Farmer)',
        isSample: true,
        farmName: 'Champaign Prairie Parcel',
        county: 'Champaign County',
        state: 'Illinois',
        location: { lat: 40.1164, lng: -88.2434 },
        acres: 120,
        currentCrop: 'Soybean',
        rotation: 'Soybean → Winter Wheat → Corn',
        soilTexture: 'Silt loam',
        rootWetnessPct: 31.0,
        waterStressIndex: 'Moderate',
        nitrogenStatus: 'Surplus (+85 lbs credit)',
        adoptionStatus: 'Active Plan Committed'
      },
      {
        id: 'sample_03',
        farmerName: 'Robert Davis (Simulated Farmer)',
        isSample: true,
        farmName: 'Boone River Bottoms',
        county: 'Boone County',
        state: 'Iowa',
        location: { lat: 42.1520, lng: -93.8820 },
        acres: 240,
        currentCrop: 'Continuous Corn',
        rotation: 'Continuous Corn (Monoculture)',
        soilTexture: 'Clay loam',
        rootWetnessPct: 24.5,
        waterStressIndex: 'High',
        nitrogenStatus: 'Deficit (-165 lbs withdrawal)',
        adoptionStatus: 'High Erosion Risk Advisory'
      },
      {
        id: 'sample_04',
        farmerName: 'Elena Rostova (Simulated Farmer)',
        isSample: true,
        farmName: 'Ames Uplands',
        county: 'Story County',
        state: 'Iowa',
        location: { lat: 42.0150, lng: -93.5850 },
        acres: 180,
        currentCrop: 'Alfalfa',
        rotation: 'Alfalfa (3-Yr) → Corn',
        soilTexture: 'Loam',
        rootWetnessPct: 38.0,
        waterStressIndex: 'Minimal',
        nitrogenStatus: 'High Surplus (+130 lbs credit)',
        adoptionStatus: 'Regenerative Certified'
      }
    ];

    // Calculate regional aggregate metrics
    const totalAcres = fields.reduce((sum, f) => sum + f.acres, 0);
    const avgRootWetness = Number((fields.reduce((sum, f) => sum + f.rootWetnessPct, 0) / fields.length).toFixed(1));
    const coverCropAdoptionRate = '75%';

    return res.json({
      title: 'USDA / Iowa State Extension Regional Overview',
      region: 'Central Iowa Corn Belt & Prairie Corridor',
      notice: 'ALL FARMERS ON THIS DASHBOARD ARE DEMONSTRATION & SIMULATED PROFILES (CLEARLY LABELLED).',
      aggregates: {
        totalEnrolledFarms: fields.length,
        totalEnrolledAcres: totalAcres,
        avgRegionalRootZoneWetnessPct: avgRootWetness,
        coverCropAdoptionRate,
        regionalDroughtVulnerability: 'Mild to Moderate in Sandy Loam Pockets'
      },
      farms: fields
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load extension overview: ' + err.message });
  }
});

module.exports = router;
