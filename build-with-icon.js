const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const iconPath = path.resolve(__dirname, 'assets', 'icon.ico');
const exePath = path.resolve(__dirname, 'dist', 'FastLoader-win32-x64', 'FastLoader.exe');

console.log('Building with icon:', iconPath);

if (!fs.existsSync(iconPath)) {
  console.error('Icon not found:', iconPath);
  process.exit(1);
}

const iconPathForPackager = iconPath.replace(/\\/g, '/');

try {
  execSync(`npx electron-packager . FastLoader --platform=win32 --arch=x64 --out=dist --overwrite --icon="${iconPathForPackager}"`, {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('\nBuild completed!');
  console.log('Executable:', exePath);
  console.log('Icon used:', iconPath);
  
  if (fs.existsSync(exePath)) {
    console.log('\nTo update the icon manually if it did not work:');
    console.log('1. Download Resource Hacker: http://www.angusj.com/resourcehacker/');
    console.log('2. Open:', exePath);
    console.log('3. Action > Replace Icon > Select:', iconPath);
    console.log('4. Save');
  }
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}

