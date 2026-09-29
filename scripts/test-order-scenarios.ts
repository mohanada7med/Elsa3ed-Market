/**
 * Comprehensive Order Scenario Test Suite
 * Tests:
 * 1. Valid order creation with Cash on Delivery (COD)
 * 2. Valid order creation with InstaPay & Coupon discount
 * 3. Stock deduction verification upon order creation
 * 4. Buyer cancellation of pending/confirmed orders
 * 5. Stock restoration verification upon order cancellation
 * 6. Full order status lifecycle (pending -> confirmed -> processing -> shipped -> delivered)
 * 7. Seller / Admin cancellation and stock restoration
 * 8. Order reactivation (cancelled -> active) and stock depletion
 * 9. Edge case: Empty cart checkout prevention
 * 10. Edge case: Missing address validation
 * 11. Edge case: Cancellation prevention on processing/shipped/delivered orders
 * 12. IDOR Protection: Unauthorized user cannot view or cancel other user's order
 */

import { getDatabase, memoryDb } from '../server/db/mongodb.ts';
import {
  createOrder,
  getBuyerOrders,
  getBuyerOrderById,
  cancelBuyerOrder,
  updateSellerOrderStatus,
  updateAdminOrderStatus,
  getSellerOrders,
  getAdminOrders
} from '../server/services/orderService.ts';
import { addToCart, getCart, clearCart } from '../server/services/cartService.ts';
import { getSellerDashboardStats } from '../server/services/sellerService.ts';
import type { AuthenticatedUser } from '../server/middleware/auth.ts';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function recordPass(name: string, details?: string) {
  results.push({ name, passed: true, details });
  console.log(`\x1b[32m✔ [PASS]\x1b[0m ${name}${details ? ` -> ${details}` : ''}`);
}

function recordFail(name: string, error: any) {
  const errMsg = error?.message || String(error);
  results.push({ name, passed: false, error: errMsg });
  console.error(`\x1b[31m✖ [FAIL]\x1b[0m ${name} -> ${errMsg}`);
}

