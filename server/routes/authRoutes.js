const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserModel = require('../models/User');
const FieldProfileModel = require('../models/FieldProfile');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Register new farmer with email & password (or phone & PIN)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, phone, pin, name } = req.body;

    const secret = password || pin;
    if (!secret) {
      return res.status(400).json({ error: 'Password or PIN is required.' });
    }

    // Determine identifier: Email or Phone
    let cleanEmail = null;
    let cleanPhone = null;

    if (email) {
      cleanEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }
      const existingEmail = await UserModel.findByEmail(cleanEmail);
      if (existingEmail) {
        return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
      }
    }

    if (phone) {
      cleanPhone = phone.toString().replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        const existingPhone = await UserModel.findByPhone(cleanPhone);
        if (existingPhone) {
          return res.status(409).json({ error: 'An account with this phone number already exists. Please log in.' });
        }
      }
    }

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({ error: 'Please provide either an email address or phone number.' });
    }

    const user = await UserModel.create({
      email: cleanEmail,
      phone: cleanPhone,
      password: secret.toString(),
      pin: pin ? pin.toString() : secret.toString(),
      name: name || 'Farmer'
    });

    const token = jwt.sign(
      { userId: user._id, email: user.email, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: { id: user._id, email: user.email, phone: user.phone, name: user.name },
      isNewUser: true,
      greeting: `Welcome to Nilam Pesum, ${user.name}! Let's build your field profile.`
    });
  } catch (err) {
    return res.status(500).json({ error: 'Registration error: ' + err.message });
  }
});

/**
 * Log in with Email & Password or Phone & PIN
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, phone, pin, identifier } = req.body;

    const userIdentifier = identifier || email || phone;
    const secret = password || pin;

    if (!userIdentifier || !secret) {
      return res.status(400).json({ error: 'Email/Phone and Password/PIN are required.' });
    }

    // Support universal demo login with secret 1234
    if (secret.toString() === '1234' && (userIdentifier === 'demo' || userIdentifier.includes('555') || userIdentifier === '9443123456' || userIdentifier === '9876543210')) {
      let demoUser = await UserModel.findByIdentifier(userIdentifier) || await UserModel.findByPhone('9443123456');
      if (demoUser) {
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
    }

    const user = await UserModel.findByIdentifier(userIdentifier);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email or phone number. Please register.' });
    }

    const isValid = await UserModel.verifyPassword(user, secret.toString());
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password or PIN. Please try again.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email, phone: user.phone, name: user.name },
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
    const demoPhone = '9443312345';
    let demoUser = await UserModel.findByPhone(demoPhone);
    if (!demoUser) {
      demoUser = await UserModel.create({
        phone: demoPhone,
        pin: '1234',
        name: 'முத்துவேல் (Muthuvel - Thanjavur)'
      });

      await FieldProfileModel.createOrUpdate(demoUser._id, {
        userId: demoUser._id,
        phone: demoUser.phone,
        name: 'தஞ்சாவூர் காவிரி டெல்டா வயல் (Thanjavur Delta Farm)',
        county: 'Thanjavur (தஞ்சாவூர்)',
        state: 'Tamil Nadu',
        fieldId: 'field_tn01',
        location: { lat: 10.7870, lng: 79.1378 },
        areaAcres: 5,
        soil: {
          texture: 'Alluvial Clay Loam (வண்டல் மண்)',
          organicMatterPct: 1.8,
          pH: 7.2,
          drainage: 'Moderately well drained',
          awcInches: 2.5,
          source: 'TNAU / ICAR Soil Survey'
        },
        waterSource: 'irrigated',
        currentCrop: 'paddy',
        previousCrops: ['black_gram', 'paddy', 'sesame'],
        priorities: ['Protect my soil', 'Earn more', 'Save water']
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
      greeting: 'வணக்கம்! நிலம் பேசும் தளத்திற்கு நல்வரவு. தஞ்சாவூர் காவிரி டெல்டா வயல் நாசா நேரடித் தரவுகளுடன் தயாராக உள்ளது.'
    });
  } catch (err) {
    return res.status(500).json({ error: 'Demo activation error: ' + err.message });
  }
});

module.exports = router;
