const https = require('https');

function request(options, payload = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

(async () => {
  try {
    // 1. Get Token
    console.log('Fetching Token...');
    const tokenRes = await request({
      hostname: 'api.lodify.lodemo.id',
      path: '/scrap/gettoken',
      method: 'GET',
      headers: { 'accept': 'application/json' }
    });
    
    const tokenData = JSON.parse(tokenRes.body);
    const token = tokenData.token;
    console.log('Token acquired:', token ? 'Yes' : 'No');

    // 2. Call Insight
    console.log('Calling get-ai-insight...');
    const payload = JSON.stringify({
      projectId: 1397360667,
      reportId: "696e15c4bfdb8aa2aad37b67"
    });

    const insightRes = await request({
      hostname: 'api.lodify.lodemo.id',
      path: '/scrap/get-ai-insight',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, payload);

    console.log('STATUS:', insightRes.statusCode);
    console.log('RESPONSE:', insightRes.body);

  } catch (e) {
    console.error(e);
  }
})();
