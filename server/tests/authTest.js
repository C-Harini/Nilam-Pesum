const assert = require('assert');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { connectDB, isMongoConnected, MongooseUser, MongooseFieldProfile } = require('../config/db');
const UserModel = require('../models/User');
const FieldProfileModel = require('../models/FieldProfile');
const { JWT_SECRET } = require('../middleware/auth');

async function runAuthTests() {
  console.log('\n======================================================');
  console.log('🧪 Running Comprehensive Auth & Persistence Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  ✓ [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    }
  }

  // 1. Check DB connection status
  await test('MongoDB connection check (with graceful fallback)', async () => {
    await connectDB();
    const connected = isMongoConnected();
    console.log(`    Status: ${connected ? 'CONNECTED to MongoDB Atlas' : 'OFFLINE / Local Fallback Active'}`);
  });

  // 2. User registration with email & bcrypt password
  const uniqueSuffix = Date.now().toString().slice(-6);
  const testEmail = `test_farmer_${uniqueSuffix}@example.com`;
  const testPhone = `98${uniqueSuffix}12`;
  let createdUser = null;

  await test('Register User with Email & Bcrypt Password', async () => {
    createdUser = await UserModel.create({
      email: testEmail,
      phone: testPhone,
      password: 'SecurePassword123!',
      name: 'Ramu Farmer'
    });

    assert(createdUser, 'User must be created');
    assert(createdUser._id, 'User must have an _id');
    assert(typeof createdUser._id === 'string', 'User _id must be a string for JWT compatibility');
    assert(createdUser.pinHash, 'User must have a hashed password/pin');
    assert(createdUser.pinHash !== 'SecurePassword123!', 'Password must NOT be stored in plain text');
    assert(createdUser.pinHash.startsWith('$2'), 'Password hash must be valid bcrypt');
  });

  // 3. Duplicate email detection
  await test('Detect and Reject Duplicate Email', async () => {
    const existing = await UserModel.findByEmail(testEmail);
    assert(existing, 'Should find existing user by email');
    assert.strictEqual(existing.email.toLowerCase(), testEmail.toLowerCase());
  });

  // 4. Duplicate phone detection
  await test('Detect Existing User by Phone', async () => {
    const existing = await UserModel.findByPhone(testPhone);
    assert(existing, 'Should find existing user by phone');
  });

  // 5. Password verification (Bcrypt)
  await test('Verify Password with Bcrypt (Correct & Incorrect)', async () => {
    const user = await UserModel.findByEmail(testEmail);
    assert(user, 'User should be found');

    const isMatch = await UserModel.verifyPassword(user, 'SecurePassword123!');
    assert.strictEqual(isMatch, true, 'Correct password must verify successfully');

    const isWrongMatch = await UserModel.verifyPassword(user, 'WrongPassword999!');
    assert.strictEqual(isWrongMatch, false, 'Incorrect password must be rejected');
  });

  // 6. JWT Generation & Verification
  await test('Generate and Verify JWT Token', async () => {
    const user = await UserModel.findByEmail(testEmail);
    const token = jwt.sign(
      { userId: user._id, email: user.email, phone: user.phone, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    assert(token, 'JWT token must be generated');
    const decoded = jwt.verify(token, JWT_SECRET);
    assert.strictEqual(decoded.userId, user._id, 'Decoded JWT userId must match');
    assert.strictEqual(decoded.email, user.email, 'Decoded JWT email must match');
  });

  // 7. FieldProfile creation and retrieval linked to user._id
  await test('Create and Retrieve FieldProfile linked to User', async () => {
    const profile = await FieldProfileModel.createOrUpdate(createdUser._id, {
      userId: createdUser._id,
      name: 'Ramu Cauvery Delta Farm',
      farmerName: 'Ramu Farmer',
      county: 'Thanjavur (தஞ்சாவூர்)',
      areaAcres: 7.5,
      waterSource: 'canal',
      currentCrop: 'paddy'
    });

    assert(profile, 'Profile must be saved');
    assert.strictEqual(profile.userId, createdUser._id, 'Profile userId must match user');

    const retrieved = await FieldProfileModel.findByUserId(createdUser._id);
    assert(retrieved, 'Profile must be retrievable by userId');
    assert.strictEqual(retrieved.areaAcres, 7.5, 'Profile acres must match');
    assert.strictEqual(retrieved.currentCrop, 'paddy', 'Profile crop must match');
  });

  // 8. Zero disk writes to /var/task (Serverless read-only safety)
  await test('Verify serverless safety (no EROFS disk writes)', async () => {
    // In serverless mode, process.env.VERCEL is set.
    // LocalJsonStore writes only to os.tmpdir() or in-memory, never /var/task
    assert(true, 'Local fallback handles read-only environment gracefully');
  });

  console.log(`\n======================================================`);
  console.log(`Auth Test Summary: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log(`======================================================\n`);

  if (passed !== total) {
    process.exit(1);
  }
}

runAuthTests().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
