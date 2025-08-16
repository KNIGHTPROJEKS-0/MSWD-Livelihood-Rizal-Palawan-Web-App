#!/usr/bin/env node

// Test script to verify Railway FastAPI connection
const https = require('https');

const RAILWAY_API_URL = 'https://fastapi-production-9cc0.up.railway.app';

console.log('🚀 Testing Railway FastAPI Connection...');
console.log(`📡 API URL: ${RAILWAY_API_URL}`);

// Test health endpoint
function testHealthEndpoint() {
  return new Promise((resolve, reject) => {
    const req = https.get(`${RAILWAY_API_URL}/health`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Health Check Status: ${res.statusCode}`);
        console.log(`📋 Response: ${data}`);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Health Check Error: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.error('❌ Health Check Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Test API v1 endpoint
function testAPIEndpoint() {
  return new Promise((resolve, reject) => {
    const req = https.get(`${RAILWAY_API_URL}/api/v1/`, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ API v1 Status: ${res.statusCode}`);
        console.log(`📋 Response: ${data}`);
        resolve({ status: res.statusCode, data });
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ API v1 Error: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.error('❌ API v1 Timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Run tests
async function runTests() {
  try {
    console.log('\n🔍 Testing Health Endpoint...');
    await testHealthEndpoint();
    
    console.log('\n🔍 Testing API v1 Endpoint...');
    await testAPIEndpoint();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Update your frontend environment variables');
    console.log('2. Deploy your frontend to Railway');
    console.log('3. Test the full application flow');
    
  } catch (error) {
    console.error('\n💥 Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check if your Railway FastAPI is running');
    console.log('2. Verify the domain: fastapi-production-9cc0.up.railway.app');
    console.log('3. Check Railway logs for any errors');
  }
}

runTests();