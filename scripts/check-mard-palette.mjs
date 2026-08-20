import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const palettePath = resolve('packages/mard-palette/data/mard-221.json');
const palette = JSON.parse(await readFile(palettePath, 'utf8'));

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

console.log(`Mard 色卡校验通过：${palette.colors.length} 色，版本 ${palette.paletteVersion}`);
