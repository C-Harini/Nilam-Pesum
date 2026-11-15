const bcrypt = require('bcryptjs');
const { localUserStore } = require('../config/db');

class UserModel {
  static async findByPhone(phone) {
    if (!phone) return null;
    return localUserStore.findOne(u => u.phone === phone);
  }

  static async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();
    return localUserStore.findOne(u => u.email && u.email.toLowerCase() === cleanEmail);
  }

  static async findByIdentifier(identifier) {
    if (!identifier) return null;
    const trimmed = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');
    return localUserStore.findOne(u => 
      (u.email && u.email.toLowerCase() === trimmed) ||
      (cleanPhone && cleanPhone.length >= 7 && u.phone === cleanPhone) ||
      (u.phone && u.phone === trimmed)
    );
  }

  static async findById(id) {
    return localUserStore.findOne(u => u._id === id);
  }

  static async create({ phone, pin, email, password, name = 'Farmer' }) {
    const rawSecret = password || pin || '1234';
    const salt = await bcrypt.genSalt(10);
    const pinHash = await bcrypt.hash(rawSecret.toString(), salt);

    const doc = {
      pinHash,
      name
    };

    if (phone) doc.phone = phone.toString();
    else if (email) doc.phone = email.split('@')[0];
    else doc.phone = '5550199000';

    if (email) doc.email = email.trim().toLowerCase();

    return localUserStore.create(doc);
  }

  static async verifyPin(user, pin) {
    if (!user || !user.pinHash) return false;
    return bcrypt.compare(pin.toString(), user.pinHash);
  }

  static async verifyPassword(user, password) {
    if (!user || !user.pinHash) return false;
    return bcrypt.compare(password.toString(), user.pinHash);
  }
}

module.exports = UserModel;

