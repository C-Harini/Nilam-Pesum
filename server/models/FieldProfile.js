const { localProfileStore } = require('../config/db');

class FieldProfileModel {
  static async findByUserId(userId) {
    return localProfileStore.findOne(p => p.userId === userId);
  }

  static async findByFieldId(fieldId) {
    return localProfileStore.findOne(p => p.fieldId === fieldId);
  }

  static async createOrUpdate(userId, profileData) {
    const existing = localProfileStore.findOne(p => p.userId === userId);
    if (existing) {
      return localProfileStore.updateOne(p => p.userId === userId, profileData);
    }

    return localProfileStore.create({
      userId,
      ...profileData
    });
  }

  static async getAll() {
    return localProfileStore.find();
  }
}

module.exports = FieldProfileModel;
