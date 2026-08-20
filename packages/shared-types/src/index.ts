export type PatternSourceType = 'source_image' | 'existing_pattern_image';

export type PatternStatus = 'pending' | 'in_progress' | 'completed' | 'archived';

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
