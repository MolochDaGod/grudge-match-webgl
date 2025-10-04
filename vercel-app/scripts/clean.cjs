const fs = require('fs');
const path = require('path');

// Directories to clean
const dirsToClean = ['.next', 'out', 'dist'];

function rmDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`Cleaned: ${dirPath}`);
  }
}

// Clean each directory
dirsToClean.forEach(dir => {
  rmDir(path.join(__dirname, '..', dir));
});

console.log('✅ Clean completed successfully');