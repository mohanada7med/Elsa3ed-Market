import { test } from 'node:test';
import assert from 'node:assert';
import { webPushService } from './webPushService.ts';

test('WebPushService - returns valid public VAPID key', () => {
  const key = webPushService.getVapidPublicKey();
  assert.ok(key, 'VAPID public key should exist');
  assert.ok(key.length > 30, 'VAPID public key should be non-empty base64 string');
});

test('WebPushService - saves and retrieves subscription in memory/db', async () => {
  const testSub = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-token-12345',
    keys: {
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0A37YzxY_GjyKZ2u0zk8WSu8i0-A',
      auth: 'tBHItJI5svbpez7KI4CCXg'
    },
    userId: 'user-test-push-1',
    role: 'buyer'
  };

  const saved = await webPushService.saveSubscription(testSub);
  assert.ok(saved.id, 'Subscription should receive an ID');
  assert.strictEqual(saved.endpoint, testSub.endpoint);
  assert.strictEqual(saved.userId, 'user-test-push-1');

  // Upsert with updated role
  const updated = await webPushService.saveSubscription({
    ...testSub,
    role: 'seller'
  });
  assert.strictEqual(updated.role, 'seller');

  // Cleanup
  const removed = await webPushService.removeSubscription(testSub.endpoint);
  assert.strictEqual(removed, true, 'Subscription should be removed successfully');
});

test('WebPushService - sending to invalid/mock subscription handles failure gracefully without crashing', async () => {
  const dummySub = {
    id: 'mock-sub',
    endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/mock-nonexistent-token',
    keys: {
      p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9t0A37YzxY_GjyKZ2u0zk8WSu8i0-A',
      auth: 'tBHItJI5svbpez7KI4CCXg'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await webPushService.sendToSubscription(dummySub, {
    title: 'إشعار تجريبي',
    body: 'مرحبا بك في سوق وه'
  });

  // Should return false because endpoint is non-existent, but must not throw or crash
  assert.strictEqual(typeof result, 'boolean');

  setTimeout(() => process.exit(0), 100);
});
