import { Module } from '@nestjs/common';
import { MardPaletteController } from './mard-palette.controller';
import { MardPaletteService } from './mard-palette.service';

@Module({
  controllers: [MardPaletteController],
  providers: [MardPaletteService],
  exports: [MardPaletteService],
})
export class MardPaletteModule {}
