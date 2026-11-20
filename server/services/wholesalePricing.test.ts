import test from 'node:test';
import assert from 'node:assert/strict';
import { getEffectiveUnitPrice } from '../utils/wholesalePricing.ts';

test('Wholesale Pricing - single piece returns base price', () => {
  const product = {
    price: 300,
    wholesaleTiers: [
      { minQty: 5, price: 255 },
      { minQty: 15, price: 225 },
      { minQty: 50, price: 195 }
    ]
  };

  assert.equal(getEffectiveUnitPrice(product, 1), 300);
  assert.equal(getEffectiveUnitPrice(product, 4), 300);
});

test('Wholesale Pricing - Tier 1 applies when quantity >= 5 and < 15', () => {
  const product = {
    price: 300,
    wholesaleTiers: [
      { minQty: 5, price: 255 },
      { minQty: 15, price: 225 },
      { minQty: 50, price: 195 }
    ]
  };

  assert.equal(getEffectiveUnitPrice(product, 5), 255);
  assert.equal(getEffectiveUnitPrice(product, 10), 255);
  assert.equal(getEffectiveUnitPrice(product, 14), 255);
});

test('Wholesale Pricing - Tier 2 applies when quantity >= 15 and < 50', () => {
  const product = {
    price: 300,
    wholesaleTiers: [
      { minQty: 5, price: 255 },
      { minQty: 15, price: 225 },
      { minQty: 50, price: 195 }
    ]
  };

  assert.equal(getEffectiveUnitPrice(product, 15), 225);
  assert.equal(getEffectiveUnitPrice(product, 49), 225);
});

test('Wholesale Pricing - Tier 3 applies when quantity >= 50', () => {
  const product = {
    price: 300,
    wholesaleTiers: [
      { minQty: 5, price: 255 },
      { minQty: 15, price: 225 },
      { minQty: 50, price: 195 }
    ]
  };

  assert.equal(getEffectiveUnitPrice(product, 50), 195);
  assert.equal(getEffectiveUnitPrice(product, 100), 195);
});

test('Wholesale Pricing - fallback to legacy wholesalePrice and wholesaleMinQty', () => {
  const product = {
    price: 200,
    wholesalePrice: 160,
    wholesaleMinQty: 10
  };

  assert.equal(getEffectiveUnitPrice(product, 5), 200);
  assert.equal(getEffectiveUnitPrice(product, 10), 160);
  assert.equal(getEffectiveUnitPrice(product, 20), 160);
});
