#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔧 Firebase Configuration Fix Tool');

try {
  // Check if Firebase CLI is installed
  execSync('firebase --version', { stdio: 'ignore' });
  console.log('✅ Firebase CLI found');
} catch (error) {
  console.log('❌ Firebase CLI not found. Installing...');
  execSync('npm install -g firebase-tools', { stdio: 'inherit' });
}

// Login to Firebase
console.log('🔐 Logging into Firebase...');
try {
  execSync('firebase login --no-localhost', { stdio: 'inherit' });
  console.log('✅ Firebase login successful');
} catch (error) {
  console.log('❌ Firebase login failed');
  process.exit(1);
}

// Set project
console.log('🎯 Setting Firebase project...');
try {
  execSync('firebase use mswd-livelihood-web-app', { stdio: 'inherit' });
  console.log('✅ Project set successfully');
} catch (error) {
  console.log('❌ Failed to set project');
}

console.log('\n📋 Next steps:');
console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
console.log('2. Select project: mswd-livelihood-web-app');
console.log('3. Go to Authentication → Settings → Authorized domains');
console.log('4. Add: localhost, mswd-livelihood-web-app.web.app');
console.log('5. Run: npm run dev');