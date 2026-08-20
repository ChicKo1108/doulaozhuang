import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InventoryOperationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VaultsService } from '../vaults/vaults.service';
import { CreatePatternDto, UpdatePatternDto } from './dto/pattern.dto';

@Injectable()
export class PatternsService {
  constructor(private readonly prisma: PrismaService, private readonly vaultsService: VaultsService) {}
  async list(userId: string, vaultId: string) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    const patterns = await this.prisma.pattern.findMany({ where: { vaultId }, include: { usages: true }, orderBy: { createdAt: 'desc' }, take: 50 });
    return patterns.map((pattern) => this.present(pattern, vaultId));
  }
  async get(userId: string, vaultId: string, patternId: string) { await this.vaultsService.getOwnedVault(userId, vaultId); const pattern = await this.prisma.pattern.findFirst({ where: { id: patternId, vaultId }, include: { usages: true } }); if (!pattern) throw new NotFoundException('图纸不存在或无权访问'); return this.present(pattern, vaultId); }
  async update(userId: string, vaultId: string, patternId: string, dto: UpdatePatternDto) { await this.get(userId, vaultId, patternId); if (dto.name !== undefined && !dto.name.trim()) throw new BadRequestException('图纸名称不能为空'); if (dto.status === 'COMPLETED') throw new BadRequestException('请通过“拼完了”确认并扣除库存'); const pattern = await this.prisma.pattern.update({ where: { id: patternId }, data: { ...(dto.name !== undefined ? { name: dto.name.trim() } : {}), ...(dto.status ? { status: dto.status } : {}) }, include: { usages: true } }); return this.present(pattern, vaultId); }
  async complete(userId: string, vaultId: string, patternId: string, inventoryVaultId: string) {
    await this.vaultsService.getOwnedVault(userId, vaultId); await this.vaultsService.getOwnedVault(userId, inventoryVaultId);
    return this.prisma.$transaction(async (tx) => {
      const pattern = await tx.pattern.findFirst({ where: { id: patternId, vaultId }, include: { usages: true } });
      if (!pattern) throw new NotFoundException('图纸不存在或无权访问');
      if (pattern.inventoryDeductedAt) { const current = pattern.status === 'COMPLETED' ? pattern : await tx.pattern.update({ where: { id: pattern.id }, data: { status: 'COMPLETED' }, include: { usages: true } }); return { pattern: this.present(current, vaultId), deducted: false, alreadyDeducted: true }; }
      const codes = pattern.usages.map((usage) => usage.code), items = await tx.inventoryItem.findMany({ where: { vaultId: inventoryVaultId, brand: 'MARD', code: { in: codes } }, orderBy: { quantity: 'desc' } }), byCode = new Map<string, typeof items[number]>();
      for (const item of items) if (!byCode.has(item.code)) byCode.set(item.code, item);
      const shortages = pattern.usages.flatMap((usage) => { const item = byCode.get(usage.code), available = item?.quantity ?? 0; return available < usage.quantity ? [{ code: usage.code, required: usage.quantity, available, missing: usage.quantity - available }] : []; });
      if (shortages.length) throw new UnprocessableEntityException({ code: 'INSUFFICIENT_INVENTORY', message: `库存不足：${shortages.slice(0, 5).map((item) => `${item.code} 缺 ${item.missing} 颗`).join('、')}${shortages.length > 5 ? `等 ${shortages.length} 个色号` : ''}`, shortages });
      for (const usage of pattern.usages) { const item = byCode.get(usage.code)!; const updated = await tx.inventoryItem.updateMany({ where: { id: item.id, quantity: { gte: usage.quantity } }, data: { quantity: { decrement: usage.quantity } } }); if (updated.count !== 1) throw new UnprocessableEntityException({ code: 'INVENTORY_CHANGED', message: '库存刚刚发生变化，请重新确认' }); await tx.inventoryOperation.create({ data: { itemId: item.id, type: InventoryOperationType.PATTERN_CONSUMPTION, before: item.quantity, after: item.quantity - usage.quantity, delta: -usage.quantity } }); }
      const completed = await tx.pattern.update({ where: { id: pattern.id }, data: { status: 'COMPLETED', inventoryDeductedAt: new Date(), inventoryVaultId }, include: { usages: true } });
      return { pattern: this.present(completed, vaultId), deducted: true, alreadyDeducted: false };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
  async asset(userId: string, vaultId: string, patternId: string, kind: string) { const pattern = await this.get(userId, vaultId, patternId) as any; const source = await this.prisma.pattern.findUnique({ where: { id: patternId } }); const path = kind === 'preview' ? source?.previewPath : kind === 'construction' ? source?.constructionPath : null; if (!path) throw new NotFoundException('图纸图片不存在'); return path; }
  private present(pattern: any, vaultId: string) { return { ...pattern, previewPath: undefined, constructionPath: undefined, sourcePath: undefined, previewUrl: pattern.previewPath ? `/vaults/${vaultId}/patterns/${pattern.id}/assets/preview` : null, constructionUrl: pattern.constructionPath ? `/vaults/${vaultId}/patterns/${pattern.id}/assets/construction` : null }; }
  async create(userId: string, vaultId: string, dto: CreatePatternDto) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    return this.prisma.pattern.create({ data: { vaultId, name: dto.name.trim(), gridSize: dto.gridSize, colorLimit: dto.colorLimit, totalBeads: dto.totalBeads, colorCount: dto.colorCount, sourcePath: dto.sourcePath, usages: { create: dto.usages } }, include: { usages: true } });
  }
}
