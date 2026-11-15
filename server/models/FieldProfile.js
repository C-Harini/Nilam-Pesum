const { connectDB, isMongoConnected, MongooseFieldProfile, localProfileStore } = require('../config/db');

class FieldProfileModel {
  static async findByUserId(userId) {
    if (!userId) return null;
    const strUserId = userId.toString();

    await connectDB();
    if (isMongoConnected()) {
      try {
        const profile = await MongooseFieldProfile.findOne({ userId: strUserId }).lean();
        if (profile) {
          profile._id = profile._id.toString();
          return profile;
        }
      } catch (err) {
        console.warn('[FieldProfileModel] Mongo findByUserId error:', err.message);
      }
    }

    return localProfileStore.findOne(p => p.userId === strUserId || p.userId === userId);
  }

  static async findByFieldId(fieldId) {
    if (!fieldId) return null;
    const strFieldId = fieldId.toString();

    await connectDB();
    if (isMongoConnected()) {
      try {
        const profile = await MongooseFieldProfile.findOne({ fieldId: strFieldId }).lean();
        if (profile) {
          profile._id = profile._id.toString();
          return profile;
        }
      } catch (err) {
        console.warn('[FieldProfileModel] Mongo findByFieldId error:', err.message);
      }
    }

    return localProfileStore.findOne(p => p.fieldId === strFieldId || p.fieldId === fieldId);
  }

  static async createOrUpdate(userId, profileData) {
    if (!userId) return null;
    const strUserId = userId.toString();

    await connectDB();
    if (isMongoConnected()) {
      try {
        const updated = await MongooseFieldProfile.findOneAndUpdate(
          { userId: strUserId },
          { $set: { userId: strUserId, ...profileData } },
          { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();

        if (updated) {
          updated._id = updated._id.toString();
          return updated;
        }
      } catch (err) {
        console.error('[FieldProfileModel] Mongo createOrUpdate error:', err.message);
        if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
          throw new Error('Failed to save profile in MongoDB Atlas: ' + err.message);
        }
      }
    }

    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw new Error(
        'Database unavailable: Unable to connect to MongoDB Atlas to persist profile. ' +
        'Please verify MONGO_URI and MongoDB Atlas Network Access whitelist.'
      );
    }

    const existing = localProfileStore.findOne(p => p.userId === strUserId || p.userId === userId);
    if (existing) {
      return localProfileStore.updateOne(p => p.userId === strUserId || p.userId === userId, profileData);
    }

    return localProfileStore.create({
      userId: strUserId,
      ...profileData
    });
  }

  static async getAll() {
    await connectDB();
    if (isMongoConnected()) {
      try {
        const list = await MongooseFieldProfile.find().lean();
        if (list && list.length > 0) {
          return list.map(item => ({ ...item, _id: item._id.toString() }));
        }
      } catch (err) {
        console.warn('[FieldProfileModel] Mongo getAll error:', err.message);
      }
    }

    return localProfileStore.find();
  }
}

module.exports = FieldProfileModel;
