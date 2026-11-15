const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Serverless-aware MongoDB Connection Caching
let cached = global.mongooseCached;
if (!cached) {
  cached = global.mongooseCached = { conn: null, promise: null };
}

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri || !mongoUri.trim()) {
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.warn('[DB] WARNING: MONGO_URI environment variable is not set in Vercel settings.');
    }
    return null;
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
      maxPoolSize: 10
    };

    cached.promise = mongoose.connect(mongoUri.trim(), opts).then((m) => {
      console.log('[DB] Connected to MongoDB Atlas successfully.');
      return m;
    }).catch((err) => {
      cached.promise = null;
      console.error('[DB] MongoDB Atlas connection failed:', err.message);
      if (err.message && (err.message.includes('whitelist') || err.message.includes('SSL') || err.message.includes('ServerSelectionError'))) {
        console.error('[DB] Requirement: In MongoDB Atlas > Network Access, add 0.0.0.0/0 so Vercel can connect.');
      }
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
  }

  return cached.conn;
}

function isMongoConnected() {
  return Boolean(mongoose.connection && mongoose.connection.readyState === 1);
}

// ---------------------------------------------------------------------------
// Mongoose Schemas (Primary Production Persistent Storage on MongoDB Atlas)
// ---------------------------------------------------------------------------

const userSchema = new mongoose.Schema({
  name: { type: String, default: 'Farmer', trim: true },
  email: { type: String, lowercase: true, trim: true, sparse: true, index: true },
  phone: { type: String, trim: true, sparse: true, index: true },
  pinHash: { type: String, required: true }
}, {
  timestamps: true,
  collection: 'users'
});

const fieldProfileSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  phone: { type: String },
  name: { type: String, default: 'தஞ்சாவூர் காவிரி டெல்டா வயல்' },
  farmerName: { type: String, default: 'Farmer' },
  county: { type: String, default: 'Thanjavur (தஞ்சாவூர்)' },
  state: { type: String, default: 'Tamil Nadu' },
  fieldId: { type: String, default: 'field_tn01' },
  location: {
    lat: { type: Number, default: 10.7870 },
    lng: { type: Number, default: 79.1378 },
    name: { type: String, default: 'தஞ்சாவூர் (Thanjavur)' },
    district: { type: String, default: 'Thanjavur' },
    zone: { type: String, default: 'காவிரி டெல்டா' }
  },
  areaAcres: { type: Number, default: 5 },
  soil: {
    texture: { type: String, default: 'Alluvial Clay Loam (வண்டல் மண்)' },
    organicMatterPct: { type: Number, default: 2.1 },
    pH: { type: Number, default: 7.2 },
    drainage: { type: String, default: 'Well drained' },
    awcInches: { type: Number, default: 2.5 },
    source: { type: String, default: 'TNAU Soil Survey / NASA MERRA-2' }
  },
  waterSource: { type: String, default: 'irrigated' },
  currentCrop: { type: String, default: 'paddy' },
  previousCrops: { type: [String], default: ['paddy', 'black_gram'] },
  priorities: { type: [String], default: ['Save water', 'Protect my soil', 'Earn more', 'Lower my risk'] }
}, {
  timestamps: true,
  collection: 'field_profiles'
});

// Avoid OverwriteModelError in serverless HMR
const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);
const MongooseFieldProfile = mongoose.models.FieldProfile || mongoose.model('FieldProfile', fieldProfileSchema);

// ---------------------------------------------------------------------------
// High-Reliability Local JSON Fallback (For offline development & zero-disk failover)
// ---------------------------------------------------------------------------
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NOW_REGION);
const SEED_DATA_DIR = path.resolve(__dirname, '../../data');
const ACTIVE_DATA_DIR = isServerless 
  ? path.join(os.tmpdir(), 'nilam_pesum_data') 
  : SEED_DATA_DIR;

if (isServerless) {
  try {
    if (!fs.existsSync(ACTIVE_DATA_DIR)) {
      fs.mkdirSync(ACTIVE_DATA_DIR, { recursive: true });
    }
    const seedUsers = path.join(SEED_DATA_DIR, 'users.json');
    const tmpUsers = path.join(ACTIVE_DATA_DIR, 'users.json');
    if (!fs.existsSync(tmpUsers) && fs.existsSync(seedUsers)) {
      fs.copyFileSync(seedUsers, tmpUsers);
    }
    const seedProfiles = path.join(SEED_DATA_DIR, 'profiles.json');
    const tmpProfiles = path.join(ACTIVE_DATA_DIR, 'profiles.json');
    if (!fs.existsSync(tmpProfiles) && fs.existsSync(seedProfiles)) {
      fs.copyFileSync(seedProfiles, tmpProfiles);
    }
  } catch (err) {}
}

const USERS_FILE = path.join(ACTIVE_DATA_DIR, 'users.json');
const PROFILES_FILE = path.join(ACTIVE_DATA_DIR, 'profiles.json');
const SEED_USERS_FILE = path.join(SEED_DATA_DIR, 'users.json');
const SEED_PROFILES_FILE = path.join(SEED_DATA_DIR, 'profiles.json');

try {
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');
} catch (e) {}
try {
  if (!fs.existsSync(PROFILES_FILE)) fs.writeFileSync(PROFILES_FILE, '[]', 'utf8');
} catch (e) {}

class LocalJsonStore {
  constructor(filePath, seedFilePath) {
    this.filePath = filePath;
    this.seedFilePath = seedFilePath;
    this.memoryCache = null;
  }

  read() {
    if (this.memoryCache) return this.memoryCache;

    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf8');
        this.memoryCache = JSON.parse(content || '[]');
        return this.memoryCache;
      }
    } catch (e) {}

    try {
      if (this.seedFilePath && fs.existsSync(this.seedFilePath)) {
        const content = fs.readFileSync(this.seedFilePath, 'utf8');
        this.memoryCache = JSON.parse(content || '[]');
        return this.memoryCache;
      }
    } catch (e) {}

    this.memoryCache = [];
    return this.memoryCache;
  }

  write(data) {
    this.memoryCache = data;
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.warn(`[LocalJsonStore] Read-only disk detected (${err.message}). Safe in memory cache.`);
    }
  }

  find(predicate) {
    const list = this.read();
    return predicate ? list.filter(predicate) : list;
  }

  findOne(predicate) {
    const list = this.read();
    return list.find(predicate) || null;
  }

  create(item) {
    const list = this.read();
    const doc = {
      _id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    list.push(doc);
    this.write(list);
    return doc;
  }

  updateOne(predicate, updates) {
    const list = this.read();
    const idx = list.findIndex(predicate);
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.write(list);
    return list[idx];
  }
}

const localUserStore = new LocalJsonStore(USERS_FILE, SEED_USERS_FILE);
const localProfileStore = new LocalJsonStore(PROFILES_FILE, SEED_PROFILES_FILE);

module.exports = {
  connectDB,
  isMongoConnected,
  MongooseUser,
  MongooseFieldProfile,
  localUserStore,
  localProfileStore
};
