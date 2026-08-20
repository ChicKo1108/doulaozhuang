export type PatternSourceType = 'source_image' | 'existing_pattern_image';

export type PatternDetailPreset = 'clean' | 'balanced' | 'detail';
export type PatternConversionStatus = 'ANALYZED' | 'CONVERTED' | 'CONFIRMED' | 'FAILED';
export type PatternTargetWidth = 24 | 29 | 40 | 58 | 75;
export type PatternConversionErrorCode =
  | 'INVALID_IMAGE'
  | 'IMAGE_TOO_LARGE'
  | 'GRID_NOT_DETECTED'
  | 'CONVERSION_TIMEOUT'
  | 'INVALID_OPTIONS'
  | 'INVALID_RESULT'
  | 'CONVERSION_NOT_FOUND'
  | 'ALREADY_CONFIRMED';

export interface PatternSizeSuggestion {
  width: PatternTargetWidth;
  height: number;
  recommended: boolean;
  detailRetention: 'low' | 'medium' | 'high';
}

export interface PatternAnalyzeResult {
  sourceType: PatternSourceType;
  sourceWidth: number;
  sourceHeight: number;
  subjectRatio: number;
  complexity: number;
  pixelScale?: number;
  gridConfidence?: number;
  suggestions: PatternSizeSuggestion[];
}

export interface PatternConvertOptions {
  targetWidth: PatternTargetWidth;
  kitId: MardKitId;
  preset?: PatternDetailPreset;
  removeBackground?: boolean;
  mirror?: boolean;
}

export interface PatternCell {
  row: number;
  column: number;
  colorCode: string | null;
  hex: string | null;
}

export interface PatternUsage {
  code: string;
  hex: string;
  quantity: number;
}

export interface PatternConversionResult {
  width: number;
  height: number;
  cells: PatternCell[];
  usage: PatternUsage[];
  totalBeads: number;
  colorCount: number;
  mirror: boolean;
  algorithmVersion: string;
  previewUrl?: string;
  constructionUrl?: string;
}

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

export type InventorySort = 'code_asc' | 'code_desc' | 'quantity_asc' | 'quantity_desc';

export type ReplenishmentLevel = 'urgent' | 'suggested';

export interface InventoryItem {
  id?: string;
  brand: string;
  paletteName: string;
  code: string;
  hex: string;
  quantity: number;
}

export interface InventoryReplenishmentItem extends InventoryItem {
  replenishment: { id: ReplenishmentLevel; label: '急需补充' | '建议补充' };
}

export interface InventoryOverview {
  items: InventoryItem[];
  sort: InventorySort;
  replenishment: {
    total: number;
    urgentCount: number;
    suggestedCount: number;
    items: InventoryReplenishmentItem[];
  };
}

export interface VaultSummary {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  patternCount: number;
}

export type InventoryOperationType = 'INITIALIZE' | 'ADD_COLOR' | 'SET_QUANTITY' | 'UNDO';

export interface InventoryOperation {
  id: string;
  itemId: string;
  type: InventoryOperationType;
  before: number;
  after: number;
  delta: number;
  undoOfId?: string;
  createdAt: string;
}
