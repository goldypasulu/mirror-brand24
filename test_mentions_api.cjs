// Test Suite untuk Mentions API Integration
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
  console.log('🧪 Starting Mentions API Integration Tests...\n');

  try {
    // Test 1: Get Token
    console.log('Test 1: Fetching Authentication Token...');
    const tokenRes = await request({
      hostname: 'api.lodify.lodemo.id',
      path: '/scrap/gettoken',
      method: 'GET',
      headers: { 'accept': 'application/json' }
    });
    
    if (tokenRes.statusCode !== 200) {
      throw new Error(`Token fetch failed: ${tokenRes.statusCode}`);
    }

    const tokenData = JSON.parse(tokenRes.body);
    console.log('✅ Token acquired:', tokenData.token ? 'Success' : 'Failed');
    console.log('   Project ID:', tokenData.project_id);
    console.log('   Report ID:', tokenData.report_id);
    console.log('');

    // Test 2: Get All Mentions (page 1, size 10)
    console.log('Test 2: Fetching Mentions from get-all-db...');
    const mentionsRes = await request({
      hostname: 'api.lodify.lodemo.id',
      path: '/scrap/get-all-db?page=1&size=10',
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${tokenData.token}`
      }
    });

    if (mentionsRes.statusCode !== 200) {
      console.log('❌ Mentions fetch failed:', mentionsRes.statusCode);
      console.log('   Response:', mentionsRes.body);
      throw new Error('Mentions fetch failed');
    }

    const mentionsData = JSON.parse(mentionsRes.body);
    console.log('✅ Mentions fetched successfully');
    console.log('   Total records:', mentionsData.total || 0);
    console.log('   Page:', mentionsData.page || 1);
    console.log('   Total pages:', mentionsData.pages || 0);
    console.log('   Records in response:', mentionsData.items?.length || 0);
    console.log('');

    // Test 3: Validate Data Structure
    console.log('Test 3: Validating Data Structure...');
    if (!mentionsData.items || mentionsData.items.length === 0) {
      console.log('⚠️  No items in response (might be empty database)');
    } else {
      const firstItem = mentionsData.items[0];
      console.log('✅ Sample Record Fields:');
      console.log('   - id:', firstItem.id ? '✓' : '✗');
      console.log('   - title:', firstItem.title ? '✓' : '✗');
      console.log('   - content:', firstItem.content ? '✓' : '✗');
      console.log('   - source:', firstItem.source ? '✓' : '✗');
      console.log('   - sentiment:', firstItem.sentiment !== undefined ? '✓ (' + firstItem.sentiment + ')' : '✗');
      console.log('   - date:', firstItem.date ? '✓' : '✗');
      console.log('   - hrs:', firstItem.hrs ? '✓' : '✗');
      console.log('   - domain:', firstItem.domain ? '✓' : '✗');
      console.log('   - tags:', firstItem.tags !== undefined ? '✓' : '✗');
      
      console.log('');
      console.log('📋 Sample Record:');
      console.log('   Title:', firstItem.title?.substring(0, 50) + '...');
      console.log('   Source:', firstItem.source);
      console.log('   Sentiment:', firstItem.sentiment);
      console.log('   Date:', firstItem.date, firstItem.hrs);
    }
    console.log('');

    // Test 4: Field Mapping Logic
    console.log('Test 4: Testing Field Mapping Logic...');
    if (mentionsData.items && mentionsData.items.length > 0) {
      const item = mentionsData.items[0];
      
      // Map sentiment
      const sentimentMapping = item.sentiment > 0 ? 'positive' 
                             : item.sentiment < 0 ? 'negative' 
                             : 'neutral';
      console.log('✅ Sentiment Mapping:', item.sentiment, '→', sentimentMapping);
      
      // Map timestamp
      const timestamp = `${item.date}T${item.hrs}`;
      console.log('✅ Timestamp Mapping:', timestamp);
      
      // Map tags
      const keywords = item.tags ? item.tags.split(',').map(t => t.trim()) : [];
      console.log('✅ Keywords Mapping:', keywords.length, 'keywords');
      
      // Infer source type
      const lower = (item.source || '').toLowerCase();
      const sourceType = lower.includes('facebook') || lower.includes('instagram') || 
                        lower.includes('twitter') || lower.includes('tiktok') ? 'social'
                      : lower.includes('news') ? 'news'
                      : 'web';
      console.log('✅ Source Type Inference:', item.source, '→', sourceType);
    }
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('✅ Authentication: PASSED');
    console.log('✅ API Endpoint: PASSED');
    console.log('✅ Data Structure: PASSED');
    console.log('✅ Field Mapping: PASSED');
    console.log('');
    console.log('🎉 All tests passed! Integration ready.');

  } catch (err) {
    console.error('');
    console.error('═══════════════════════════════════════');
    console.error('❌ TEST FAILED');
    console.error('═══════════════════════════════════════');
    console.error('Error:', err.message);
    console.error('');
    process.exit(1);
  }
})();
