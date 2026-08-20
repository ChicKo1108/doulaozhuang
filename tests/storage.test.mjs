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
const { createInventoryForKit } = require('../apps/miniprogram/utils/inventory-kit.js');
const { filterInventory, getAvailableLetters, getReplenishmentItems, sortInventory } = require('../apps/miniprogram/utils/inventory-view.js');

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

test('按色数创建豆子库时，会为每种颜色生成相同库存', () => {
  const inventory = createInventoryForKit(24, 1000, 'vault-24');
  assert.equal(inventory.length, 24);
  assert.equal(inventory[0].paletteName, '24 色');
  assert.equal(inventory[0].quantity, 1000);
  assert.equal(new Set(inventory.map((item) => item.code)).size, 24);
});

test('库存可按色号或余量排序，并识别建议和紧急补货', () => {
  const inventory = [
    { code: 'A10', quantity: 480 },
    { code: 'A2', quantity: 99 },
    { code: 'B1', quantity: 800 },
  ];
  assert.deepEqual(sortInventory(inventory, 'code_asc').map((item) => item.code), ['A2', 'A10', 'B1']);
  assert.deepEqual(sortInventory(inventory, 'quantity_desc').map((item) => item.code), ['B1', 'A10', 'A2']);
  assert.deepEqual(
    getReplenishmentItems(inventory).map((item) => `${item.code}:${item.replenishment.id}`),
    ['A2:urgent', 'A10:suggested'],
  );
});

test('库存支持按数量上限和色号字母组合筛选', () => {
  const inventory = [
    { code: 'A1', quantity: 40 },
    { code: 'A2', quantity: 180 },
    { code: 'B1', quantity: 90 },
    { code: 'M3', quantity: 1200 },
    { code: '001', quantity: 20 },
  ];
  assert.deepEqual(getAvailableLetters(inventory), ['A', 'B', 'M', '#']);
  assert.deepEqual(filterInventory(inventory, { maxQuantity: 100 }).map((item) => item.code), ['A1', 'B1', '001']);
  assert.deepEqual(filterInventory(inventory, { maxQuantity: 200, letter: 'A' }).map((item) => item.code), ['A1', 'A2']);
});

test('豆仓页面默认使用紧凑布局并通过图标切换', async () => {
  const [script, template] = await Promise.all([
    import('node:fs/promises').then(({ readFile }) => readFile('apps/miniprogram/pages/inventory/index.js', 'utf8')),
    import('node:fs/promises').then(({ readFile }) => readFile('apps/miniprogram/pages/inventory/index.wxml', 'utf8')),
  ]);
  assert.match(script, /viewMode: 'compact'/);
  assert.match(script, /VIEW_MODE_KEY\) \|\| 'compact'/);
  assert.match(template, /class="view-toggle"/);
  assert.doesNotMatch(template, /class="mode-button"/);
});

test('豆仓三个筛选功能区均为单行横向滑动', async () => {
  const { readFile } = await import('node:fs/promises');
  const template = await readFile('apps/miniprogram/pages/inventory/index.wxml', 'utf8');
  assert.equal((template.match(/class="filter-row"/g) || []).length, 3);
  assert.equal((template.match(/class="filter-scroll" scroll-x="true"/g) || []).length, 3);
  assert.doesNotMatch(template, /class="sort-button-row"|class="filter-chip-row"|class="letter-scroll"/);
});

test('豆仓请求切换时显示加载动画并忽略过期结果', async () => {
  const { readFile } = await import('node:fs/promises');
  const [script, template] = await Promise.all([
    readFile('apps/miniprogram/pages/inventory/index.js', 'utf8'),
    readFile('apps/miniprogram/pages/inventory/index.wxml', 'utf8'),
  ]);
  assert.match(script, /inventoryLoading: false/);
  assert.match(script, /requestId !== this\._inventoryRequestId/);
  assert.match(script, /inventoryLoading: true/);
  assert.match(template, /class="inventory-loading"/);
  assert.match(template, /庄豆豆正在整理豆仓/);
});
