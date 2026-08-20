import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const records = new Map();

globalThis.wx = {
  getStorageSync: (key) => records.get(key),
  setStorageSync: (key, value) => records.set(key, value),
  removeStorageSync: (key) => records.delete(key),
};

const storage = require('../apps/miniprogram/utils/storage.js');

test('豆子库兼容旧库存数据并保存个人库', () => {
  records.set('doulaozhuang:inventory:v1', [{ code: 'A1', hex: '#FFFFFF', quantity: 1000 }]);
  const inventory = storage.getInventory();
  assert.equal(inventory[0].brand, 'MARD');
  assert.equal(inventory[0].paletteName, '221 色');

  storage.saveVault({ id: 'vault-1', name: '我的豆子库' });
  assert.equal(storage.getVault().name, '我的豆子库');
  storage.clearAllLocalData();
  assert.equal(storage.getInventory().length, 0);
  assert.equal(storage.getVault(), null);
});
