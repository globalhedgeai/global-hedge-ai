#!/usr/bin/env node

import { execSync } from 'node:child_process';
import * as http from 'node:http';

function sh(cmd: string, cwd = process.cwd()) {
  console.log('\n$ ' + cmd);
  try {
    execSync(cmd, { stdio: 'inherit', cwd, env: process.env, shell: process.platform === 'win32' ? 'cmd.exe' : '/bin/sh' });
  } catch (error) {
    console.error('Command failed:', error);
    throw error;
  }
}

async function testHealth() {
  console.log('\n🔍 Testing health endpoint...');
  const body = await new Promise<string>((resolve) => {
    const req = http.get('http://localhost:3001/api/health', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve('ERROR'));
  });
  
  console.log('[health] => ' + body);
  if (!/\"ok\"\s*:\s*true/.test(body)) {
    throw new Error('Health check failed');
  }
  console.log('✅ Health check passed');
}

async function testDailyRewardStatus() {
  console.log('\n🔍 Testing daily reward status...');
  const body = await new Promise<string>((resolve) => {
    const req = http.get('http://localhost:3001/api/rewards/daily/status', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve('ERROR'));
  });
  
  console.log('[daily reward status] => ' + body);
  if (!/\"ok\"\s*:\s*true/.test(body)) {
    throw new Error('Daily reward status check failed');
  }
  console.log('✅ Daily reward status check passed');
}

async function testMessagesAPI() {
  console.log('\n🔍 Testing messages API...');
  const body = await new Promise<string>((resolve) => {
    const req = http.get('http://localhost:3001/api/messages', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve('ERROR'));
  });
  
  console.log('[messages API] => ' + body);
  if (!/\"ok\"\s*:\s*true/.test(body)) {
    throw new Error('Messages API check failed');
  }
  console.log('✅ Messages API check passed');
}

async function testReferralsAPI() {
  console.log('\n🔍 Testing referrals API...');
  const body = await new Promise<string>((resolve) => {
    const req = http.get('http://localhost:3001/api/referrals', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve('ERROR'));
  });
  
  console.log('[referrals API] => ' + body);
  if (!/\"ok\"\s*:\s*true/.test(body)) {
    throw new Error('Referrals API check failed');
  }
  console.log('✅ Referrals API check passed');
}

async function testPoliciesAPI() {
  console.log('\n🔍 Testing policies API...');
  const body = await new Promise<string>((resolve) => {
    const req = http.get('http://localhost:3001/api/policies', (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    });
    req.on('error', () => resolve('ERROR'));
  });
  
  console.log('[policies API] => ' + body);
  if (!/\"ok\"\s*:\s*true/.test(body)) {
    throw new Error('Policies API check failed');
  }
  console.log('✅ Policies API check passed');
}

async function main() {
  console.log('🚀 Starting comprehensive test suite...');
  
  try {
    await testHealth();
    await testDailyRewardStatus();
    await testMessagesAPI();
    await testReferralsAPI();
    await testPoliciesAPI();
    
    console.log('\n🎉 All tests passed!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Health endpoint working');
    console.log('✅ Daily reward system functional');
    console.log('✅ Messages system functional');
    console.log('✅ Referrals system functional');
    console.log('✅ Policies system functional');
    console.log('\n🌐 Ready for demo on port 3001');
    
  } catch (error) {
    console.error('\n❌ Test failed:', (error as Error)?.message || error);
    process.exit(1);
  }
}

main();
