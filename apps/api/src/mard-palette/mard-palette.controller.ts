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
}
