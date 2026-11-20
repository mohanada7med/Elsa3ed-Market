import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { OrderDocument } from '../models/types.ts';
import { memoryDb } from '../db/mongodb.ts';
import { calculateSellerBalance } from './payoutService.ts';

const databaseEnvironmentKeys = [
  'MONGODB_URI',
  'MONGODB_CONNECTION_URL',
  'MONGO_URI',
  'DATABASE_URL'
] as const;

test('seller balance includes legacy order items and excludes cancelled orders', async () => {
  const originalEnvironment = new Map(
    databaseEnvironmentKeys.map((key) => [key, process.env[key]])
  );
  const originalOrders = memoryDb.orders;
  const originalPayouts = memoryDb.payouts;
  const sellerId = 'seller-payout-breakdown-test';
  const order: OrderDocument = {
    id: 'order-payout-breakdown-test',
    orderNumber: 'SAED-PAYOUT-TEST',
    buyerId: 'buyer-payout-test',
    buyerName: 'مشتري تجريبي',
    buyerPhone: '01000000000',
    shippingAddress: {
      fullName: 'مشتري تجريبي',
      phone: '01000000000',
      governorate: 'قنا',
      city: 'قنا',
      streetAddress: 'عنوان تجريبي'
    },
    items: [
      {
        productId: 'product-a',
        productTitle: 'منتج أ',
        productImage: '',
        sellerId,
        sellerName: 'ورشة تجريبية',
        sellerGovernorate: 'قنا',
        quantity: 2,
        unitPrice: 100,
        subtotal: 200
      },
      {
        productId: 'product-b',
        productTitle: 'منتج ب',
        productImage: '',
        sellerId,
        sellerName: 'ورشة تجريبية',
        sellerGovernorate: 'قنا',
        quantity: 1,
        unitPrice: 50,
        subtotal: 50
      }
    ],
    status: 'delivered',
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    subtotal: 250,
    shippingFee: 0,
    discountAmount: 0,
    sellerTipAmount: 20,
    sellerTipSellerId: sellerId,
    total: 270,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    trackingNumber: 'TRACK-PAYOUT-TEST',
    timeline: [],
    sellerIds: [sellerId]
  };
  const cancelledOrder: OrderDocument = {
    ...order,
    id: 'cancelled-payout-order-test',
    orderNumber: 'SAED-CANCELLED-TEST',
    status: 'cancelled',
    paymentStatus: 'refunded',
    sellerTipAmount: 0,
    items: [{ ...order.items[0], quantity: 4 }]
  };
  const legacyOrder: OrderDocument = {
    ...order,
    id: 'legacy-payout-order-test',
    orderNumber: 'SAED-LEGACY-TEST',
    sellerIds: [],
    sellerTipAmount: 0,
    sellerTipSellerId: undefined,
    items: [
      {
        ...order.items[0],
        productId: 'legacy-product',
        productTitle: 'منتج قديم',
        quantity: 1,
        unitPrice: 75,
        subtotal: 75
      }
    ]
  };

  databaseEnvironmentKeys.forEach((key) => delete process.env[key]);

  try {
    memoryDb.orders = [order, cancelledOrder, legacyOrder];
    memoryDb.payouts = [];

    const balance = await calculateSellerBalance(sellerId);

    assert.equal(balance.totalSalesCount, 4);
    assert.equal(balance.sellerOrdersCount, 2);
    assert.equal(balance.totalProductSales, 325);
    assert.equal(balance.totalSellerTips, 20);
    assert.equal(balance.totalEarnings, 345);
    assert.deepEqual(
      balance.salesByProduct.map(({ productId, quantity, revenue, ordersCount }) => ({
        productId,
        quantity,
        revenue,
        ordersCount
      })),
      [
        { productId: 'product-a', quantity: 2, revenue: 200, ordersCount: 1 },
        { productId: 'legacy-product', quantity: 1, revenue: 75, ordersCount: 1 },
        { productId: 'product-b', quantity: 1, revenue: 50, ordersCount: 1 }
      ]
    );
    assert.equal(balance.recentSales.length, 2);
    assert.equal(balance.recentSales[0].productSales, 250);
  } finally {
    memoryDb.orders = originalOrders;
    memoryDb.payouts = originalPayouts;
    originalEnvironment.forEach((value, key) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
});
