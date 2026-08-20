import { Body, Controller, Get, Param, Patch, Post, Res, StreamableFile, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { readFile } from 'node:fs/promises';
import { AuthenticatedUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompletePatternDto, CreatePatternDto, UpdatePatternDto } from './dto/pattern.dto';
import { PatternsService } from './patterns.service';

@UseGuards(JwtAuthGuard)
@Controller('vaults/:vaultId/patterns')
export class PatternsController {
  constructor(private readonly patternsService: PatternsService) {}
  @Get() list(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string) { return this.patternsService.list(user.id, vaultId); }
  @Post() create(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Body() body: CreatePatternDto) { return this.patternsService.create(user.id, vaultId, body); }
  @Get(':patternId') get(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Param('patternId') patternId: string) { return this.patternsService.get(user.id, vaultId, patternId); }
  @Patch(':patternId') update(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Param('patternId') patternId: string, @Body() body: UpdatePatternDto) { return this.patternsService.update(user.id, vaultId, patternId, body); }
  @Post(':patternId/complete') complete(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Param('patternId') patternId: string, @Body() body: CompletePatternDto) { return this.patternsService.complete(user.id, vaultId, patternId, body.inventoryVaultId); }
  @Get(':patternId/assets/:kind') async asset(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Param('patternId') patternId: string, @Param('kind') kind: string, @Res({ passthrough: true }) response: Response) { response.setHeader('Content-Type', 'image/png'); response.setHeader('Cache-Control', 'private, max-age=3600'); return new StreamableFile(await readFile(await this.patternsService.asset(user.id, vaultId, patternId, kind))); }
}
