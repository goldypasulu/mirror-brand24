const https = require('https');

// Helper for requests
function request(url, options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data, // Keep raw string to parse later safely
        });
      });
    });
    
    req.on('error', (e) => resolve({ statusCode: 0, error: e.message }));
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Lodify API Audit ---\n');
  const baseUrl = 'https://api.lodify.lodemo.id';
  let token = '';

  // 1. Root
  console.log('1. Testing Root (GET /)...');
  const rootRes = await request(`${baseUrl}/`, { method: 'GET' });
  console.log(`   Status: ${rootRes.statusCode}`);
  // console.log(`   Body: ${rootRes.data}`);

  // 2. Items (GET)
  console.log('\n2. Testing Items List (GET /items/)...');
  const itemsRes = await request(`${baseUrl}/items/`, { method: 'GET' });
  console.log(`   Status: ${itemsRes.statusCode}`);
  
  // 3. Get Token
  console.log('\n3. Testing Get Token (GET /scrap/gettoken)...');
  const tokenRes = await request(`${baseUrl}/scrap/gettoken`, { method: 'GET' });
  console.log(`   Status: ${tokenRes.statusCode}`);
  try {
    const body = JSON.parse(tokenRes.data);
    token = body.token;
    console.log(`   Token received: ${token ? 'YES' : 'NO'}`);
  } catch (e) {
    console.log(`   Failed to parse token response: ${e.message}`);
  }

  if (!token) {
    console.log('\n!!! Stopping further tests: No Token available !!!');
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // 4. AI Insight (POST)
  console.log('\n4. Testing AI Insight (POST /scrap/get-ai-insight)...');
  const aiRes = await request(`${baseUrl}/scrap/get-ai-insight`, { 
    method: 'POST',
    headers: authHeaders
  });
  console.log(`   Status: ${aiRes.statusCode}`);
  console.log(`   Response Snippet: ${aiRes.data.substring(0, 100)}`);

  // 5. Scrap Data (POST)
  console.log('\n5. Testing Scrap Data (POST /scrap/scrap-data)...');
  const dateFrom = '2024-01-01';
  const dateTo = '2024-01-31';
  // Note: Docs say query params.
  const scrapUrl = `${baseUrl}/scrap/scrap-data?date_from=${dateFrom}&date_to=${dateTo}`;
  const scrapRes = await request(scrapUrl, { 
    method: 'POST',
    headers: authHeaders
  });
  console.log(`   Status: ${scrapRes.statusCode}`);
  console.log(`   Response Snippet: ${scrapRes.data.substring(0, 200)}`);

  // 6. Insert Data (POST)
  console.log('\n6. Testing Insert Data (POST /scrap/insert-data)...');
  const insertUrl = `${baseUrl}/scrap/insert-data?date_from=${dateFrom}&date_to=${dateTo}`;
  const insertRes = await request(insertUrl, {
    method: 'POST',
    headers: authHeaders
  });
  console.log(`   Status: ${insertRes.statusCode}`);
  console.log(`   Response Snippet: ${insertRes.data.substring(0, 200)}`);

  console.log('\n--- Audit Complete ---');
}

runTests();
