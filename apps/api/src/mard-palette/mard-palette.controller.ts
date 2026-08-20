import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { MardPaletteService } from './mard-palette.service';

@Controller('mard-colors')
export class MardPaletteController {
  constructor(private readonly paletteService: MardPaletteService) {}

  @Get()
  getColors() {
    const palette = this.paletteService.getPalette();

    if (palette.colors.length !== 221) {
      throw new ServiceUnavailableException({
        code: 'MARD_PALETTE_NOT_READY',
        message: 'Mard 221 色卡尚未导入，暂不可使用。',
      });
    }

    return palette;
  }

  @Get('kits')
  getStandardKits() {
    const kits = this.paletteService.getStandardKits();
    const expectedCounts = [24, 48, 72, 96, 120, 221];
    const isReady =
      kits.defaultKitId === 'mard-221' &&
      kits.kits.length === expectedCounts.length &&
      expectedCounts.every((count) =>
        kits.kits.some(
          (kit) =>
            kit.colorCount === count &&
            kit.selectionMode ===
              (count === 221 ? 'full-palette' : 'dominant-image-colors'),
        ),
      );

    if (!isReady) {
      throw new ServiceUnavailableException({
        code: 'MARD_STANDARD_KITS_NOT_READY',
        message: 'Mard 标准套装色号清单尚未导入，暂不可使用。',
      });
    }

    return kits;
  }
}
