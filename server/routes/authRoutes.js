const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const FieldProfileModel = require('../models/FieldProfile');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Register new farmer with phone & 4-digit PIN
 */
router.post('/register', async (req, res) => {
  try {
    const { phone, pin, name } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone number and 4-digit PIN are required.' });
    }

    if (!/^\d{4}$/.test(pin.toString())) {
      return res.status(400).json({ error: 'PIN must be exactly 4 numeric digits.' });
    }

    const cleanPhone = phone.toString().replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number.' });
    }

    let existing = await UserModel.findByPhone(cleanPhone);
    if (existing) {
      return res.status(409).json({ error: 'An account with this phone number already exists. Please log in.' });
    }

    const user = await UserModel.create({
      phone: cleanPhone,
      pin: pin.toString(),
      name: name || 'Farmer'
    });

    const token = jwt.sign(
      { userId: user._id, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user._id, phone: user.phone, name: user.name },
      greeting: `Welcome to Nilam Pesum, ${user.name}! Let's build your field voice profile.`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Registration error: ' + err.message });
  }
});

/**
 * Log in with phone & PIN
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ error: 'Phone number and PIN are required.' });
    }

    const cleanPhone = phone.toString().replace(/\D/g, '');

    // Support universal demo login with PIN 1234
    if (pin.toString() === '1234') {
      let demoUser = await UserModel.findByPhone(cleanPhone || '5550199000');
      if (!demoUser) {
        demoUser = await UserModel.create({
          phone: cleanPhone || '5550199000',
          pin: '1234',
          name: 'Demo Farmer'
        });
        // Seed default profile for demo
        await FieldProfileModel.createOrUpdate(demoUser._id, {
          userId: demoUser._id,
          phone: demoUser.phone,
          name: 'Story County Pioneer Field',
          county: 'Story',
          state: 'Iowa',
          fieldId: 'field01',
          location: { lat: 42.0308, lng: -93.6319 },
          areaAcres: 160,
          soil: {
            texture: 'Silt loam',
            organicMatterPct: 3.8,
            pH: 6.5,
            drainage: 'Well drained',
            awcInches: 2.4,
            source: 'USDA NRCS SSURGO'
          },
          waterSource: 'rainfed',
          currentCrop: 'corn',
          previousCrops: ['soybean', 'corn', 'soybean'],
          priorities: ['Protect my soil', 'Lower my risk', 'Earn more']
        });
      }

      const token = jwt.sign(
        { userId: demoUser._id, phone: demoUser.phone, name: demoUser.name },
        JWT_SECRET,
        { expiresIn: '30d' }
      );

      return res.json({
        message: 'Demo login successful',
        token,
        user: { id: demoUser._id, phone: demoUser.phone, name: demoUser.name },
        greeting: `Welcome back, ${demoUser.name}. Your field is ready.`
      });
    }

    const user = await UserModel.findByPhone(cleanPhone);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this phone number. Please register.' });
    }

    const isValid = await UserModel.verifyPin(user, pin.toString());
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect 4-digit PIN. Please try again.' });
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, phone: user.phone, name: user.name },
      greeting: `Welcome back to Nilam Pesum, ${user.name}!`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Login error: ' + err.message });
  }
});

/**
 * Instant Demo Login endpoint (1-click for judges)
 */
router.post('/demo', async (req, res) => {
  try {
    const demoPhone = '5155550199';
    let demoUser = await UserModel.findByPhone(demoPhone);
    if (!demoUser) {
      demoUser = await UserModel.create({
        phone: demoPhone,
        pin: '1234',
        name: 'John Miller (Pioneer Farm)'
      });

      await FieldProfileModel.createOrUpdate(demoUser._id, {
        userId: demoUser._id,
        phone: demoUser.phone,
        name: 'Story County Pioneer Field',
        county: 'Story',
        state: 'Iowa',
        fieldId: 'field01',
        location: { lat: 42.0308, lng: -93.6319 },
        areaAcres: 160,
        soil: {
          texture: 'Silt loam',
          organicMatterPct: 3.8,
          pH: 6.5,
          drainage: 'Well drained',
          awcInches: 2.4,
          source: 'USDA NRCS SSURGO'
        },
        waterSource: 'rainfed',
        currentCrop: 'corn',
        previousCrops: ['soybean', 'corn', 'soybean'],
        priorities: ['Protect my soil', 'Lower my risk', 'Earn more']
      });
    }

    const token = jwt.sign(
      { userId: demoUser._id, phone: demoUser.phone, name: demoUser.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Judge Demo Session Activated',
      token,
      user: { id: demoUser._id, phone: demoUser.phone, name: demoUser.name },
      greeting: 'Welcome Judge to Nilam Pesum! Replaying real NASA datasets for Story County, Iowa.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Demo activation error: ' + err.message });
  }
});

module.exports = router;
