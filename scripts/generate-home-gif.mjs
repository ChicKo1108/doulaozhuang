import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const source = 'apps/miniprogram/assets/design-system/zhuangdoudou-crafting.png';
const framesDirectory = 'apps/miniprogram/assets/design-system/.home-gif-frames';
await mkdir(framesDirectory, { recursive: true });
const character = await sharp(source).resize(232, 232).png().toBuffer();

for (let index = 0; index < 24; index += 1) {
  const top = 12 + Math.round(5 * Math.sin((index / 24) * Math.PI * 2));
  const firstOpacity = index < 12 ? 1 : 0.45;
  const secondOpacity = index < 12 ? 0.45 : 1;
  const sparkle = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256">
    <circle cx="224" cy="48" r="7" fill="#F6B916" fill-opacity="${firstOpacity}" stroke="#71331F" stroke-width="2"/>
    <circle cx="205" cy="72" r="5" fill="#168C88" fill-opacity="${secondOpacity}" stroke="#71331F" stroke-width="2"/>
  </svg>`);

  await sharp({ create: { width: 256, height: 256, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: character, left: 12, top }, { input: sparkle, left: 0, top: 0 }])
    .png()
    .toFile(path.join(framesDirectory, `frame-${String(index).padStart(2, '0')}.png`));
}

console.log('Generated 24 transparent home animation frames.');
