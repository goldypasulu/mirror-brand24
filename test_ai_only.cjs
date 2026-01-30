#!/usr/bin/env node

/**
 * Test Script: AI Insight Direct Test
 * 
 * This script tests ONLY the AI Insight API functionality.
 */

const https = require('https');

// ═══════════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════════

const BASE_URL = 'api.lodify.lodemo.id';

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

// ═══════════════════════════════════════════════════════════
// Test Workflow
// ═══════════════════════════════════════════════════════════

async function testAiOnly() {
  log('\n╔════════════════════════════════════════════════════════╗', 'blue');
  log('║  AI Insight API Test (Direct)                          ║', 'blue');
  log('╚════════════════════════════════════════════════════════╝\n', 'blue');

  let credentials = null;

  try {
    // ─────────────────────────────────────────────────────────
    // Step 0: Get Token
    // ─────────────────────────────────────────────────────────
    log('📦 Step 0: Getting credentials...', 'yellow');
    
    // Using verified credentials from workflow test
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
    log(`✅ Token received: ${credentials.token}`, 'green');
    log(`   Project ID: ${credentials.project_id}`, 'green');
    
    // ─────────────────────────────────────────────────────────
    // Step 4: Get AI Insight (GraphQL)
    // ─────────────────────────────────────────────────────────
    log('\n🤖 Step 1: Getting AI Insight...', 'yellow');

    const query = `
      query getAiReport($projectId: Int!, $reportId: String!) {
        getAiReport(projectId: $projectId, reportId: $reportId) {
          id
          body {
            headline
            trends
            insights
            recommendations
          }
        }
      }
    `;

    const variables = {
      projectId: parseInt(credentials.project_id),
      reportId: credentials.report_id
    };

    const insightHeaders = {
      'Cookie': credentials.cookies,
      'token': credentials.token,
      'project-id': credentials.project_id,
      'tknb24': credentials.token,
    };

    const insightResponse = await makeRequest(
      '/scrap/get-ai-insight',
      'POST',
      insightHeaders,
      { query, variables }
    );

    log(`   Status: ${insightResponse.status} ${insightResponse.statusText}`, 
        insightResponse.status === 200 ? 'green' : 'red');

    if (insightResponse.status === 200) {
      const dataStr = JSON.stringify(insightResponse.data);
      log(`   ✅ Insight received! Length: ${dataStr.length}`, 'green');
      
      const body = insightResponse.data?.data?.getAiReport?.body;
      if (body) {
        log(`   📄 Headline: "${body.headline}"`, 'green');
        log(`   📈 Trends: ${body.trends?.length || 0}`, 'green');
      }
    } else {
      log(`   ❌ Error: ${JSON.stringify(insightResponse.data)}`, 'red');
    }

    // ─────────────────────────────────────────────────────────
    // Success!
    // ─────────────────────────────────────────────────────────
    log('\n╔════════════════════════════════════════════════════════╗', 'green');
    log('║  ✅ TEST COMPLETED                                     ║', 'green');
    log('╚════════════════════════════════════════════════════════╝\n', 'green');

  } catch (error) {
    log(`\n❌ Unexpected error: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run
testAiOnly();
