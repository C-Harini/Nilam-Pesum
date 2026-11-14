require('dotenv').config();
const dataRefresh = require('../services/nasa/dataRefresh');

async function main() {
  const args = process.argv.slice(2);
  let fieldId = 'field01';

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--field' && args[i + 1]) {
      fieldId = args[i + 1];
    }
  }

  try {
    const summary = await dataRefresh.refreshField(fieldId);
    console.log('[CLI] Data refresh finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error(`[CLI ERROR] Data refresh failed: ${err.message}`);
    process.exit(1);
  }
}

main();
