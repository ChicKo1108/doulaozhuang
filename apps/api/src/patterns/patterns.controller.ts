import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreatePatternDto } from './dto/pattern.dto';
import { PatternsService } from './patterns.service';

@UseGuards(JwtAuthGuard)
@Controller('vaults/:vaultId/patterns')
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string) { return this.patternsService.list(user.id, vaultId); }
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Body() body: CreatePatternDto) { return this.patternsService.create(user.id, vaultId, body); }
}
