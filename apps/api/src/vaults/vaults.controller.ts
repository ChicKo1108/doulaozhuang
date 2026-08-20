import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser, AuthenticatedUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateVaultDto, UpdateVaultDto } from './dto/vault.dto';
import { VaultsService } from './vaults.service';

@UseGuards(JwtAuthGuard)
@Controller('vaults')
export class VaultsController {
  constructor(private readonly vaultsService: VaultsService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) { return this.vaultsService.list(user.id); }

  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() body: CreateVaultDto) { return this.vaultsService.create(user.id, body.name); }

  @Patch(':vaultId')
  rename(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Body() body: UpdateVaultDto) { return this.vaultsService.rename(user.id, vaultId, body.name); }

  @Delete(':vaultId')
  delete(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string) { return this.vaultsService.delete(user.id, vaultId); }
}
