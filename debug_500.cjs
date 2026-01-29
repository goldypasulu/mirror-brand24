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
          data: data,
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

function parseToken(str) {
  try { return JSON.parse(str); } catch(e) { return null; }
}

async function runDebug() {
  console.log('--- Debugging 500 Error on /scrap/scrap-data ---\n');
  const baseUrl = 'https://api.lodify.lodemo.id';
  
  // 1. Get Token
  console.log('Fetching Token...');
  const tokenRes = await request(`${baseUrl}/scrap/gettoken`, { method: 'GET' });
  const tokenBody = parseToken(tokenRes.data);
  const token = tokenBody?.token;
  const projectId = tokenBody?.project_id; // "1397360667" from previous logs
  
  if (!token) {
    console.error('Failed to get token');
    return;
  }
  console.log(`Token: YES, Project ID: ${projectId}`);

  const defaultHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const combinations = [
    {
      name: 'Query: date w/ limit & page',
      query: `date_from=2024-01-01&date_to=2024-01-31&limit=10&page=1`,
      body: {} // Empty body
    },
    {
      name: 'Query: date w/ project_id',
      query: `date_from=2024-01-01&date_to=2024-01-31&project_id=${projectId}`,
      body: {}
    },
    {
      name: 'Query: date w/ id (int)',
      query: `date_from=2024-01-01&date_to=2024-01-31&id=1`,
      body: {}
    },
    {
      name: 'Body: JSON date Params',
      query: '',
      body: { date_from: '2024-01-01', date_to: '2024-01-31' }
    },
    {
      name: 'Body: JSON date + limit (int)',
      query: '',
      body: { date_from: '2024-01-01', date_to: '2024-01-31', limit: 10, page: 1 }
    },
    {
      name: 'Body: JSON date + project_id',
      query: '',
      body: { date_from: '2024-01-01', date_to: '2024-01-31', project_id: projectId }
    },
    {
       name: 'Query: Mixed (Date query, Limit body)',
       query: `date_from=2024-01-01&date_to=2024-01-31`,
       body: { limit: 10, page: 1 }
    },
    {
      name: 'Query: limit & offset',
      query: `date_from=2024-01-01&date_to=2024-01-31&limit=10&offset=0`,
      body: {}
    },
    {
      name: 'Query: per_page & page',
      query: `date_from=2024-01-01&date_to=2024-01-31&per_page=10&page=1`,
      body: {}
    },
    // Try forcing Content-Type x-www-form-urlencoded logic? No passing JSON body
  ];

  for (const c of combinations) {
    console.log(`\nTesting [${c.name}]...`);
    const qs = c.query ? `?${c.query}` : '';
    const postData = JSON.stringify(c.body);
    
    // override headers if needed
    const headers = { ...defaultHeaders, 'Content-Length': Buffer.byteLength(postData) };

    const res = await request(`${baseUrl}/scrap/scrap-data${qs}`, {
      method: 'POST',
      headers: headers
    }, postData);

    console.log(`   Status: ${res.statusCode}`);
    if (res.statusCode !== 200) {
       // Log short error
       const detail = res.data.length > 200 ? res.data.substring(0, 200) + '...' : res.data;
       console.log(`   Error: ${detail}`);
    } else {
       console.log(`   SUCCESS! Data length: ${res.data.length}`);
    }
  }

}

runDebug();
