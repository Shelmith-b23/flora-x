const fs = require('fs');
const http = require('http');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'flora-x-express-jwt-secret-key-12345';

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('========================================================');
  console.log('FLORA_X: VERIFYING AUDIT P0 / P1 RESOLUTIONS');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = '') {
    if (condition) {
      console.log(`✅ [PASS] ${name}`);
      if (details) console.log(`   └─ ${details}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name}`);
      if (details) console.error(`   └─ ${details}`);
      failed++;
    }
  }

  // ----------------------------------------------------
  // TEST 1: Guest Checkout Guard (P0)
  // ----------------------------------------------------
  console.log('--- Test Group 1: Guest Checkout Enforcement ---');
  try {
    const resUnauth = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/create-session',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      items: [{ productId: 'p1', title: 'Roses', unitPrice: 3500, quantity: 1 }],
      recipient_name: 'Jane Doe',
      recipient_phone: '0712345678',
      delivery_address: 'Kilimani, Nairobi'
    });
    assert(resUnauth.status === 401, 'Unauthenticated checkout request blocked with 401 Unauthorized', `HTTP ${resUnauth.status}`);
  } catch (err) {
    assert(false, 'Guest checkout guard test error', err.message);
  }

  // ----------------------------------------------------
  // TEST 2: Dynamic Checkout Pricing & Multi-Vendor Fees (P0)
  // ----------------------------------------------------
  console.log('\n--- Test Group 2: Dynamic Checkout Pricing & Commission ---');
  const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const customer = db.users.find(u => u.role === 'customer') || { id: 'test-cust', email: 'cust@test.com' };
  const token = jwt.sign({ sub: customer.id, email: customer.email, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

  let checkoutRes;
  try {
    const testItems = [
      {
        productId: 'prod-101',
        title: 'Naivasha Red Roses',
        unitPrice: 4500,
        quantity: 2,
        floristId: 'florist-1',
        floristName: 'Rift Valley Blooms',
        deliveryFee: 400
      },
      {
        productId: 'prod-202',
        title: 'Tropical Orchid Garden',
        unitPrice: 6000,
        quantity: 1,
        floristId: 'florist-2',
        floristName: 'Westlands Petals',
        deliveryFee: 450
      }
    ];

    // Expected:
    // Item 1: 4500 * 2 = 9000
    // Item 2: 6000 * 1 = 6000
    // Items Subtotal = 15000
    // Delivery fees: 400 + 450 = 850
    // Total Amount: 15850 KSh
    checkoutRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/create-session',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, {
      items: testItems,
      recipient_name: 'Grace Wanjiku',
      recipient_phone: '+254711223344',
      delivery_address: '14 Riverside Drive, Nairobi',
      delivery_date: '2026-09-10',
      delivery_slot: 'Morning (9:00 AM - 1:00 PM)',
      card_message: 'Happy Anniversary with love!'
    });

    const body = checkoutRes.body;
    assert(checkoutRes.status === 201 && body.success, 'Checkout session created successfully', `Status ${checkoutRes.status}`);
    assert(body.data && body.data.total_amount === 15850, 'Total checkout amount calculated dynamically (15,850 KSh, not hardcoded 1 KSh)', `Received total_amount: ${body?.data?.total_amount}`);
    assert(body.data && body.data.items_subtotal === 15000, 'Items subtotal accurately aggregated to 15,000 KSh', `Received: ${body?.data?.items_subtotal}`);
    assert(body.data && body.data.delivery_fee === 850, 'Multi-vendor delivery fee calculated (400 + 450 = 850 KSh)', `Received: ${body?.data?.delivery_fee}`);
    assert(body.data && body.data.sub_orders?.length === 2, 'Sub-orders correctly partitioned per florist (2 sub-orders)', `Count: ${body?.data?.sub_orders?.length}`);
  } catch (err) {
    assert(false, 'Checkout session creation test error', err.message);
  }

  // ----------------------------------------------------
  // TEST 3: Payment & Order Persistence (P0)
  // ----------------------------------------------------
  console.log('\n--- Test Group 3: Order Persistence & Customer Sync ---');
  if (checkoutRes && checkoutRes.body && checkoutRes.body.data) {
    const parentOrderId = checkoutRes.body.data.id;
    try {
      const payRes = await request({
        hostname: '127.0.0.1',
        port: 3000,
        path: '/api/v1/checkout/pay-card',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        parentOrderId,
        paymentMethod: 'card',
        cardLast4: '4242',
        cardHolderName: 'Grace Wanjiku'
      });

      assert(payRes.status === 200 && payRes.body.success, 'Card payment processed and receipt generated', `Receipt: ${payRes.body?.receipt}`);

      // Verify parent order and customer orders in database
      const freshDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
      const foundParentOrder = freshDb.parent_orders?.find(o => o.id === parentOrderId);
      assert(foundParentOrder && foundParentOrder.paymentStatus === 'paid', 'Parent order marked as paid in database', `Status: ${foundParentOrder?.paymentStatus}`);

      // Check customer order synchronization
      const custOrders = (freshDb.orders || []).filter(o => o.orderReference === parentOrderId || o.parentOrderId === parentOrderId);
      assert(custOrders.length > 0, 'Parent order successfully synchronized to customer orders list for Profile tracking', `Synchronized ${custOrders.length} order(s)`);
      if (custOrders.length > 0) {
        const first = custOrders[0];
        assert(first.totalAmount === 15850, 'Persisted customer order maintains actual total amount (15,850 KSh)', `Amount: ${first.totalAmount}`);
        assert(first.cardMessage === 'Happy Anniversary with love!', 'Persisted customer order retains gift card message', `Message: "${first.cardMessage}"`);
      }
    } catch (err) {
      assert(false, 'Payment & persistence test error', err.message);
    }
  }

  // ----------------------------------------------------
  // TEST 4: Fake Telemetry Removal (P1)
  // ----------------------------------------------------
  console.log('\n--- Test Group 4: Fake Telemetry Removal in Profile.tsx ---');
  const profileCode = fs.readFileSync('src/pages/Profile.tsx', 'utf8');
  const hasRandomTruck = profileCode.includes('Math.random() * 6 - 3');
  const hasFakeTemp = profileCode.includes('Shipment Temperature: 4.1°C');
  const hasFakeSpeed = profileCode.includes('Metropolitan Speed: 42 km/h');

  assert(!hasRandomTruck, 'Profile.tsx has no Math.random() simulated truck position jitter', 'Verified removed');
  assert(!hasFakeTemp, 'Profile.tsx has no fake "Shipment Temperature: 4.1°C" sensor data', 'Verified removed');
  assert(!hasFakeSpeed, 'Profile.tsx has no fake "Metropolitan Speed: 42 km/h" telemetry', 'Verified removed');

  // ----------------------------------------------------
  // TEST 5: Flower Finder Navigation & Mounting (P1)
  // ----------------------------------------------------
  console.log('\n--- Test Group 5: Flower Finder Component Mounting & Navigation ---');
  const appCode = fs.readFileSync('src/App.tsx', 'utf8');
  const layoutCode = fs.readFileSync('src/components/Layout.tsx', 'utf8');

  const appImportsFinder = appCode.includes("import { FlowerFinder } from './components/FlowerFinder'");
  const appRoutesFinder = appCode.includes("case '#/flower-finder':") && appCode.includes('<FlowerFinder');
  const layoutHasDesktopLink = layoutCode.includes('#/flower-finder') && layoutCode.includes('Flower Finder');

  assert(appImportsFinder, 'App.tsx imports FlowerFinder component', 'Import verified');
  assert(appRoutesFinder, 'App.tsx mounts FlowerFinder at #/flower-finder route', 'Route verified');
  assert(layoutHasDesktopLink, 'Layout.tsx provides navigation entry points to Flower Finder', 'Nav link verified');

  console.log('\n========================================================');
  console.log(`VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
