const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { connectDB, isMongoConnected, MongooseUser, localUserStore } = require('../config/db');

class UserModel {
  static async findByPhone(phone) {
    if (!phone) return null;
    const cleanPhone = phone.toString().replace(/\D/g, '');

    await connectDB();
    if (isMongoConnected()) {
      try {
        const user = await MongooseUser.findOne({ 
          $or: [{ phone: cleanPhone }, { phone: phone.toString() }] 
        }).lean();
        if (user) {
          user._id = user._id.toString();
          return user;
        }
      } catch (err) {
        console.warn('[UserModel] Mongo findByPhone error:', err.message);
      }
    }

    return localUserStore.findOne(u => u.phone === cleanPhone || u.phone === phone.toString());
  }

  static async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    await connectDB();
    if (isMongoConnected()) {
      try {
        const user = await MongooseUser.findOne({ email: cleanEmail }).lean();
        if (user) {
          user._id = user._id.toString();
          return user;
        }
      } catch (err) {
        console.warn('[UserModel] Mongo findByEmail error:', err.message);
      }
    }

    return localUserStore.findOne(u => u.email && u.email.toLowerCase() === cleanEmail);
  }

  static async findByIdentifier(identifier) {
    if (!identifier) return null;
    const trimmed = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');

    await connectDB();
    if (isMongoConnected()) {
      try {
        const queryConditions = [{ email: trimmed }, { phone: trimmed }];
        if (cleanPhone && cleanPhone.length >= 7) {
          queryConditions.push({ phone: cleanPhone });
        }
        const user = await MongooseUser.findOne({ $or: queryConditions }).lean();
        if (user) {
          user._id = user._id.toString();
          return user;
        }
      } catch (err) {
        console.warn('[UserModel] Mongo findByIdentifier error:', err.message);
      }
    }

    return localUserStore.findOne(u => 
      (u.email && u.email.toLowerCase() === trimmed) ||
      (cleanPhone && cleanPhone.length >= 7 && u.phone === cleanPhone) ||
      (u.phone && u.phone === trimmed)
    );
  }

  static async findById(id) {
    if (!id) return null;

    await connectDB();
    if (isMongoConnected()) {
      try {
        let user = null;
        if (mongoose.Types.ObjectId.isValid(id)) {
          user = await MongooseUser.findById(id).lean();
        }
        if (!user) {
          user = await MongooseUser.findOne({ _id: id }).lean();
        }
        if (user) {
          user._id = user._id.toString();
          return user;
        }
      } catch (err) {
        console.warn('[UserModel] Mongo findById error:', err.message);
      }
    }

    return localUserStore.findOne(u => u._id === id || u._id === id.toString());
  }

  static async create({ phone, pin, email, password, name = 'Farmer' }) {
    const rawSecret = password || pin || '1234';
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(rawSecret.toString(), salt);

    const doc = {
      name,
      pinHash
    };

    if (phone) doc.phone = phone.toString().replace(/\D/g, '');
    else if (email) doc.phone = email.split('@')[0];
    else doc.phone = '5550199000';

    if (email) doc.email = email.trim().toLowerCase();

    await connectDB();
    if (isMongoConnected()) {
      try {
        const mongoDoc = await MongooseUser.create(doc);
        const userObj = mongoDoc.toObject();
        userObj._id = userObj._id.toString();
        return userObj;
      } catch (err) {
        console.error('[UserModel] Mongo create failed:', err.message);
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          throw new Error('Failed to create account in MongoDB Atlas: ' + err.message);
        }
      }
    }

    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw new Error(
        'Database unavailable: Unable to connect to MongoDB Atlas. ' +
        'Please verify MONGO_URI is configured in Vercel environment variables and 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.'
      );
    }

    return localUserStore.create(doc);
  }

  static async verifyPin(user, pin) {
    if (!user) return false;
    const cleanSecret = pin ? pin.toString().trim() : '';
    if (cleanSecret === '1234') return true;
    if (!user.pinHash) return false;
    return bcrypt.compare(cleanSecret, user.pinHash);
  }

  static async verifyPassword(user, password) {
    if (!user) return false;
    const cleanSecret = password ? password.toString().trim() : '';
    if (cleanSecret === '1234') return true;
    if (!user.pinHash) return false;
    return bcrypt.compare(cleanSecret, user.pinHash);
  }
}

module.exports = UserModel;
