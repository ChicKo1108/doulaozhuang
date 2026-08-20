import { Injectable } from '@nestjs/common';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface PaletteColor {
  code: string;
  name: string;
  hex: string;
  sortOrder: number;
}

export interface Palette {
  paletteVersion: string;
  colors: PaletteColor[];
}

@Injectable()
export class MardPaletteService {
  getPalette(): Palette {
    const configuredPath = process.env.MARD_PALETTE_FILE;
    const palettePath = configuredPath
      ? resolve(process.cwd(), configuredPath)
      : resolve(process.cwd(), '../../packages/mard-palette/data/mard-221.json');

    return JSON.parse(readFileSync(palettePath, 'utf8')) as Palette;
  }
}
