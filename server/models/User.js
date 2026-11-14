const bcrypt = require('bcryptjs');
const { localUserStore } = require('../config/db');

class UserModel {
  static async findByPhone(phone) {
    return localUserStore.findOne(u => u.phone === phone);
  }

  static async findById(id) {
    return localUserStore.findOne(u => u._id === id);
  }

  static async create({ phone, pin, name = 'Farmer' }) {
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(pin, salt);

    return localUserStore.create({
      phone,
      pinHash,
      name
    });
  }

  static async verifyPin(user, pin) {
    if (!user || !user.pinHash) return false;
    return bcrypt.compare(pin, user.pinHash);
  }
}

module.exports = UserModel;
