import { Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { AuthModule } from '../auth/auth.module';
import { VaultsModule } from '../vaults/vaults.module';
import { MardPaletteModule } from '../mard-palette/mard-palette.module';

@Module({
  imports: [AuthModule, VaultsModule, MardPaletteModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
