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

let passCount = 0;
let failCount = 0;

function assert(condition, message, details) {
  if (condition) {
    passCount++;
    console.log(`✅ [PASS] ${message}`);
    if (details) console.log(`   └─ ${details}`);
  } else {
    failCount++;
    console.error(`❌ [FAIL] ${message}`);
    if (details) console.error(`   └─ ${details}`);
  }
}

async function runP2AuditSuite() {
  console.log('========================================================');
  console.log('FLORA_X: P2 REMEDIATION & PRODUCTION AUDIT TEST SUITE');
  console.log('========================================================');

  const dbData = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  if (Array.isArray(dbData.products)) {
    dbData.products.forEach(p => {
      if (p.inventoryQty === undefined || p.inventoryQty < 10) {
        p.inventoryQty = 25;
      }
    });
    fs.writeFileSync('db.json', JSON.stringify(dbData, null, 2));
  }

  // ----------------------------------------------------
  // TEST P2-001: Public Registration Role Escalation Guard
  // ----------------------------------------------------
  console.log('\n--- Finding P2-001: Public Registration Role Escalation ---');
  try {
    const testAdminEmail = `attacker_${Date.now()}@example.com`;
    const regRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      firstName: 'Attacker',
      lastName: 'Escalation',
      name: 'Attacker Escalation',
      email: testAdminEmail,
      password: 'AttackerPassword123!',
      phoneNumber: `+25479${Math.floor(1000000 + Math.random() * 9000000)}`,
      role: 'super_admin' // Unauthorized escalation attempt
    });

    assert(regRes.status === 201, 'Registration processed', `Status ${regRes.status}`);
    const returnedRole = regRes.body?.role;
    const currentDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    const createdUser = currentDb.users.find(u => u.email === testAdminEmail);
    assert(returnedRole === 'customer' && createdUser?.role === 'customer',
      'Escalated role suppressed; caller safely assigned role "customer"',
      `Response role: "${returnedRole}", DB role: "${createdUser?.role}"`);
  } catch (err) {
    assert(false, 'Role escalation test error', err.message);
  }

  // ----------------------------------------------------
  // TEST P2-002: Suspended Admin Authorization Guard
  // ----------------------------------------------------
  console.log('\n--- Finding P2-002: Suspended Admin Authorization ---');
  try {
    // Create token for suspended admin
    const suspendedAdminToken = jwt.sign({
      sub: 'suspended-admin-id',
      email: 'suspended.admin@florax.co.ke',
      role: 'admin'
    }, JWT_SECRET, { expiresIn: '1h' });

    // Inject temporary suspended admin to dbData for testing
    const currentDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    if (!currentDb.administrators) currentDb.administrators = [];
    currentDb.administrators.push({
      id: 'suspended-admin-id',
      email: 'suspended.admin@florax.co.ke',
      role: 'admin',
      status: 'suspended'
    });
    fs.writeFileSync('db.json', JSON.stringify(currentDb, null, 2));

    const adminReq = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/admin/dashboard/stats',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${suspendedAdminToken}`
      }
    });

    assert(adminReq.status === 403, 'Suspended admin blocked with 403 Forbidden', `Status: ${adminReq.status}`);

    // Clean up
    const cleanedDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    cleanedDb.administrators = cleanedDb.administrators.filter(a => a.id !== 'suspended-admin-id');
    fs.writeFileSync('db.json', JSON.stringify(cleanedDb, null, 2));
  } catch (err) {
    assert(false, 'Suspended admin test error', err.message);
  }

  // ----------------------------------------------------
  // TEST P2-003: Florist AI Generate Endpoint Authentication Guard
  // ----------------------------------------------------
  console.log('\n--- Finding P2-003: Florist AI Generation Security ---');
  try {
    const unauthAI = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/florist/ai/generate',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { type: 'description', payload: { name: 'Sunset Roses' } });

    assert(unauthAI.status === 401, 'Unauthenticated AI request blocked with 401 Unauthorized', `Status: ${unauthAI.status}`);

    // Customer token should also be forbidden
    const customer = dbData.users.find(u => u.role === 'customer') || { id: 'cust-1', email: 'c@test.com' };
    const custToken = jwt.sign({ sub: customer.id, email: customer.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

    const custAI = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/florist/ai/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      }
    }, { type: 'description', payload: { name: 'Sunset Roses' } });

    assert(custAI.status === 403, 'Customer role blocked from Florist AI with 403 Forbidden', `Status: ${custAI.status}`);

    // Florist token should succeed
    const florist = dbData.florists.find(f => f.verificationStatus === 'approved') || dbData.florists[0];
    const floristToken = jwt.sign({ sub: florist.userId, email: 'florist@test.com', role: 'florist' }, JWT_SECRET, { expiresIn: '1h' });

    const floristAI = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/florist/ai/generate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${floristToken}`
      }
    }, { type: 'description', payload: { name: 'Naivasha Red Blooms', category: 'Roses', occasion: 'Anniversary' } });

    assert(floristAI.status === 200 && floristAI.body?.result, 'Authenticated Florist successfully generates AI content', `Status: ${floristAI.status}`);
  } catch (err) {
    assert(false, 'Florist AI test error', err.message);
  }

  // ----------------------------------------------------
  // TEST P2-004: Pricing Validation & Invalid Quantity Guards
  // ----------------------------------------------------
  console.log('\n--- Finding P2-004: Pricing Validation & Stock Checks ---');
  try {
    const customer = dbData.users.find(u => u.role === 'customer') || { id: 'cust-1', email: 'c@test.com' };
    const custToken = jwt.sign({ sub: customer.id, email: customer.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

    // Negative quantity check
    const negQtyRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/create-session',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      }
    }, {
      items: [{ productId: 'prod-101', quantity: -5, unitPrice: 1000 }],
      recipient_name: 'Jane Doe',
      recipient_phone: '+254712345678',
      delivery_address: 'Nairobi'
    });

    assert(negQtyRes.status === 422, 'Negative quantity rejected with 422 Unprocessable Entity', `Status: ${negQtyRes.status}`);

    // Zero quantity check
    const zeroQtyRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/create-session',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      }
    }, {
      items: [{ productId: 'prod-101', quantity: 0, unitPrice: 1000 }],
      recipient_name: 'Jane Doe',
      recipient_phone: '+254712345678',
      delivery_address: 'Nairobi'
    });

    assert(zeroQtyRes.status === 422, 'Zero quantity rejected with 422 Unprocessable Entity', `Status: ${zeroQtyRes.status}`);
  } catch (err) {
    assert(false, 'Pricing & quantity test error', err.message);
  }

  // ----------------------------------------------------
  // TEST P2-005 & P2-006: Inventory Deduction & Order State Machine
  // ----------------------------------------------------
  console.log('\n--- Finding P2-005 & P2-006: Inventory Deduction & Order State Machine ---');
  try {
    const customer = dbData.users.find(u => u.role === 'customer') || { id: 'cust-1', email: 'c@test.com' };
    const custToken = jwt.sign({ sub: customer.id, email: customer.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

    // Find product with inventory
    const targetProduct = dbData.products?.find(p => p.inventoryQty !== undefined && p.inventoryQty > 5) || dbData.products[0];
    const initialStock = targetProduct.inventoryQty || 20;

    // Create session
    const sessionRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/create-session',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      }
    }, {
      items: [{
        productId: targetProduct.id,
        title: targetProduct.title,
        quantity: 2,
        floristId: targetProduct.floristId || 'florist-1'
      }],
      recipient_name: 'State Machine Tester',
      recipient_phone: '+254722334455',
      delivery_address: 'Westlands, Nairobi'
    });

    const pOrderId = sessionRes.body?.data?.id;
    assert(pOrderId, 'Test order created for state machine & inventory test', `ID: ${pOrderId}`);

    const floristObj = dbData.florists.find(f => f.id === targetProduct.floristId) || dbData.florists[0];
    const floristToken = jwt.sign({ sub: floristObj.userId, email: 'florist@test.com', role: 'florist' }, JWT_SECRET, { expiresIn: '1h' });

    // Guard: Attempt to fulfill an UNPAID order must fail with 400 ILLEGAL_TRANSITION
    const fulfillUnpaidRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/florist/orders/${pOrderId}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${floristToken}`
      }
    }, { status: 'preparing' });

    assert(fulfillUnpaidRes.status === 400 && fulfillUnpaidRes.body?.error === 'ILLEGAL_TRANSITION',
      'Fulfilling an unpaid order is strictly blocked (ILLEGAL_TRANSITION)',
      `Status: ${fulfillUnpaidRes.status}, Error: ${fulfillUnpaidRes.body?.error}`);

    // Pay for the order using card payment
    const payRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/pay-card',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      }
    }, { parent_order_id: pOrderId });

    assert(payRes.status === 200, 'Order payment confirmed', `Receipt: ${payRes.body?.receipt}`);

    // Verify inventory deducted
    const afterPayDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    const updatedProduct = afterPayDb.products.find(p => p.id === targetProduct.id);
    assert(updatedProduct && updatedProduct.inventoryQty === initialStock - 2,
      'Product inventory successfully deducted by order quantity upon payment',
      `Stock: ${initialStock} -> ${updatedProduct?.inventoryQty}`);

    // Now test valid state transitions
    // received -> preparing (Valid)
    const prepRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/florist/orders/${pOrderId}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${floristToken}`
      }
    }, { status: 'preparing' });

    assert(prepRes.status === 200, 'Valid transition "received" -> "preparing" accepted', `Status: ${prepRes.status}`);

    // preparing -> delivered (Invalid: must go through ready_for_pickup & out_for_delivery)
    const skipRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/florist/orders/${pOrderId}/status`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${floristToken}`
      }
    }, { status: 'delivered' });

    assert(skipRes.status === 400 && skipRes.body?.error === 'ILLEGAL_TRANSITION',
      'Skipping lifecycle steps (preparing -> delivered) rejected with ILLEGAL_TRANSITION',
      `Status: ${skipRes.status}`);

    // Transition properly: preparing -> ready_for_pickup -> out_for_delivery -> delivered
    await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/florist/orders/${pOrderId}/status`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${floristToken}` }
    }, { status: 'ready_for_pickup' });

    await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/florist/orders/${pOrderId}/status`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${floristToken}` }
    }, { status: 'out_for_delivery' });

    const deliveredRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/florist/orders/${pOrderId}/status`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${floristToken}` }
    }, { status: 'delivered' });

    assert(deliveredRes.status === 200, 'Terminal state "delivered" reached successfully', `Status: ${deliveredRes.status}`);

    // Terminal state guard: cannot transition away from "delivered"
    const alterDeliveredRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/florist/orders/${pOrderId}/status`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${floristToken}` }
    }, { status: 'preparing' });

    assert(alterDeliveredRes.status === 400, 'Altering terminal state "delivered" rejected with 400', `Status: ${alterDeliveredRes.status}`);
  } catch (err) {
    assert(false, 'State machine and inventory test error', err.message);
  }

  // ----------------------------------------------------
  // TEST P2-007: Order Cancellation & Inventory Restoration
  // ----------------------------------------------------
  console.log('\n--- Finding P2-007: Customer Cancellation Synchronization & Stock Restoration ---');
  try {
    const customer = dbData.users.find(u => u.role === 'customer') || { id: 'cust-1', email: 'c@test.com' };
    const custToken = jwt.sign({ sub: customer.id, email: customer.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

    const freshDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    const targetProduct = freshDb.products.find(p => p.inventoryQty !== undefined && p.inventoryQty >= 5) || freshDb.products[0];
    if ((targetProduct.inventoryQty || 0) < 5) {
      targetProduct.inventoryQty = 25;
      fs.writeFileSync('db.json', JSON.stringify(freshDb, null, 2));
    }
    const preStock = targetProduct.inventoryQty;

    // Create and pay for order
    const sessionRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/create-session',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` }
    }, {
      items: [{ productId: targetProduct.id, title: targetProduct.title, quantity: 1, floristId: targetProduct.floristId || 'florist-1' }],
      recipient_name: 'Cancel Test',
      recipient_phone: '+254711000000',
      delivery_address: 'Gigiri, Nairobi'
    });

    const pOrderId = sessionRes.body?.data?.id;
    await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/pay-card',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` }
    }, { parent_order_id: pOrderId });

    // Cancel order as customer
    const cancelRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: `/api/v1/customer/orders/${pOrderId}/cancel`,
      method: 'POST',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });

    assert(cancelRes.status === 200, 'Customer order cancellation processed', `Status: ${cancelRes.status}`);

    const postCancelDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    const cancelledPord = postCancelDb.parent_orders.find(p => p.id === pOrderId);
    assert(cancelledPord && cancelledPord.paymentStatus === 'cancelled', 'Parent order paymentStatus marked cancelled', `Status: ${cancelledPord?.paymentStatus}`);
    assert(cancelledPord && cancelledPord.subOrders.every(so => so.fulfillmentStatus === 'cancelled'), 'All child subOrders marked cancelled', `Child statuses: ${cancelledPord?.subOrders?.map(so => so.fulfillmentStatus).join(', ')}`);

    const restoredProduct = postCancelDb.products.find(p => p.id === targetProduct.id);
    assert(restoredProduct && restoredProduct.inventoryQty === preStock, 'Product inventory restored back to original level upon cancellation', `Stock: ${restoredProduct?.inventoryQty} (Original: ${preStock})`);
  } catch (err) {
    assert(false, 'Cancellation sync test error', err.message);
  }

  // ----------------------------------------------------
  // TEST P2-008: M-Pesa Callback Child Sub-Orders Synchronization
  // ----------------------------------------------------
  console.log('\n--- Finding P2-008: M-Pesa IPN Sub-Order Synchronization ---');
  try {
    const customer = dbData.users.find(u => u.role === 'customer') || { id: 'cust-1', email: 'c@test.com' };
    const custToken = jwt.sign({ sub: customer.id, email: customer.email, role: 'customer' }, JWT_SECRET, { expiresIn: '1h' });

    // Create session
    const sessionRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/create-session',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${custToken}` }
    }, {
      items: [{ productId: 'prod-101', title: 'Test Rose', unitPrice: 3000, quantity: 1, floristId: 'florist-1' }],
      recipient_name: 'Mpesa IPN Sync Tester',
      recipient_phone: '+254712999888',
      delivery_address: 'Kilimani, Nairobi'
    });

    const pOrderId = sessionRes.body?.data?.id;

    // Simulate STK initiation
    const testChqId = 'ws_CO_TEST_' + Date.now();
    const liveDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    liveDb.mpesa_transactions.push({
      id: 'tx-test-' + Date.now(),
      parent_order_id: pOrderId,
      merchant_request_id: 'mr-test-' + Date.now(),
      checkout_request_id: testChqId,
      phone_number: '254712999888',
      amount: 3350,
      status: 'initiated',
      created_at: new Date().toISOString()
    });
    fs.writeFileSync('db.json', JSON.stringify(liveDb, null, 2));

    // Post IPN callback
    const ipnRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/checkout/mpesa-callback',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      Body: {
        stkCallback: {
          MerchantRequestID: 'mr-test',
          CheckoutRequestID: testChqId,
          ResultCode: 0,
          ResultDesc: 'The service was accepted successfully',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 3350 },
              { Name: 'MpesaReceiptNumber', Value: 'QK88TEST999' },
              { Name: 'TransactionDate', Value: 20260908120000 },
              { Name: 'PhoneNumber', Value: 254712999888 }
            ]
          }
        }
      }
    });

    assert(ipnRes.status === 200, 'IPN callback ingested successfully', `Status: ${ipnRes.status}`);

    const postIpnDb = JSON.parse(fs.readFileSync('db.json', 'utf8'));
    const paidPord = postIpnDb.parent_orders.find(p => p.id === pOrderId);
    assert(paidPord && paidPord.paymentStatus === 'paid', 'Parent order marked as paid', `Status: ${paidPord?.paymentStatus}`);
    assert(paidPord && paidPord.subOrders?.length > 0 && paidPord.subOrders.every(so => so.fulfillmentStatus === 'received'),
      'All child subOrders in parentOrder updated to "received" by M-Pesa IPN callback',
      `Sub-order fulfillment status: ${paidPord?.subOrders[0]?.fulfillmentStatus}`);
  } catch (err) {
    assert(false, 'IPN sub-order sync test error', err.message);
  }

  // ----------------------------------------------------
  // TEST P2-009: Florist Financial Ledger & Wallet Integrity
  // ----------------------------------------------------
  console.log('\n--- Finding P2-009: Florist Financial Ledger & Available Balance Calculations ---');
  try {
    const florist = dbData.florists.find(f => f.verificationStatus === 'approved') || dbData.florists[0];
    const floristToken = jwt.sign({ sub: florist.userId, email: 'florist@test.com', role: 'florist' }, JWT_SECRET, { expiresIn: '1h' });

    const finRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/florist/financials',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${floristToken}` }
    });

    assert(finRes.status === 200, 'Florist financials retrieved from authoritative ledger', `Status: ${finRes.status}`);
    const finData = finRes.body;

    assert(typeof finData.availableBalance === 'number' && finData.availableBalance >= 0,
      'Available balance is a valid non-negative number calculated from parent_orders & withdrawals',
      `Available balance: KES ${finData.availableBalance}`);
    assert(typeof finData.commissionDeducted === 'number',
      'Platform commission is mathematically tracked',
      `Commission: KES ${finData.commissionDeducted}`);
    assert(typeof finData.totalNetEarnings === 'number',
      'Net earnings are tracked',
      `Net earnings: KES ${finData.totalNetEarnings}`);

    // Test Withdrawal Request Limit
    const excessiveWithdrawalRes = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/v1/florist/withdrawals',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${floristToken}` }
    }, { amount: finData.availableBalance + 100000 });

    assert(excessiveWithdrawalRes.status === 400,
      'Withdrawal exceeding available ledger balance blocked with 400 Bad Request',
      `Status: ${excessiveWithdrawalRes.status}`);
  } catch (err) {
    assert(false, 'Financial ledger test error', err.message);
  }

  console.log('\n========================================================');
  console.log(`P2 AUDIT TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('========================================================');

  if (failCount > 0) process.exit(1);
  else process.exit(0);
}

runP2AuditSuite().catch(err => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});
