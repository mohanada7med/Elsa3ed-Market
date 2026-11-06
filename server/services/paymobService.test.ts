import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import type { OrderDocument } from '../models/types.ts';
import { getPaymobConfig, initiatePaymobPayment } from './paymobService.ts';

const ENV_KEYS = [
  'NODE_ENV',
  'APP_URL',
  'PAYMOB_ENVIRONMENT',
  'PAYMOB_API_KEY',
  'PAYMOB_SECRET_KEY',
  'PAYMOB_PUBLIC_KEY',
  'PAYMOB_INTEGRATION_ID',
  'PAYMOB_INTEGRATION_ID_CARD',
  'PAYMOB_INTEGRATION_ID_WALLET',
  'PAYMOB_CARD_INTEGRATION_ID',
  'PAYMOB_WALLET_INTEGRATION_ID',
  'PAYMOB_HMAC_SECRET'
] as const;

const originalEnvironment = new Map<string, string | undefined>();
const originalFetch = globalThis.fetch;
const order: OrderDocument = {
  id: 'ord-paymob-test',
  orderNumber: 'SAED-PAYMOB-TEST',
  buyerId: 'buyer-test',
  buyerName: 'Test Buyer',
  buyerPhone: '+201000000000',
  buyerEmail: 'buyer@example.test',
  shippingAddress: {
    fullName: 'Test Buyer',
    phone: '+201000000000',
    governorate: 'Cairo',
    city: 'Cairo',
    streetAddress: 'Test Street'
  },
  items: [],
  status: 'pending',
  paymentMethod: 'paymob_card',
  paymentStatus: 'pending',
  subtotal: 195,
  shippingFee: 0,
  discountAmount: 0,
  total: 195,
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  trackingNumber: 'TEST',
  timeline: [],
  sellerIds: []
};

function setBaseEnvironment(): void {
  const env = process.env as Record<string, string | undefined>;
  env.NODE_ENV = 'development';
  process.env.APP_URL = 'https://wah.example';
  process.env['PAYMOB_ENVIRONMENT'] = 'TEST';
  process.env.PAYMOB_API_KEY = 'legacy-api-key-not-for-intentions';
  process.env.PAYMOB_SECRET_KEY = 'sk_test_mock_secret';
  process.env.PAYMOB_PUBLIC_KEY = 'pk_test_mock_public';
  process.env.PAYMOB_INTEGRATION_ID_CARD = '6048001';
  process.env.PAYMOB_INTEGRATION_ID_WALLET = '6048171';
  process.env.PAYMOB_HMAC_SECRET = 'mock-hmac-secret';
  delete process.env.PAYMOB_INTEGRATION_ID;
  delete process.env.PAYMOB_CARD_INTEGRATION_ID;
  delete process.env.PAYMOB_WALLET_INTEGRATION_ID;
}

function mockPaymobResponse(
  status: number,
  body: Record<string, unknown> = { client_secret: 'csk_test_mock' }
): { requests: Array<{ url: string; init?: RequestInit }>; restore: () => void } {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  globalThis.fetch = async (input, init) => {
    requests.push({ url: String(input), init });
    return new Response(JSON.stringify(body), { status });
  };
  return {
    requests,
    restore: () => {
      globalThis.fetch = originalFetch;
    }
  };
}

beforeEach(() => {
  for (const key of ENV_KEYS) originalEnvironment.set(key, process.env[key]);
  setBaseEnvironment();
});

afterEach(() => {
  const env = process.env as Record<string, string | undefined>;
  globalThis.fetch = originalFetch;
  for (const key of ENV_KEYS) {
    const value = originalEnvironment.get(key);
    if (value === undefined) delete process.env[key];
    else env[key] = value;
  }
});

test('normalizes TEST and sends only the card integration for card checkout', async () => {
  const mock = mockPaymobResponse(201);
  const config = getPaymobConfig();
  const result = await initiatePaymobPayment(order, 'card', process.env.APP_URL);

  assert.equal(config.environment, 'test');
  assert.equal(config.secretKey, 'sk_test_mock_secret');
  assert.equal(mock.requests.length, 1);
  assert.equal(mock.requests[0].url, 'https://accept.paymob.com/v1/intention/');
  assert.deepEqual(JSON.parse(String(mock.requests[0].init?.body)).payment_methods, [6048001]);
  assert.equal(result.provider, 'paymob');
});

test('sends only the wallet integration as an integer for wallet checkout', async () => {
  const mock = mockPaymobResponse(201);
  const result = await initiatePaymobPayment(order, 'wallet', process.env.APP_URL);
  const request = mock.requests[0];
  const payload = JSON.parse(String(request.init?.body));

  assert.deepEqual(payload.payment_methods, [6048171]);
  assert.equal(typeof payload.payment_methods[0], 'number');
  assert.equal(payload.currency, 'EGP');
  assert.equal(request.init?.headers && (request.init.headers as Record<string, string>).Authorization, 'Token sk_test_mock_secret');
  assert.equal(result.provider, 'paymob');
});

test('rejects a missing wallet integration without falling back to card', async () => {
  const mock = mockPaymobResponse(201);
  delete process.env.PAYMOB_INTEGRATION_ID_WALLET;

  await assert.rejects(
    initiatePaymobPayment(order, 'wallet', process.env.APP_URL),
    /PAYMOB_INTEGRATION_ID_WALLET/
  );
  assert.equal(mock.requests.length, 0);
});

test('preserves Paymob 404 details and excludes credentials from logs', async () => {
  const mock = mockPaymobResponse(404, {
    detail: 'Integration ID/Name does not exist in our system'
  });
  const loggedErrors: string[] = [];
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => loggedErrors.push(args.map(String).join(' '));

  try {
    await assert.rejects(
      initiatePaymobPayment(order, 'wallet', process.env.APP_URL),
      (error: Error) =>
        error.message.includes('HTTP 404') &&
        error.message.includes('Integration ID/Name does not exist in our system') &&
        error.message.includes('راجع لوحة Paymob')
    );
  } finally {
    console.error = originalConsoleError;
  }

  assert.deepEqual(JSON.parse(String(mock.requests[0].init?.body)).payment_methods, [6048171]);
  const logs = loggedErrors.join('\n');
  assert.ok(logs.includes('6048171'));
  assert.ok(!logs.includes('sk_test_mock_secret'));
  assert.ok(!logs.includes('mock-hmac-secret'));
});

test('rejects recognizable TEST/LIVE key mismatches before contacting Paymob', async () => {
  const mock = mockPaymobResponse(201);
  process.env.PAYMOB_PUBLIC_KEY = 'pk_live_mock_public';

  await assert.rejects(
    initiatePaymobPayment(order, 'wallet', process.env.APP_URL),
    /PAYMOB_ENVIRONMENT=TEST/
  );
  assert.equal(mock.requests.length, 0);
});

test('does not use PAYMOB_API_KEY as the Intention API Secret Key', () => {
  delete process.env.PAYMOB_SECRET_KEY;
  assert.equal(getPaymobConfig().secretKey, undefined);
});
