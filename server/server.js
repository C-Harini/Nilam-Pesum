require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const fieldRoutes = require('./routes/fieldRoutes');
const rotationRoutes = require('./routes/rotationRoutes');
const seasonRoutes = require('./routes/seasonRoutes');
const timeMachineRoutes = require('./routes/timeMachineRoutes');
const talkRoutes = require('./routes/talkRoutes');
const extensionRoutes = require('./routes/extensionRoutes');
const voiceRoutes = require('./routes/voiceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static satellite imagery & assets from data folder
app.use('/data', express.static(path.resolve(__dirname, '../data')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api', fieldRoutes);
app.use('/api', rotationRoutes);
app.use('/api', seasonRoutes);
app.use('/api/timemachine', timeMachineRoutes);
app.use('/api', talkRoutes);
app.use('/api', extensionRoutes);
app.use('/api/voice', voiceRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Nilam Pesum (FieldVoice)',
    version: '1.0.0',
    mode: process.env.LIVE_DATA === 'true' ? 'LIVE_DATA_ENABLED' : 'OFFLINE_LOCAL_DATA_DEFAULT',
    timestamp: new Date().toISOString()
  });
});

// Serve compiled client if dist exists
const clientDistPath = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/data')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err.stack || err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    path: req.originalUrl
  });
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🌾 Nilam Pesum (FieldVoice) Backend running on port ${PORT}`);
    console.log(`📡 Local Data Policy: ${process.env.LIVE_DATA === 'true' ? 'LIVE_DATA' : 'LOCAL_OFFLINE_CACHE (Guaranteed demo uptime)'}`);
    console.log(`🚀 API Base URL: http://localhost:${PORT}/api`);
    console.log(`=============================================================\n`);
  });
}

startServer();

module.exports = app;
