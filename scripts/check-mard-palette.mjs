import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const palettePath = resolve('packages/mard-palette/data/mard-221.json');
const palette = JSON.parse(await readFile(palettePath, 'utf8'));
const kitsPath = resolve('packages/mard-palette/data/mard-standard-kits.json');
const standardKits = JSON.parse(await readFile(kitsPath, 'utf8'));

if (palette.paletteVersion !== 'mard-221') {
  throw new Error('paletteVersion 必须为 mard-221');
}

if (!Array.isArray(palette.colors) || palette.colors.length !== 221) {
  throw new Error(`Mard 色卡必须包含 221 项，当前为 ${palette.colors?.length ?? 0} 项`);
}

const codes = new Set();
for (const color of palette.colors) {
  if (!color.code || !color.name || !/^#[0-9A-Fa-f]{6}$/.test(color.hex ?? '')) {
    throw new Error(`存在无效色卡项：${JSON.stringify(color)}`);
  }
  if (codes.has(color.code)) {
    throw new Error(`存在重复 Mard 色号：${color.code}`);
  }
  codes.add(color.code);
}

const expectedCounts = [24, 48, 72, 96, 120, 221];
if (
  standardKits.paletteVersion !== 'mard-221' ||
  standardKits.defaultKitId !== 'mard-221' ||
  !Array.isArray(standardKits.kits) ||
  standardKits.kits.length !== expectedCounts.length
) {
  throw new Error('标准套装配置必须包含 24/48/72/96/120/221 色，默认套装为 mard-221');
}

for (const colorCount of expectedCounts) {
  const kit = standardKits.kits.find((item) => item.colorCount === colorCount);
  if (!kit || kit.colorCodes.length !== colorCount) {
    throw new Error(`Mard ${colorCount} 色套装缺少准确的色号清单`);
  }
  for (const code of kit.colorCodes) {
    if (!codes.has(code)) {
      throw new Error(`Mard ${colorCount} 色套装包含母色卡外色号：${code}`);
    }
  }
}

console.log(`Mard 色卡与 6 种标准套装校验通过：${palette.colors.length} 色，版本 ${palette.paletteVersion}`);
