#!/usr/bin/env node

/**
 * Test Script: Scrap → Truncate → Insert Workflow
 * 
 * This script tests the complete API workflow without using the frontend.
 * It will help identify exactly where the 500 error occurs.
 */

const https = require('https');

// ═══════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════

const BASE_URL = 'api.lodify.lodemo.id';
const DATE_FROM = '2026-01-04';
const DATE_TO = '2026-01-11';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

// ═══════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeRequest(path, method = 'GET', headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      path: path,
      method: method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: jsonData,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            statusText: res.statusMessage,
            headers: res.headers,
            data: data,
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════
// Test Workflow
// ═══════════════════════════════════════════════════════════

async function testWorkflow() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║  API Workflow Test: Scrap → Truncate → Insert         ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝\n', 'blue');

  let credentials = null;

  try {
    // ─────────────────────────────────────────────────────────
    // Step 0: Get Token
    // ─────────────────────────────────────────────────────────
    log('📦 Step 0: Getting credentials...', 'yellow');
    
    const tokenResponse = await makeRequest('/scrap/gettoken', 'POST', {}, {
      username: 'julian@lodagency.co.id',
      password: '@Lod@2025v2'
    });
    
    if (tokenResponse.status !== 200) {
      log(`❌ Failed to get token: ${tokenResponse.status}`, 'red');
      console.log(tokenResponse.data);
      return;
    }

    credentials = tokenResponse.data;
    log(`✅ Token received: ${credentials.token.substring(0, 20)}...`, 'green');
    log(`   Project ID: ${credentials.project_id}`, 'green');
    log(`   Report ID: ${credentials.report_id}`, 'green');
    
    await sleep(1000);

    // ─────────────────────────────────────────────────────────
    // Step 1: Scrape Data
    // ─────────────────────────────────────────────────────────
    log('\n📡 Step 1: Scraping data from Brand24...', 'yellow');
    
    const scrapHeaders = {
      'Cookie': credentials.cookies,
      'token': credentials.token,
      'project-id': credentials.project_id,
      'tknb24': credentials.token,
    };

    const scrapResponse = await makeRequest(
      `/scrap/scrap-data?date_from=${DATE_FROM}&date_to=${DATE_TO}`,
      'POST',
      scrapHeaders
    );

    log(`   Status: ${scrapResponse.status} ${scrapResponse.statusText}`, 
        scrapResponse.status === 200 ? 'green' : 'red');
    
    if (scrapResponse.status === 200) {
      log(`   ✅ ${scrapResponse.data.detail || scrapResponse.data.message || 'Success'}`, 'green');
    } else {
      log(`   ❌ Error: ${JSON.stringify(scrapResponse.data)}`, 'red');
      log('\n🛑 Stopping test - scraping failed', 'red');
      return;
    }

    // Wait for scraping to complete
    log('   ⏳ Waiting 5 seconds for scraping to complete...', 'blue');
    await sleep(5000);

    // ─────────────────────────────────────────────────────────
    // Step 2: Truncate Data
    // ─────────────────────────────────────────────────────────
    log('\n🧹 Step 2: Truncating old data...', 'yellow');
    
    const truncateHeaders = {
      'Cookie': credentials.cookies,
      'token': credentials.token,
      'project-id': credentials.project_id,
      'tknb24': credentials.token,
    };

    const truncateResponse = await makeRequest(
      '/scrap/truncate',
      'DELETE',
      truncateHeaders
    );

    log(`   Status: ${truncateResponse.status} ${truncateResponse.statusText}`, 
        truncateResponse.status === 200 ? 'green' : 'red');
    
    if (truncateResponse.status === 200) {
      log(`   ✅ ${truncateResponse.data.message || truncateResponse.data.detail || 'Success'}`, 'green');
    } else {
      log(`   ❌ Error: ${JSON.stringify(truncateResponse.data)}`, 'red');
      log('\n🛑 Stopping test - truncate failed', 'red');
      return;
    }

    // Wait for truncate to complete
    log('   ⏳ Waiting 2 seconds for truncate to complete...', 'blue');
    await sleep(2000);

    // ─────────────────────────────────────────────────────────
    // Step 3: Insert Data
    // ─────────────────────────────────────────────────────────
    log('\n💾 Step 3: Inserting data to database...', 'yellow');
    
    const insertHeaders = {
      'Cookie': credentials.cookies,
      'token': credentials.token,
      'project-id': credentials.project_id,
      'tknb24': credentials.token,
    };

    const insertResponse = await makeRequest(
      `/scrap/insert-data?date_from=${DATE_FROM}&date_to=${DATE_TO}`,
      'POST',
      insertHeaders
    );

    log(`   Status: ${insertResponse.status} ${insertResponse.statusText}`, 
        insertResponse.status === 200 ? 'green' : 'red');
    
    if (insertResponse.status === 200) {
      log(`   ✅ ${insertResponse.data.detail || insertResponse.data.message || 'Success'}`, 'green');
    } else {
      log(`   ❌ Error: ${JSON.stringify(insertResponse.data)}`, 'red');
      
      // Show detailed error info
      log('\n📋 Error Details:', 'magenta');
      console.log(JSON.stringify(insertResponse.data, null, 2));
      
      log('\n🛑 Insert failed - this is the 500 error!', 'red');
      return;
    }

    // ─────────────────────────────────────────────────────────
    // Success!
    // ─────────────────────────────────────────────────────────
    log('\n╔════════════════════════════════════════════════════════╗', 'green');
    log('║  ✅ ALL STEPS COMPLETED SUCCESSFULLY!                  ║', 'green');
    log('╚════════════════════════════════════════════════════════╝\n', 'green');

  } catch (error) {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    console.error(error);
  }
}

// ═══════════════════════════════════════════════════════════
// Run Test
// ═══════════════════════════════════════════════════════════

log('\n🚀 Starting API workflow test...', 'blue');
log(`   Date range: ${DATE_FROM} to ${DATE_TO}`, 'blue');
log(`   Base URL: https://${BASE_URL}\n`, 'blue');

testWorkflow().then(() => {
  log('\n✨ Test completed!\n', 'blue');
}).catch((error) => {
  log(`\n💥 Test failed: ${error.message}\n`, 'red');
  console.error(error);
  process.exit(1);
});
