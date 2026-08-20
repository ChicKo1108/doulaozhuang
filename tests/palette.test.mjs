import assert from 'node:assert/strict';
import test from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildPatternFromImageData, palette } = require('../apps/miniprogram/utils/palette.js');
const standardKits = require('../packages/mard-palette/data/mard-standard-kits.json');

function imageDataFromColors(colors) {
  const data = new Uint8ClampedArray(colors.flatMap((color) => [...color, 255]));
  return { data, width: colors.length, height: 1 };
}

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

test('图像量化不会超过所选用色档位，并正确统计总颗数', () => {
  const samples = palette.slice(0, 3);
  const result = buildPatternFromImageData(
    imageDataFromColors(samples.map((color) => [color.red, color.green, color.blue])),
    2,
  );

  assert.equal(result.totalBeads, 3);
  assert.equal(result.actualColorCount, 2);
  assert.equal(result.cells.length, 3);
  assert.equal(result.usage.reduce((total, item) => total + item.quantity, 0), 3);
});
