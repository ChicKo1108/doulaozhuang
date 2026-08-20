import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VaultsModule } from '../vaults/vaults.module';
import { PatternsController } from './patterns.controller';
import { PatternsService } from './patterns.service';

@Module({ imports: [AuthModule, VaultsModule], controllers: [PatternsController], providers: [PatternsService] })
export class PatternsModule {}
