/**
 * Automated Verification & Integration Test Suite for ReWear Server
 */
process.env.NODE_ENV = 'test';
const http = require('http');
const { app } = require('../server');
const mongoose = require('mongoose');

let server;
let port;
let baseUrl;

// Helper to make HTTP JSON requests
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers,
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('   REWEAR API AUTOMATED INTEGRATION & SECURITY TESTS   ');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/rewear_db';
    await mongoose.connect(MONGODB_URI);

    // Start ephemeral server
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(0, () => {
        port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    console.log(`[Test Harness] Server listening on ${baseUrl}\n`);

    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'API health check returns 200 OK');

    // 2. Customer Registration
    const testEmail = `testuser_${Date.now()}@example.com`;
    const regRes = await request('POST', '/api/auth/register', {
      name: 'Maya Patel',
      email: testEmail,
      password: 'Password@123',
      city: 'Jaipur',
      role: 'admin', // Maliciously attempt to escalate to admin
    });
    assert(regRes.status === 201, 'Customer registration succeeds');
    assert(regRes.body.user && regRes.body.user.role === 'customer', 'Role escalation prevented: registered user forced to customer');
    const customerToken = regRes.body.token;

    // 3. Customer Login with valid credentials
    const loginRes = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'Password@123',
    });
    assert(loginRes.status === 200 && loginRes.body.token, 'Customer login succeeds with valid credentials');

    // 4. Customer Login with invalid password
    const invalidLogin = await request('POST', '/api/auth/login', {
      email: testEmail,
      password: 'WrongPassword',
    });
    assert(invalidLogin.status === 401, 'Customer login rejects invalid credentials with 401');

    // 5. Admin Login with valid admin credentials
    const adminLoginRes = await request('POST', '/api/auth/admin/login', {
      email: 'admin@rewear.com',
      password: 'Admin@123456',
    });
    assert(adminLoginRes.status === 200 && adminLoginRes.body.user.role === 'admin', 'Dedicated Admin login accepts valid administrator');
    const adminToken = adminLoginRes.body.token;

    // 6. Security Check: Customer attempts Admin Login
    const fakeAdminLogin = await request('POST', '/api/auth/admin/login', {
      email: testEmail,
      password: 'Password@123',
    });
    assert(fakeAdminLogin.status === 403, 'Dedicated Admin login blocks regular customer with 403 Forbidden');

    // 7. Security Check: Customer attempts to call Admin Protected API
    const unauthorizedAdminCall = await request('GET', '/api/admin/metrics', null, customerToken);
    assert(unauthorizedAdminCall.status === 403, 'Admin metrics endpoint strictly rejects customer token with 403 Forbidden');

    // 8. Authorized Admin call to metrics
    const authorizedAdminCall = await request('GET', '/api/admin/metrics', null, adminToken);
    assert(authorizedAdminCall.status === 200 && authorizedAdminCall.body.metrics.totalUsers > 0, 'Admin can successfully access aggregated platform metrics');

    // 9. Public Listing query
    const listingsRes = await request('GET', '/api/listings?limit=4');
    assert(listingsRes.status === 200 && Array.isArray(listingsRes.body.listings), 'Public listings fetch returns valid paginated array');

    // 10. Value Calculator live endpoint
    const calcRes = await request('POST', '/api/listings/calculate-value', {
      referencePrice: 4000,
      condition: 'like_new',
      category: 'women',
      brand: "Levi's",
    });
    assert(calcRes.status === 200 && calcRes.body.result.estimatedSwapValue > 0, 'Value calculator accurately estimates swap value');

    // 11. Self Swap Prevention
    const listingId = listingsRes.body.listings[0]._id;
    // Login as the owner of that listing
    const ownerLogin = await request('POST', '/api/auth/login', {
      email: 'aanya@example.com',
      password: 'Password@123',
    });
    const aanyaToken = ownerLogin.body.token;

    // Aanya creates a listing first
    const newListing = await request('POST', '/api/listings', {
      title: 'Silk Scarf',
      description: 'Handmade pure mulberry silk printed neck scarf',
      category: 'accessories',
      condition: 'new_with_tags',
      size: 'Free Size',
      referencePrice: 1500,
      estimatedSwapValue: 1350,
      imageUrls: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3'],
    }, aanyaToken);

    // Find a listing owned by Aanya that is available
    const aanyaListing = await request('GET', `/api/listings?owner=${ownerLogin.body.user._id}&status=available`);
    const targetItem = aanyaListing.body.listings && aanyaListing.body.listings.length > 0 ? aanyaListing.body.listings[0] : null;

    if (targetItem && newListing.body.listing) {
      const selfSwap = await request('POST', '/api/swaps', {
        requestedListingId: targetItem._id,
        offeredListingId: newListing.body.listing._id,
        message: 'Self trade test',
      }, aanyaToken);
      assert(selfSwap.status === 400 && selfSwap.body.message.includes('own listing'), 'Swap engine strictly prevents user from requesting their own item');
    } else {
      assert(false, 'Target item for self swap was not found');
    }

  } catch (err) {
    console.error('[Test Error]', err);
    failed++;
  } finally {
    if (server) server.close();
    await mongoose.disconnect();

    console.log('\n======================================================');
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log('======================================================\n');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runAllTests();