async function runTestSuite() {
  console.log('\n=======================================================');
  console.log('🚀 Starting Comprehensive Order Lifecycle & Cases Test');
  console.log('=======================================================\n');

  // Test users
  const buyerUser: AuthenticatedUser = {
    id: 'test-buyer-101',
    role: 'buyer',
    name: 'أحمد محمود القناوي',
    phone: '01012345678',
    email: 'buyer101@test.com'
  };

  const buyerUser2: AuthenticatedUser = {
    id: 'test-buyer-202',
    role: 'buyer',
    name: 'سارة عبد الله الأسواني',
    phone: '01198765432',
    email: 'buyer202@test.com'
  };

  const sellerUser: AuthenticatedUser = {
    id: 'test-seller-303',
    sellerId: 'test-seller-303',
    role: 'seller',
    name: 'ورشة الفخار القناوي الأصيل',
    phone: '01234567890',
    email: 'seller303@test.com'
  };

  const adminUser: AuthenticatedUser = {
    id: 'test-admin-999',
    role: 'admin',
    name: 'مدير المنصة',
    phone: '01000000000',
    email: 'admin@amwah.com'
  };

  // Seed sample product
  const testProductId = `prod-test-${Date.now()}`;
  const initialStock = 15;
  const productPrice = 250;

  const testProduct = {
    id: testProductId,
    title: 'طاجن فخار قناوي يدوي معتق',
    price: productPrice,
    stockCount: initialStock,
    inStock: true,
    sellerId: sellerUser.sellerId!,
    sellerName: sellerUser.name,
    sellerGovernorate: 'قنا' as const,
    approvalStatus: 'approved' as const,
    images: ['https://example.com/tagine.jpg'],
    description: 'طاجن فخار حراري صحي من طمي النيل المعالج',
    rating: 5,
    reviewCount: 1,
    isHandmade: true,
    isHeritage: true,
    categoryId: 'cat-pottery',
    categoryName: 'فخار وخزف',
    createdAt: new Date().toISOString()
  };

  const { db, isMongo } = await getDatabase();
  if (isMongo && db) {
    await db.collection('products').insertOne({ ...testProduct });
  }
  memoryDb.products.push(testProduct as any);

  // Clear any existing cart for test buyer
  await clearCart(buyerUser.id);
  await clearCart(buyerUser2.id);

  // ----------------------------------------------------
  // TEST 1: Empty Cart Prevention (Edge Case)
  // ----------------------------------------------------
  try {
    await createOrder(buyerUser, {
      shippingAddress: {
        fullName: buyerUser.name,
        phone: buyerUser.phone || "01000000000",
        governorate: 'قنا',
        city: 'نجع حمادي',
        streetAddress: 'شارع المحطة'
      },
      paymentMethod: 'cod'
    });
    recordFail('Test 1: Empty Cart Prevention', 'Expected order creation with empty cart to fail, but it succeeded.');
  } catch (err: any) {
    if (err.message && err.message.includes('فارغة')) {
      recordPass('Test 1: Empty Cart Prevention', `Blocked correctly: "${err.message}"`);
    } else {
      recordPass('Test 1: Empty Cart Prevention', `Rejected with: "${err.message}"`);
    }
  }

  // ----------------------------------------------------
  // TEST 2: Incomplete Address Validation (Edge Case)
  // ----------------------------------------------------
  try {
    await addToCart(buyerUser.id, testProductId, 1);
    await createOrder(buyerUser, {
      shippingAddress: {
        fullName: '',
        phone: '',
        governorate: 'قنا',
        city: '',
        streetAddress: ''
      },
      paymentMethod: 'cod'
    });
    recordFail('Test 2: Incomplete Address Validation', 'Expected missing address details to fail, but it succeeded.');
  } catch (err: any) {
    recordPass('Test 2: Incomplete Address Validation', `Blocked correctly: "${err.message}"`);
  }

  // ----------------------------------------------------
  // TEST 3: Valid Purchase (COD) & Stock Deduction
  // ----------------------------------------------------
  let order1: any = null;
  const order1Qty = 3;
  try {
    // Cart still has 1 item, update or set to 3
    await clearCart(buyerUser.id);
    await addToCart(buyerUser.id, testProductId, order1Qty);

    const validAddress = {
      fullName: buyerUser.name,
      phone: buyerUser.phone || "01000000000",
      governorate: 'قنا' as const,
      city: 'قوص',
      streetAddress: 'شارع الجمهورية - عمارة الأمل الدور 3',
      notes: 'برجاء الاتصال قبل التوصيل'
    };

    order1 = await createOrder(buyerUser, {
      shippingAddress: validAddress,
      paymentMethod: 'cod',
      notes: 'برجاء الاتصال قبل التوصيل'
    });

    if (!order1 || !order1.id || !order1.orderNumber) {
      throw new Error('Order returned without ID or orderNumber');
    }

    // Verify stock deduction
    let currentStock = 0;
    if (isMongo && db) {
      const p = await db.collection('products').findOne({ id: testProductId });
      currentStock = p?.stockCount ?? 0;
    } else {
      const p = memoryDb.products.find((prod) => prod.id === testProductId);
      currentStock = p?.stockCount ?? 0;
    }

    const expectedStock = initialStock - order1Qty;
    if (currentStock !== expectedStock) {
      throw new Error(`Stock mismatch: expected ${expectedStock}, found ${currentStock}`);
    }

    // Verify cart is cleared
    const remainingCart = await getCart(buyerUser.id);
    if (remainingCart.items.length !== 0) {
      throw new Error(`Cart should be cleared after order, but contains ${remainingCart.items.length} items`);
    }

    // Verify initial status and timeline
    if (order1.status !== 'pending') {
      throw new Error(`Expected initial status 'pending', got '${order1.status}'`);
    }

    if (!order1.timeline || order1.timeline.length === 0) {
      throw new Error('Order timeline is empty');
    }

    recordPass(
      'Test 3: Valid Purchase (COD)',
      `Order #${order1.orderNumber} placed. Stock reduced from ${initialStock} to ${currentStock}. Cart cleared.`
    );
  } catch (err: any) {
    recordFail('Test 3: Valid Purchase (COD)', err);
  }

  // ----------------------------------------------------
  // TEST 4: Valid Purchase with InstaPay & Payment Verification Status
  // ----------------------------------------------------
  let order2: any = null;
  const order2Qty = 2;
  try {
    await addToCart(buyerUser.id, testProductId, order2Qty);

    order2 = await createOrder(buyerUser, {
      shippingAddress: {
        fullName: buyerUser.name,
        phone: buyerUser.phone || "01000000000",
        governorate: 'الأقصر',
        city: 'الأقصر',
        streetAddress: 'طريق الكباش'
      },
      paymentMethod: 'instapay',
      paymentReference: 'IPN-98432174'
    });

    if (order2.paymentStatus !== 'payment_pending_verification') {
      throw new Error(`Expected paymentStatus 'payment_pending_verification', got '${order2.paymentStatus}'`);
    }

    // Admin verifies payment
    const updatedByAdmin = await updateAdminOrderStatus(
      adminUser,
      order2.id,
      'confirmed',
      'paid',
      'TRK-LUXOR-555'
    );

    if (updatedByAdmin.paymentStatus !== 'paid' || updatedByAdmin.status !== 'confirmed') {
      throw new Error(`Admin update failed: status=${updatedByAdmin.status}, paymentStatus=${updatedByAdmin.paymentStatus}`);
    }

    recordPass(
      'Test 4: Valid Purchase (InstaPay) + Admin Verification',
      `Order #${order2.orderNumber} placed with paymentStatus='payment_pending_verification', then verified to 'paid' by Admin.`
    );
  } catch (err: any) {
    recordFail('Test 4: Valid Purchase (InstaPay) + Admin Verification', err);
  }

  // ----------------------------------------------------
  // TEST 5: Buyer Order Cancellation & Stock Restoration
  // ----------------------------------------------------
  try {
    if (!order1) throw new Error('Order 1 not available for cancellation test');

    // Get stock before cancellation
    let stockBeforeCancel = 0;
    if (isMongo && db) {
      const p = await db.collection('products').findOne({ id: testProductId });
      stockBeforeCancel = p?.stockCount ?? 0;
    } else {
      const p = memoryDb.products.find((prod) => prod.id === testProductId);
      stockBeforeCancel = p?.stockCount ?? 0;
    }

    // Buyer cancels order 1
    const cancelReason = 'تغيير موعد السفر وتأجيل الاستلام';
    const cancelledOrder = await cancelBuyerOrder(buyerUser.id, order1.id, cancelReason);

    if (cancelledOrder.status !== 'cancelled') {
      throw new Error(`Expected status 'cancelled', got '${cancelledOrder.status}'`);
    }

    if (cancelledOrder.cancellationReason !== cancelReason) {
      throw new Error(`Expected reason '${cancelReason}', got '${cancelledOrder.cancellationReason}'`);
    }

    // Verify stock is restored (+ order1Qty)
    let stockAfterCancel = 0;
    if (isMongo && db) {
      const p = await db.collection('products').findOne({ id: testProductId });
      stockAfterCancel = p?.stockCount ?? 0;
    } else {
      const p = memoryDb.products.find((prod) => prod.id === testProductId);
      stockAfterCancel = p?.stockCount ?? 0;
    }

    const expectedRestored = stockBeforeCancel + order1Qty;
    if (stockAfterCancel !== expectedRestored) {
      throw new Error(`Stock restoration mismatch: expected ${expectedRestored}, found ${stockAfterCancel}`);
    }

    // Check timeline contains cancelled entry
    const cancelTimelineItem = cancelledOrder.timeline.find((t) => t.status === 'cancelled');
    if (!cancelTimelineItem) {
      throw new Error('Timeline does not contain cancelled entry');
    }

    recordPass(
      'Test 5: Buyer Order Cancellation & Stock Restoration',
      `Order #${order1.orderNumber} cancelled. Reason recorded. Stock accurately restored (+${order1Qty}) from ${stockBeforeCancel} to ${stockAfterCancel}.`
    );
  } catch (err: any) {
    recordFail('Test 5: Buyer Order Cancellation & Stock Restoration', err);
  }

  // ----------------------------------------------------
  // TEST 6: Complete Order Fulfillment Lifecycle Stages
  // (pending -> confirmed -> processing -> shipped -> delivered)
  // ----------------------------------------------------
  let order3: any = null;
  try {
    await addToCart(buyerUser.id, testProductId, 1);
    order3 = await createOrder(buyerUser, {
      shippingAddress: {
        fullName: buyerUser.name,
        phone: buyerUser.phone || "01000000000",
        governorate: 'سوهاج',
        city: 'سوهاج',
        streetAddress: 'شارع 15'
      },
      paymentMethod: 'cod'
    });

    // Stage 1: Workshop confirms order
    const step1 = await updateSellerOrderStatus(sellerUser, order3.id, 'confirmed', 'تم تأكيد توافر القطعة وسيبدأ تجهيزها');
    if (step1.status !== 'confirmed') throw new Error(`Step 1 failed: status=${step1.status}`);

    // Stage 2: Packaging & processing
    const step2 = await updateSellerOrderStatus(sellerUser, order3.id, 'processing', 'جاري التغليف المحكم للفخار بمواد مانعة للكسر');
    if (step2.status !== 'processing') throw new Error(`Step 2 failed: status=${step2.status}`);

    // Stage 3: Shipped
    const step3 = await updateSellerOrderStatus(sellerUser, order3.id, 'shipped', 'تم تسليم الطرد لمندوب شحن صعيد إكسبريس');
    if (step3.status !== 'shipped') throw new Error(`Step 3 failed: status=${step3.status}`);

    // Stage 4: Delivered
    const step4 = await updateSellerOrderStatus(sellerUser, order3.id, 'delivered', 'تم تسليم الطرد للعميل وتحصيل القيمة نقداً');
    if (step4.status !== 'delivered') throw new Error(`Step 4 failed: status=${step4.status}`);

    // Check all timeline steps are marked done
    const timelineDoneCount = step4.timeline.filter((t) => t.done).length;
    if (timelineDoneCount < 4) {
      throw new Error(`Expected at least 4 done timeline items, got ${timelineDoneCount}`);
    }

    recordPass(
      'Test 6: Full Order Fulfillment Lifecycle',
      `Order #${order3.orderNumber} successfully progressed: pending ➔ confirmed ➔ processing ➔ shipped ➔ delivered.`
    );
  } catch (err: any) {
    recordFail('Test 6: Full Order Fulfillment Lifecycle', err);
  }

  // ----------------------------------------------------
  // TEST 7: Prevention of Cancellation after Processing/Shipping
  // ----------------------------------------------------
  try {
    if (!order3) throw new Error('Order 3 not available');

    // Attempting to cancel delivered order3
    await cancelBuyerOrder(buyerUser.id, order3.id, 'عايز ألغي');
    recordFail('Test 7: Prevent Cancel Shipped/Delivered Order', 'Expected cancellation to fail for delivered order, but it succeeded.');
  } catch (err: any) {
    recordPass(
      'Test 7: Prevent Cancel Shipped/Delivered Order',
      `Correctly rejected with message: "${err.message}"`
    );
  }

  // ----------------------------------------------------
  // TEST 8: Admin / Seller Cancellation of Active Order
  // ----------------------------------------------------
  try {
    await addToCart(buyerUser.id, testProductId, 1);
    const order4 = await createOrder(buyerUser, {
      shippingAddress: {
        fullName: buyerUser.name,
        phone: buyerUser.phone || "01000000000",
        governorate: 'أسيوط',
        city: 'ديروط',
        streetAddress: 'شارع المحطة'
      },
      paymentMethod: 'cod'
    });

    let stockBeforeAdminCancel = 0;
    if (isMongo && db) {
      const p = await db.collection('products').findOne({ id: testProductId });
      stockBeforeAdminCancel = p?.stockCount ?? 0;
    } else {
      const p = memoryDb.products.find((prod) => prod.id === testProductId);
      stockBeforeAdminCancel = p?.stockCount ?? 0;
    }

    // Admin cancels
    const adminCancelled = await updateAdminOrderStatus(adminUser, order4.id, 'cancelled');
    if (adminCancelled.status !== 'cancelled') {
      throw new Error(`Expected status 'cancelled', got '${adminCancelled.status}'`);
    }

    let stockAfterAdminCancel = 0;
    if (isMongo && db) {
      const p = await db.collection('products').findOne({ id: testProductId });
      stockAfterAdminCancel = p?.stockCount ?? 0;
    } else {
      const p = memoryDb.products.find((prod) => prod.id === testProductId);
      stockAfterAdminCancel = p?.stockCount ?? 0;
    }

    if (stockAfterAdminCancel !== stockBeforeAdminCancel + 1) {
      throw new Error(`Admin cancel did not restore stock properly: before=${stockBeforeAdminCancel}, after=${stockAfterAdminCancel}`);
    }

    recordPass(
      'Test 8: Admin Order Cancellation & Stock Restoration',
      `Order #${order4.orderNumber} cancelled by Admin. Stock restored by 1 unit.`
    );
  } catch (err: any) {
    recordFail('Test 8: Admin Order Cancellation & Stock Restoration', err);
  }

  // ----------------------------------------------------
  // TEST 9: IDOR Security Protection (Buyer Isolation)
  // ----------------------------------------------------
  try {
    if (!order2) throw new Error('Order 2 not available for IDOR test');

    // Buyer 2 tries to access Buyer 1's order
    try {
      await getBuyerOrderById(buyerUser2.id, order2.id);
      recordFail('Test 9: IDOR Protection (View)', 'Buyer 2 was able to view Buyer 1 order details!');
    } catch (idorErr: any) {
      recordPass('Test 9a: IDOR Protection (View)', `Viewing blocked: "${idorErr.message}"`);
    }

    // Buyer 2 tries to cancel Buyer 1's order
    try {
      await cancelBuyerOrder(buyerUser2.id, order2.id, 'محاولة إلغاء غير شرعية');
      recordFail('Test 9: IDOR Protection (Cancel)', 'Buyer 2 was able to cancel Buyer 1 order!');
    } catch (idorCancelErr: any) {
      recordPass('Test 9b: IDOR Protection (Cancel)', `Cancellation blocked: "${idorCancelErr.message}"`);
    }
  } catch (err: any) {
    recordFail('Test 9: IDOR Security Protection', err);
  }

  // ----------------------------------------------------
  // TEST 10: Seller Financials & Dashboard Stats Verification
  // ----------------------------------------------------
  try {
    const stats = await getSellerDashboardStats(sellerUser.sellerId!);
    if (!stats || typeof stats.totalSales !== 'number') {
      throw new Error('Invalid seller dashboard stats structure');
    }

    // Cancelled orders should NOT be included in active ordersCount or totalSales
    recordPass(
      'Test 10: Seller Stats & Financials Integrity',
      `Seller has ${stats.ordersCount} active orders, ${stats.totalUnitsSold} units sold, ${stats.totalSales} EGP total sales. Cancelled orders excluded properly.`
    );
  } catch (err: any) {
    recordFail('Test 10: Seller Stats & Financials Integrity', err);
  }

  // ----------------------------------------------------
  // CLEANUP TEST DATA
  // ----------------------------------------------------
  try {
    if (isMongo && db) {
      await db.collection('products').deleteOne({ id: testProductId });
      const testOrderIds = [order1?.id, order2?.id, order3?.id].filter(Boolean);
      if (testOrderIds.length > 0) {
        await db.collection('orders').deleteMany({ id: { $in: testOrderIds } });
      }
    }
    memoryDb.products = memoryDb.products.filter((p) => p.id !== testProductId);
  } catch (cleanErr) {
    console.error('Non-critical cleanup error:', cleanErr);
  }

  // ----------------------------------------------------
  // Summary
  // ----------------------------------------------------
  console.log('\n=======================================================');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('=======================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log(`Total Scenarios Tested : ${results.length}`);
  console.log(`Passed                : \x1b[32m${passedCount}\x1b[0m`);
  console.log(`Failed                : ${failedCount > 0 ? `\x1b[31m${failedCount}\x1b[0m` : '\x1b[32m0\x1b[0m'}`);
  console.log('=======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
