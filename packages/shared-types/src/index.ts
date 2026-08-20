export type PatternSourceType = 'source_image' | 'existing_pattern_image';

export type PatternStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

export type MardKitId =
  | 'mard-24'
  | 'mard-48'
  | 'mard-72'
  | 'mard-96'
  | 'mard-120'
  | 'mard-221';

export interface MardColor {
  code: string;
  name: string;
  hex: string;
  sortOrder: number;
}

export interface MardPalette {
  paletteVersion: 'mard-221';
  colors: MardColor[];
}

export interface MardColorKit {
  id: MardKitId;
  name: string;
  colorCount: 24 | 48 | 72 | 96 | 120 | 221;
  selectionMode: 'dominant-image-colors' | 'full-palette';
  isDefault: boolean;
}
