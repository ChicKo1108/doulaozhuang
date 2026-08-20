import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MardPaletteModule } from './mard-palette/mard-palette.module';

@Module({
  imports: [MardPaletteModule],
  controllers: [HealthController],
})
export class AppModule {}
