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

export interface MardColorKit {
  id: string;
  name: string;
  colorCount: number;
  colorCodes: string[];
}

export interface StandardKits {
  paletteVersion: string;
  defaultKitId: string;
  kits: MardColorKit[];
}

@Injectable()
export class MardPaletteService {
  getPalette(): Palette {
    return this.readJson<Palette>('mard-221.json');
  }

  getStandardKits(): StandardKits {
    return this.readJson<StandardKits>('mard-standard-kits.json');
  }

  private readJson<T>(fileName: string): T {
    const configuredPath = process.env.MARD_PALETTE_FILE;
    const palettePath =
      fileName === 'mard-221.json' && configuredPath
        ? resolve(process.cwd(), configuredPath)
        : resolve(process.cwd(), `../../packages/mard-palette/data/${fileName}`);

    return JSON.parse(readFileSync(palettePath, 'utf8')) as T;
  }
}
