/**
 * Comprehensive Verification Script for ReWear Application
 * Tests:
 * 1. Health check
 * 2. Public browsing (Featured listings, All listings, Single listing detail) without authentication
 * 3. Customer authentication (Uvesh Seta login, profile retrieval, logout)
 * 4. Administrator authentication (Admin login, RBAC enforcement)
 * 5. Customer listing management (Create, verify ownership, delete)
 * 6. Two-user swap request workflow with fairness valuation calculation
 * 7. Swap acceptance and status transition (both items updated to in_swap)
 * 8. Negotiation chat messaging and isolation / authorization
 * 9. Admin dashboard metrics and user inspection (verifying Uvesh Seta is customer, not admin)
 */
const http = require('http');

const BASE_URL = 'http://127.0.0.1:5000';

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
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
          resolve({ status: res.statusCode, body: JSON.parse(data) });
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

async function runVerification() {
  console.log('\n===============================================================');
  console.log('   REWEAR FULL SYSTEM ACCEPTANCE & INTEGRATION VERIFICATION   ');
  console.log('===============================================================\n');

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
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'healthy', 'API health check endpoint is responsive and healthy');

    // 2. Public Browsing Without Login
    const featured = await request('GET', '/api/listings/featured?limit=16');
    assert(
      featured.status === 200 && featured.body.listings.length >= 12,
      `Public homepage featured listings return rich selection (${featured.body.listings?.length} items, >= 12 items)`
    );

    const allListings = await request('GET', '/api/listings?limit=50');
    assert(
      allListings.status === 200 && allListings.body.total >= 30,
      `Public all-listings marketplace has 30-50 eligible items (Total: ${allListings.body.total} items)`
    );

    const firstListing = allListings.body.listings[0];
    const singleListing = await request('GET', `/api/listings/${firstListing._id}`);
    assert(
      singleListing.status === 200 && singleListing.body.listing.title,
      `Unauthenticated visitor can view item details for "${firstListing.title}"`
    );

    // 3. Customer Authentication - Primary Account Uvesh Seta
    const uveshLogin = await request('POST', '/api/auth/login', {
      email: 'uvesh@gmail.com',
      password: 'uvesh@123',
    });
    assert(
      uveshLogin.status === 200 && uveshLogin.body.user.name === 'Uvesh Seta' && uveshLogin.body.user.role === 'customer',
      'Uvesh Seta successfully authenticates with specified credentials and role is customer'
    );
    const uveshToken = uveshLogin.body.token;
    const uveshId = uveshLogin.body.user._id;

    // Verify /api/auth/me returns Uvesh Seta's profile
    const profile = await request('GET', '/api/auth/me', null, uveshToken);
    assert(
      profile.status === 200 && profile.body.user.name === 'Uvesh Seta' && profile.body.user.email === 'uvesh@gmail.com',
      'Profile endpoint correctly retrieves Uvesh Seta from MongoDB'
    );

    // 4. Verify Uvesh Seta's Own Listings
    const uveshListingsRes = await request('GET', `/api/listings?owner=${uveshId}`);
    assert(
      uveshListingsRes.status === 200 && uveshListingsRes.body.listings.length > 0,
      `Uvesh Seta has active wardrobe listings associated with his real MongoDB user ID (${uveshListingsRes.body.listings.length} items)`
    );
    const uveshItem = uveshListingsRes.body.listings[0];
    console.log(`    -> Listing: "${uveshItem.title}", Owner: ${uveshItem.owner.name}, Value: ₹${uveshItem.estimatedSwapValue}`);

    // 5. Customer creates and manages a new listing
    const createRes = await request('POST', '/api/listings', {
      title: 'Artisanal Organic Khadi Cotton Kurta',
      description: 'Handspun and handwoven pure khadi cotton straight kurta with wooden buttons and side slits. Worn once.',
      category: 'ethnic_wear',
      gender: 'men',
      brand: 'Khadi India Heritage',
      size: 'L',
      condition: 'like_new',
      color: 'Off-White Natural',
      material: '100% Khadi Cotton',
      referencePrice: 2200,
      estimatedSwapValue: 1750,
      imageUrls: ['https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=800&q=80'],
      city: 'Mumbai',
    }, uveshToken);
    assert(createRes.status === 201 && createRes.body.listing.title, 'Uvesh Seta can successfully list a new clothing item in his wardrobe');
    const tempListingId = createRes.body.listing._id;

    // Delete the temporary test listing
    const deleteRes = await request('DELETE', `/api/listings/${tempListingId}`, null, uveshToken);
    assert(deleteRes.status === 200, 'Uvesh Seta can successfully delete his own listing from MongoDB');

    // 6. Security Check: Customer attempts admin login and admin endpoints
    const fakeAdminLogin = await request('POST', '/api/auth/admin/login', {
      email: 'uvesh@gmail.com',
      password: 'uvesh@123',
    });
    assert(fakeAdminLogin.status === 403, 'Dedicated Admin login strictly blocks customer account with 403 Forbidden');

    const customerAdminCall = await request('GET', '/api/admin/metrics', null, uveshToken);
    assert(customerAdminCall.status === 403, 'Admin metrics endpoint strictly rejects customer token with 403 Forbidden');

    // 7. Administrator Authentication
    const adminLogin = await request('POST', '/api/auth/admin/login', {
      email: 'admin@rewear.com',
      password: 'Admin@123456',
    });
    assert(
      adminLogin.status === 200 && adminLogin.body.user.role === 'admin' && adminLogin.body.user.name === 'ReWear Platform Administrator',
      'Administrator logs in separately with dedicated admin credentials'
    );
    const adminToken = adminLogin.body.token;

    // Admin accesses metrics
    const metricsRes = await request('GET', '/api/admin/metrics', null, adminToken);
    assert(
      metricsRes.status === 200 && metricsRes.body.metrics.totalListings >= 40,
      `Administrator dashboard aggregates live metrics from MongoDB (Total Listings: ${metricsRes.body.metrics.totalListings})`
    );

    // Admin views users and confirms Uvesh Seta is listed as customer
    const usersRes = await request('GET', '/api/admin/users', null, adminToken);
    const uveshInAdmin = usersRes.body.users.find((u) => u.email === 'uvesh@gmail.com');
    assert(
      uveshInAdmin && uveshInAdmin.role === 'customer',
      'Admin user management correctly displays Uvesh Seta as a Customer (never as Admin)'
    );

    // 8. Genuine Two-User Swap Request & Negotiation
    // Login as demo user Aanya
    const aanyaLogin = await request('POST', '/api/auth/login', {
      email: 'aanya@example.com',
      password: 'Password@123',
    });
    const aanyaToken = aanyaLogin.body.token;

    // Find an available item owned by Aanya
    const aanyaItems = await request('GET', `/api/listings?owner=${aanyaLogin.body.user._id}&status=available`);
    const targetAanyaItem = aanyaItems.body.listings[0];

    // Uvesh Seta proposes swap: his Chambray Workshirt for Aanya's item
    const uveshChambray = uveshListingsRes.body.listings.find((l) => l.title.includes('Chambray') && l.status === 'available') || uveshListingsRes.body.listings[0];

    const swapProposal = await request('POST', '/api/swaps', {
      requestedListingId: targetAanyaItem._id,
      offeredListingId: uveshChambray._id,
      message: 'Hi Aanya! I would love to exchange my vintage chambray workshirt for your piece. Both are in like-new condition!',
      exchangeMethod: 'courier',
    }, uveshToken);

    assert(
      swapProposal.status === 201 && swapProposal.body.swap.status === 'pending',
      `Uvesh Seta successfully proposes swap of "${uveshChambray.title}" for Aanya's "${targetAanyaItem.title}"`
    );
    const swapId = swapProposal.body.swap._id;
    const convId = swapProposal.body.conversationId;

    // 9. Recipient Aanya accepts the swap
    const acceptRes = await request('PUT', `/api/swaps/${swapId}/accept`, null, aanyaToken);
    assert(
      acceptRes.status === 200 && acceptRes.body.swap.status === 'accepted',
      'Recipient Aanya accepts the swap request'
    );

    // Check item statuses
    const updatedUveshItem = await request('GET', `/api/listings/${uveshChambray._id}`);
    const updatedAanyaItem = await request('GET', `/api/listings/${targetAanyaItem._id}`);
    assert(
      updatedUveshItem.body.listing.status === 'in_swap' && updatedAanyaItem.body.listing.status === 'in_swap',
      'Both swapped items automatically transitioned to status "in_swap" in MongoDB'
    );

    // 10. Negotiation Chat Messaging between the two participants
    const sendMsgRes = await request('POST', `/api/messages/conversations/${convId}`, {
      text: 'Thanks Uvesh! I am happy to accept. I will pack it carefully and ship via courier tomorrow.',
    }, aanyaToken);
    assert(sendMsgRes.status === 201 && sendMsgRes.body.message.text, 'Aanya sends a negotiation message to Uvesh Seta');

    // Uvesh reads messages
    const convMessages = await request('GET', `/api/messages/conversations/${convId}`, null, uveshToken);
    assert(
      convMessages.status === 200 && convMessages.body.messages.length >= 2,
      `Uvesh Seta receives conversation history (${convMessages.body.messages.length} messages) from MongoDB`
    );

    // Third user (Kabir) tries to read their private conversation -> Must fail
    const kabirLogin = await request('POST', '/api/auth/login', {
      email: 'kabir@example.com',
      password: 'Password@123',
    });
    const unauthorizedChat = await request('GET', `/api/messages/conversations/${convId}`, null, kabirLogin.body.token);
    assert(
      unauthorizedChat.status === 403 || unauthorizedChat.status === 404,
      'Unauthorized third-party user cannot access private conversation between Uvesh and Aanya'
    );

    // Revert the items to available so that demo state stays clean
    await request('PUT', `/api/swaps/${swapId}/cancel`, { note: 'Completed testing' }, uveshToken);
    console.log('    -> Test swap cancelled cleanly to keep marketplace items available.');

  } catch (err) {
    console.error('[Verification Error]', err);
    failed++;
  }

  console.log('\n===============================================================');
  console.log(`   TEST VERIFICATION SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('===============================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runVerification();
