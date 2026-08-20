import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('拼完确认弹窗要求选择豆仓并展示扣除数量', async () => {
  const [script, template] = await Promise.all([
    read('apps/miniprogram/pages/pattern-detail/index.js'),
    read('apps/miniprogram/pages/pattern-detail/index.wxml'),
  ]);

  assert.match(script, /showCompleteDialog:true/);
  assert.match(script, /selectedVaultId/);
  assert.match(script, /api\.completePattern\([\s\S]*?this\.data\.selectedVaultId/);
  assert.match(template, /确认扣除并完成/);
  assert.match(template, /pattern\.totalBeads/);
  assert.match(template, /wx:for="\{\{vaults\}\}"/);
});

test('拼完操作由后端事务扣库存并防止重复扣除', async () => {
  const service = await read('apps/api/src/patterns/patterns.service.ts');

  assert.match(service, /prisma\.\$transaction/);
  assert.match(service, /inventoryDeductedAt/);
  assert.match(service, /quantity: \{ decrement: usage\.quantity \}/);
  assert.match(service, /PATTERN_CONSUMPTION/);
  assert.match(service, /INSUFFICIENT_INVENTORY/);
  assert.match(service, /Serializable/);
});

test('普通状态更新不能绕过库存扣除直接标记已拼', async () => {
  const service = await read('apps/api/src/patterns/patterns.service.ts');
  assert.match(service, /dto\.status === 'COMPLETED'/);
  assert.match(service, /请通过“拼完了”确认并扣除库存/);
});
