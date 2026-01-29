const https = require('https');

function request(url, options, postData) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          console.log('Raw response:', data);
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function run() {
  try {
    console.log('Fetching token...');
    const tokenRes = await request('https://api.lodify.lodemo.id/scrap/gettoken', { method: 'GET' });
    console.log('Token Response:', JSON.stringify(tokenRes, null, 2));

    let token = '';
    if (tokenRes && tokenRes.token) token = tokenRes.token;
    else if (typeof tokenRes === 'string') token = tokenRes; // Maybe plain string?
    
    // Adjust token extraction based on logs
    console.log('Using token:', token);
    
    // Only proceed if we have something looking like a token? Or try anyway.
    
    const dateFrom = '2024-01-01';
    const dateTo = '2024-01-31';

    console.log('Fetching mentions with Query Params + Limit...');
    // Parameters: date_from, date_to, limit, page
    const query = `date_from=${dateFrom}&date_to=${dateTo}&limit=10&page=1`;
    
    const mentionsRes = await request(`https://api.lodify.lodemo.id/scrap/scrap-data?${query}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Mentions Response Preview (first 2 items):');
    if (Array.isArray(mentionsRes)) {
       console.log(JSON.stringify(mentionsRes.slice(0, 2), null, 2));
    } else if (mentionsRes.data && Array.isArray(mentionsRes.data)) {
       console.log(JSON.stringify(mentionsRes.data.slice(0, 2), null, 2));
    } else {
       console.log('Response is not array:', JSON.stringify(mentionsRes, null, 2));
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

run();
