const https = require('https');

// Config
const BASE_HOST = 'api.lodify.lodemo.id';
const PATH = '/scrap/get-ai-insight';

// Helper for requests
function makeRequest(params) {
  return new Promise((resolve, reject) => {
    console.log('1. Fetching Token...');
    
    // 1. Get Token first
    const tokenReq = https.request({
      hostname: BASE_HOST,
      path: '/scrap/gettoken',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000 // 10s timeout
    }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        if (res.statusCode !== 200) {
            console.error('Auth Failed:', res.statusCode, data);
            return resolve(null);
        }
        try {
            const creds = JSON.parse(data).data; 
            console.log('Token Received:', creds.token.substring(0, 10) + '...');
            resolve(creds);
        } catch (e) {
            console.error('JSON Parse Error:', e);
            resolve(null);
        }
      });
    });
    
    tokenReq.on('error', (e) => {
        console.error('Token Request Error:', e.message);
        resolve(null);
    });
    
    tokenReq.on('timeout', () => {
        console.error('Token Request Timeout');
        tokenReq.destroy();
        resolve(null);
    });

    tokenReq.write(JSON.stringify({
      username: 'julian@lodagency.co.id',
      password: '@Lod@2025v2'
    }));
    tokenReq.end();
  }).then(creds => {
    if (!creds) {
        console.log('Skipping Insight Test due to auth failure');
        return;
    }

    // 2. Make GET Request with params
    const query = new URLSearchParams({
      ...params,
      project_id: creds.project_id,
      report_id: creds.report_id
    }).toString();

    console.log(`\nTesting Query: ?${query}`);

    return new Promise((resolve) => {
      const insightReq = https.request({
        hostname: BASE_HOST,
        path: `${PATH}?${query}`,
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${creds.token}`,
            'token': creds.token,
            'Accept': 'application/json',
            'x-proxy-cookie': creds.cookies 
        },
        timeout: 10000
      }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            if (res.statusCode === 200) console.log('✅ SUCCESS');
            else {
                console.log('❌ FAIL');
                console.log('Preview:', data.substring(0, 500));
            }
            resolve();
        });
      });
      
      insightReq.on('error', (e) => {
         console.error('Insight Request Error:', e.message);
         resolve();
      });
      
      insightReq.setHeader('Cookie', creds.cookies);
      insightReq.end();
    });
  });
}

async function runTests() {
  console.log('Starting Parameter Tests...');

  // Test 1: date_from (snake_case)
  await makeRequest({
    date_from: '2026-01-20',
    date_to: '2026-01-21',
    version: 'daily'
  });

  // Test 2: dateFrom (camelCase)
  await makeRequest({
    dateFrom: '2026-01-20',
    dateTo: '2026-01-21',
    version: 'daily'
  });
    
  // Test 3: project_id explicit (though already added in helper, let's explicit snake)
  // (Helper adds project_id already)
}

runTests();
