import { Module } from '@nestjs/common';
import { HealthController } from './health/health.controller';
import { MardPaletteModule } from './mard-palette/mard-palette.module';
import { InventoryModule } from './inventory/inventory.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { VaultsModule } from './vaults/vaults.module';
import { PatternsModule } from './patterns/patterns.module';
import { PatternConversionsModule } from './pattern-conversions/pattern-conversions.module';

@Module({
  imports: [PrismaModule, AuthModule, MardPaletteModule, VaultsModule, InventoryModule, PatternsModule, PatternConversionsModule],
  controllers: [HealthController],
})
export class AppModule {}
