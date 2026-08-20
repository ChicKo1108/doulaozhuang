import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { getColorByCode, palette } = require('../apps/miniprogram/utils/palette.js');
const standardKits = require('../packages/mard-palette/data/mard-standard-kits.json');

test('Mard 母色卡包含 221 个唯一色号', () => {
  assert.equal(palette.length, 221);
  assert.equal(new Set(palette.map((color) => color.code)).size, 221);
});

test('标准用色档位完整且默认 221 色', () => {
  assert.equal(standardKits.defaultKitId, 'mard-221');
  assert.deepEqual(
    standardKits.kits.map((kit) => kit.colorCount),
    [24, 48, 72, 96, 120, 221],
  );
});

test('小程序色卡模块只负责按色号查询，不执行本地量化', () => {
  const first = palette[0];
  assert.deepEqual(getColorByCode(first.code), first);
  assert.equal(require('../apps/miniprogram/utils/palette.js').buildPatternFromImageData, undefined);
});
