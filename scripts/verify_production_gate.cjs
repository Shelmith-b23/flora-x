const http = require('http');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const JWT_SECRET = process.env.JWT_SECRET || 'flora-x-kenya-production-master-secret-2026';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch { parsed = data; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

let passed = 0;
let failed = 0;
const results = [];

function check(testName, condition, detail) {
  if (condition) {
    passed++;
    results.push({ test: testName, status: 'PASS', detail });
    console.log(`✅ [PASS] ${testName} - ${detail || 'OK'}`);
  } else {
    failed++;
    results.push({ test: testName, status: 'FAIL', detail });
    console.error(`❌ [FAIL] ${testName} - ${detail || 'FAILED'}`);
  }
}

async function runProductionGateAudit() {
  console.log('================================================================');
  console.log('FLORA_X: FINAL PRODUCTION READINESS GATE VERIFICATION SUITE');
  console.log('================================================================\n');

  const dbData = JSON.parse(fs.readFileSync('db.json', 'utf8'));

  // Setup tokens
  const customerA = dbData.users.find(u => u.role === 'customer') || { id: 'cust-a', email: 'cust_a@test.com' };
  const tokenCustA = jwt.sign({ sub: customerA.id, email: customerA.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

  const tokenCustB = jwt.sign({ sub: 'cust-b-attacker', email: 'attacker_b@test.com', role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

  const floristA = dbData.florists[0];
  const tokenFloristA = jwt.sign({ sub: floristA.userId, email: 'florist_a@test.com', role: 'florist' }, JWT_SECRET, { expiresIn: '1h' });

  const floristB = dbData.florists[1] || { id: 'florist-2', userId: 'user-florist-2' };
  const tokenFloristB = jwt.sign({ sub: floristB.userId, email: 'florist_b@test.com', role: 'florist' }, JWT_SECRET, { expiresIn: '1h' });

  const admin = dbData.users.find(u => u.role === 'admin') || { id: 'admin-1', email: 'admin@florax.co.ke' };
  const tokenAdmin = jwt.sign({ sub: admin.id, email: admin.email, role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });

  // -------------------------------------------------------------
  // 1. DATA ISOLATION & HORIZONTAL PRIVILEGE ESCALATION
  // -------------------------------------------------------------
  console.log('--- 1. DATA ISOLATION & AUTHORIZATION BOUNDARIES ---');

  // Create an order for Customer A
  const createOrderRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/checkout/create-session',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCustA}` }
  }, {
    items: [{ productId: 'prod-101', title: 'Isolation Rose', quantity: 1, floristId: floristA.id }],
    recipient_name: 'Customer A Recipient',
    recipient_phone: '+254711223344',
    delivery_address: 'Riverside, Nairobi'
  });

  const orderAId = createOrderRes.body?.data?.id;
  check('Create Customer A Order', createOrderRes.status === 201 && !!orderAId, `Order ID: ${orderAId}`);

  // Test Customer B accessing Customer A's order status
  const crossCustRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/checkout/verify/${orderAId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenCustB}` }
  });
  check('Customer B -> Customer A Order Access', crossCustRes.status === 403, `HTTP ${crossCustRes.status} Forbidden returned`);

  // Test Customer B attempting to pay for Customer A's order
  const crossPayRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/checkout/pay-card',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCustB}` }
  }, { parent_order_id: orderAId });
  check('Customer B -> Customer A Payment Hijack', crossPayRes.status === 403, `HTTP ${crossPayRes.status} Forbidden returned`);

  // Test Florist B updating status of Florist A's order
  const crossFloristRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristB}` }
  }, { status: 'preparing' });
  check('Florist B -> Florist A Order Tampering', crossFloristRes.status === 404 || crossFloristRes.status === 403, `HTTP ${crossFloristRes.status} - Florist B cannot touch Florist A order`);

  // Test Customer accessing Florist Wallet
  const custWalletRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/florist/financials',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenCustA}` }
  });
  check('Customer -> Florist Wallet Financial Access', custWalletRes.status === 404 || custWalletRes.status === 403, `HTTP ${custWalletRes.status} - Unauthorized access blocked`);

  // Test Customer accessing Admin Stats
  const custAdminRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/admin/dashboard/stats',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenCustA}` }
  });
  check('Customer -> Admin Dashboard Stats Access', custAdminRes.status === 403, `HTTP ${custAdminRes.status} Forbidden`);

  // -------------------------------------------------------------
  // 2. ORDER STATE MACHINE & ILLEGAL TRANSITIONS
  // -------------------------------------------------------------
  console.log('\n--- 2. ORDER STATE MACHINE RIGOROUS LIFECYCLE ---');

  // Attempt transition on unpaid order
  const unpaidTrans = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'preparing' });
  check('Unpaid Order Transition (unpaid -> preparing)', unpaidTrans.status === 400 && unpaidTrans.body?.error === 'ILLEGAL_TRANSITION', 'Rejected with ILLEGAL_TRANSITION');

  const unpaidDelivered = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'delivered' });
  check('Unpaid Order Transition (unpaid -> delivered)', unpaidDelivered.status === 400, 'Rejected');

  // Pay order as authorized customer
  const payOrderARes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/checkout/pay-card',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCustA}` }
  }, { parent_order_id: orderAId });
  check('Authorized Customer Payment Confirmation', payOrderARes.status === 200, `Receipt: ${payOrderARes.body?.receipt}`);

  // Test illegal transition: received -> delivered
  const skipToDelivered = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'delivered' });
  check('Skip Stages: received -> delivered', skipToDelivered.status === 400 && skipToDelivered.body?.error === 'ILLEGAL_TRANSITION', 'Rejected: must follow sequence');

  // Test illegal transition: received -> out_for_delivery
  const skipToOut = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'out_for_delivery' });
  check('Skip Stages: received -> out_for_delivery', skipToOut.status === 400, 'Rejected');

  // Valid step: received -> preparing
  const toPrep = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'preparing' });
  check('Valid Transition: received -> preparing', toPrep.status === 200, 'Success');

  // Valid step: preparing -> ready_for_pickup
  const toPickup = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'ready_for_pickup' });
  check('Valid Transition: preparing -> ready_for_pickup', toPickup.status === 200, 'Success');

  // Valid step: ready_for_pickup -> out_for_delivery
  const toOut = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'out_for_delivery' });
  check('Valid Transition: ready_for_pickup -> out_for_delivery', toOut.status === 200, 'Success');

  // Valid step: out_for_delivery -> delivered
  const toDeliv = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'delivered' });
  check('Valid Transition: out_for_delivery -> delivered', toDeliv.status === 200, 'Success');

  // Terminal state protection: delivered -> preparing
  const backToPrep = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'preparing' });
  check('Terminal State Protection: delivered -> preparing', backToPrep.status === 400, 'Modification of terminal state rejected');

  // Terminal state protection: delivered -> cancelled
  const delivToCancel = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/florist/orders/${orderAId}/status`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenFloristA}` }
  }, { status: 'cancelled' });
  check('Terminal State Protection: delivered -> cancelled', delivToCancel.status === 400, 'Modification rejected');

  // -------------------------------------------------------------
  // 3. FINANCIAL INTEGRITY & CALCULATION CHAIN
  // -------------------------------------------------------------
  console.log('\n--- 3. FINANCIAL INTEGRITY & CALCULATION CHAIN ---');

  // Test 1: Single florist, single product
  const p1 = dbData.products[0];
  const p1Price = p1.price;
  const deliveryA = floristA.deliveryFeeStandard || 350;
  const singleRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/checkout/create-session',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCustA}` }
  }, {
    items: [{ productId: p1.id, title: p1.title, quantity: 1, floristId: floristA.id }],
    recipient_name: 'Single Prod Test',
    recipient_phone: '+254700000001',
    delivery_address: 'Kilimani, Nairobi'
  });
  const expectedSingleTotal = p1Price + deliveryA;
  const actualSingleTotal = singleRes.body?.data?.total_amount;
  check('Single Florist / Single Product Math', actualSingleTotal === expectedSingleTotal, `Expected ${expectedSingleTotal}, got ${actualSingleTotal}`);

  // Test 2: Multi florist checkout calculation
  const p2FloristB = dbData.products.find(p => p.floristId === floristB.id) || { id: 'prod-fb-1', price: 4000, floristId: floristB.id };
  const deliveryB = floristB.deliveryFeeStandard || 350;
  const multiRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/checkout/create-session',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCustA}` }
  }, {
    items: [
      { productId: p1.id, title: p1.title, quantity: 2, floristId: floristA.id },
      { productId: p2FloristB.id, title: 'Florist B Flower', quantity: 1, floristId: floristB.id }
    ],
    recipient_name: 'Multi Florist Test',
    recipient_phone: '+254700000002',
    delivery_address: 'Lavington, Nairobi'
  });
  const expectedMultiDelivery = deliveryA + deliveryB;
  const expectedSubtotal = (p1Price * 2) + p2FloristB.price;
  const expectedMultiTotal = expectedSubtotal + expectedMultiDelivery;
  check('Multi-Florist Delivery Summation', multiRes.body?.data?.delivery_fee === expectedMultiDelivery, `Delivery: ${multiRes.body?.data?.delivery_fee} === ${expectedMultiDelivery}`);
  check('Multi-Florist Grand Total Math', multiRes.body?.data?.total_amount === expectedMultiTotal, `Total: ${multiRes.body?.data?.total_amount} === ${expectedMultiTotal}`);

  // Verify 20% platform commission calculation in sub-orders
  const subOrders = multiRes.body?.data?.sub_orders || multiRes.body?.data?.subOrders || [];
  const soA = subOrders.find(so => so.floristId === floristA.id);
  const soB = subOrders.find(so => so.floristId === floristB.id);
  const expectedCommA = Math.round((p1Price * 2) * 0.20);
  const expectedCommB = Math.round(p2FloristB.price * 0.20);
  check('SubOrder A 20% Platform Commission', soA && soA.platformCommission === expectedCommA, `Florist A Commission: ${soA?.platformCommission} === ${expectedCommA}`);
  check('SubOrder B 20% Platform Commission', soB && soB.platformCommission === expectedCommB, `Florist B Commission: ${soB?.platformCommission} === ${expectedCommB}`);

  // -------------------------------------------------------------
  // 4. INVENTORY CONCURRENCY & OVERSELLING DEFENSE
  // -------------------------------------------------------------
  console.log('\n--- 4. INVENTORY CONCURRENCY & OVERSOLD DEFENSE ---');

  // Find a product with limited inventory (or set one to 1 for this test)
  const freshDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const testStockProduct = freshDb.products.find(p => p.id === 'prod-concurrency-test') || {
    id: 'prod-concurrency-test',
    title: 'Limited Stock Orchid',
    price: 2500,
    floristId: floristA.id,
    inventoryQty: 1
  };
  testStockProduct.inventoryQty = 1;
  if (!freshDb.products.some(p => p.id === testStockProduct.id)) {
    freshDb.products.push(testStockProduct);
  } else {
    const idx = freshDb.products.findIndex(p => p.id === testStockProduct.id);
    freshDb.products[idx].inventoryQty = 1;
  }
  fs.writeFileSync('db.json', JSON.stringify(freshDb, null, 2));

  // Request buying 5 items when stock is 1
  const overbuyRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/checkout/create-session',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCustA}` }
  }, {
    items: [{ productId: 'prod-concurrency-test', quantity: 5, floristId: floristA.id }],
    recipient_name: 'Overbuyer',
    recipient_phone: '+254711999888',
    delivery_address: 'Parklands'
  });
  check('Oversell Prevention on Quantity Exceeding Inventory', overbuyRes.status === 422, `Status: ${overbuyRes.status} - Rejected`);

  // Simulate concurrent purchases of stock = 1
  // Customer 1 creates session and pays
  const sess1 = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/checkout/create-session',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCustA}` }
  }, {
    items: [{ productId: 'prod-concurrency-test', quantity: 1, floristId: floristA.id }],
    recipient_name: 'First Buyer',
    recipient_phone: '+254711999888',
    delivery_address: 'Parklands'
  });
  const pord1 = sess1.body?.data?.id;

  // First buyer pays
  await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/checkout/pay-card',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCustA}` }
  }, { parent_order_id: pord1 });

  // Stock is now 0. Attempting another order session must fail
  const sess2 = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/v1/checkout/create-session',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCustB}` }
  }, {
    items: [{ productId: 'prod-concurrency-test', quantity: 1, floristId: floristA.id }],
    recipient_name: 'Second Buyer',
    recipient_phone: '+254711999888',
    delivery_address: 'Parklands'
  });
  check('Exhausted Inventory (Stock=0) Purchase Prevention', sess2.status === 422, `Second buyer blocked with HTTP ${sess2.status}`);

  // -------------------------------------------------------------
  // 5. SECURITY: SECRET & CREDENTIAL LEAK AUDIT
  // -------------------------------------------------------------
  console.log('\n--- 5. SECRET & SENSITIVE CREDENTIAL LEAK AUDIT ---');

  // Verify that GET /api/v1/checkout/verify does not expose secrets
  const verifySec = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: `/api/v1/checkout/verify/${pord1}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${tokenCustA}` }
  });
  const bodyStr = JSON.stringify(verifySec.body);
  const leaksSecrets = /passkey|consumer_secret|jwt_secret|passwordhash/i.test(bodyStr);
  check('Checkout API Payload Secrets Leak Audit', !leaksSecrets, 'Response is clean of sensitive secrets');

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`PRODUCTION READINESS GATE RESULT: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runProductionGateAudit().catch(err => {
  console.error('Fatal gate execution error:', err);
  process.exit(1);
});
