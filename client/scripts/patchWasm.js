const fs = require('fs');
const path = require('path');

try {
  const srcDir = path.resolve(__dirname, '../node_modules/@rollup/wasm-node/dist');
  const dstDir = path.resolve(__dirname, '../node_modules/rollup/dist');

  if (fs.existsSync(srcDir) && fs.existsSync(dstDir)) {
    fs.cpSync(path.join(srcDir, 'wasm-node'), path.join(dstDir, 'wasm-node'), { recursive: true });
    fs.copyFileSync(path.join(srcDir, 'native.js'), path.join(dstDir, 'native.js'));
    console.log('[POSTINSTALL] Patched Rollup to WebAssembly for AppLocker compatibility');
  }
} catch (e) {
  // Silent fallback
}
