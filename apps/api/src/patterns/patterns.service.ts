import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VaultsService } from '../vaults/vaults.service';
import { CreatePatternDto } from './dto/pattern.dto';

@Injectable()
export class PatternsService {
  constructor(private readonly prisma: PrismaService, private readonly vaultsService: VaultsService) {}
  async list(userId: string, vaultId: string) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    return this.prisma.pattern.findMany({ where: { vaultId }, include: { usages: true }, orderBy: { createdAt: 'desc' }, take: 20 });
  }
  async create(userId: string, vaultId: string, dto: CreatePatternDto) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    return this.prisma.pattern.create({ data: { vaultId, name: dto.name.trim(), gridSize: dto.gridSize, colorLimit: dto.colorLimit, totalBeads: dto.totalBeads, colorCount: dto.colorCount, sourcePath: dto.sourcePath, usages: { create: dto.usages } }, include: { usages: true } });
  }
}
