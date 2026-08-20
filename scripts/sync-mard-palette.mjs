import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const sourceUrl =
  'https://raw.githubusercontent.com/maxcleme/beadcolors/master/raw/mard.csv';
const seriesOrder = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'M'];

const response = await fetch(sourceUrl);
if (!response.ok) {
  throw new Error(`无法下载公开 Mard 色卡：${response.status}`);
}

const colors = (await response.text())
  .trim()
  .split('\n')
  .map((line) => line.split(','))
  .filter(([code]) => /^[A-HM]\d+$/.test(code))
  .map(([code, name, red, green, blue]) => ({
    code,
    name,
    hex: `#${[red, green, blue]
      .map((value) => Number(value).toString(16).padStart(2, '0'))
      .join('')}`.toUpperCase(),
    sortOrder:
      seriesOrder.indexOf(code[0]) * 100 + Number(code.slice(1)),
  }))
  .sort((left, right) => left.sortOrder - right.sortOrder);

if (colors.length !== 221) {
  throw new Error(`公开数据中未得到 221 个 Mard 基础色，当前为 ${colors.length}`);
}

const payload = {
  paletteVersion: 'mard-221',
  source: {
    name: 'maxcleme/beadcolors',
    url: 'https://github.com/maxcleme/beadcolors',
    license: 'MIT',
  },
  colors,
};

const targets = [
  'packages/mard-palette/data/mard-221.json',
  'apps/miniprogram/data/mard-221.json',
];

for (const target of targets) {
  const outputPath = resolve(target);
  await mkdir(resolve(outputPath, '..'), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`);
}

console.log(`已同步 Mard 221 色母色卡至 ${targets.length} 个目标文件。`);
