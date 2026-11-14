const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROFILES_FILE = path.join(DATA_DIR, 'profiles.json');

// Ensure local persistence store files exist
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');
if (!fs.existsSync(PROFILES_FILE)) fs.writeFileSync(PROFILES_FILE, '[]', 'utf8');

let isMongoConnected = false;

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;
  if (mongoUri && mongoUri.trim().length > 0) {
    try {
      console.log('[DB] Connecting to MongoDB via MONGO_URI...');
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000
      });
      isMongoConnected = true;
      console.log('[DB] Connected to MongoDB successfully.');
      return;
    } catch (err) {
      console.warn(`[DB] MongoDB connection failed (${err.message}). Falling back to local persistence mode.`);
    }
  } else {
    console.log('[DB] No MONGO_URI configured. Operating in high-reliability local JSON persistence mode.');
  }
}

/**
 * File-backed persistence store fallback
 */
class LocalJsonStore {
  constructor(filePath) {
    this.filePath = filePath;
  }

  read() {
    try {
      if (!fs.existsSync(this.filePath)) return [];
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content || '[]');
    } catch (e) {
      return [];
    }
  }

  write(data) {
    fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
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

const localUserStore = new LocalJsonStore(USERS_FILE);
const localProfileStore = new LocalJsonStore(PROFILES_FILE);

module.exports = {
  connectDB,
  isMongoConnected: () => isMongoConnected,
  localUserStore,
  localProfileStore
};
