import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InventoryOperationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { VaultsService } from '../vaults/vaults.service';
import { CreateInventoryItemDto } from './dto/inventory.dto';
import { InventorySort } from './dto/inventory-overview.dto';
import { MardPaletteService } from '../mard-palette/mard-palette.service';

const REPLENISHMENT_THRESHOLD = 500;
const URGENT_THRESHOLD = 100;

function compareCodes(leftCode: string, rightCode: string) {
  const left = leftCode.match(/^([^0-9]*)([0-9]*)$/) ?? ['', leftCode, ''];
  const right = rightCode.match(/^([^0-9]*)([0-9]*)$/) ?? ['', rightCode, ''];
  return left[1].localeCompare(right[1]) || Number(left[2] || 0) - Number(right[2] || 0);
}

function sortItems<T extends { code: string; quantity: number }>(items: T[], sort: InventorySort) {
  return [...items].sort((left, right) => {
    if (sort === 'quantity_asc') return left.quantity - right.quantity || compareCodes(left.code, right.code);
    if (sort === 'quantity_desc') return right.quantity - left.quantity || compareCodes(left.code, right.code);
    return compareCodes(left.code, right.code) * (sort === 'code_desc' ? -1 : 1);
  });
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService, private readonly vaultsService: VaultsService, private readonly paletteService: MardPaletteService) {}

  getSortOptions() {
    return [
      { id: 'code_asc', label: '色号升序' }, { id: 'code_desc', label: '色号降序' },
      { id: 'quantity_asc', label: '余量升序' }, { id: 'quantity_desc', label: '余量降序' },
    ] satisfies { id: InventorySort; label: string }[];
  }

  async getOverview(userId: string, vaultId: string, sort: InventorySort) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    const items = sortItems(await this.prisma.inventoryItem.findMany({ where: { vaultId } }), sort);
    const replenishmentItems = items
      .filter((item) => item.quantity < REPLENISHMENT_THRESHOLD)
      .map((item) => ({ ...item, replenishment: item.quantity < URGENT_THRESHOLD ? { id: 'urgent', label: '急需补充' } : { id: 'suggested', label: '建议补充' } }));
    return { items, sort, replenishment: { total: replenishmentItems.length, urgentCount: replenishmentItems.filter((item) => item.replenishment.id === 'urgent').length, suggestedCount: replenishmentItems.filter((item) => item.replenishment.id === 'suggested').length, items: replenishmentItems } };
  }

  async createItem(userId: string, vaultId: string, dto: CreateInventoryItemDto) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    return this.prisma.$transaction(async (tx) => {
      const normalizedCode = dto.code.trim().toUpperCase();
      const exists = await tx.inventoryItem.findUnique({ where: { vaultId_brand_paletteName_code: { vaultId, brand: dto.brand.trim(), paletteName: dto.paletteName.trim(), code: normalizedCode } } });
      if (exists) throw new ConflictException('该颜色已在当前豆仓中');
      const item = await tx.inventoryItem.create({ data: { vaultId, ...dto, brand: dto.brand.trim(), paletteName: dto.paletteName.trim(), code: normalizedCode, hex: dto.hex.toUpperCase() } });
      await tx.inventoryOperation.create({ data: { itemId: item.id, type: InventoryOperationType.ADD_COLOR, before: 0, after: item.quantity, delta: item.quantity } });
      return item;
    });
  }

  async initializeKit(userId: string, vaultId: string, colorCount: number, quantity: number) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    const colors = this.paletteService.getPalette().colors.slice(0, colorCount);
    if (colors.length !== colorCount) throw new UnprocessableEntityException('色卡数量不足');
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.inventoryItem.count({ where: { vaultId } });
      if (existing > 0) throw new UnprocessableEntityException('豆仓已有颜色，不能重复初始化');
      const items = await Promise.all(colors.map((color) => tx.inventoryItem.create({ data: { vaultId, brand: 'MARD', paletteName: `${colorCount} 色`, code: color.code, hex: color.hex, quantity } })));
      await tx.inventoryOperation.createMany({ data: items.map((item) => ({ itemId: item.id, type: InventoryOperationType.INITIALIZE, before: 0, after: quantity, delta: quantity })) });
      return { initialized: items.length };
    });
  }

  async updateQuantity(userId: string, vaultId: string, itemId: string, quantity: number) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    return this.prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findFirst({ where: { id: itemId, vaultId } });
      if (!item) throw new NotFoundException('颜色库存不存在');
      if (item.quantity === quantity) return item;
      const updated = await tx.inventoryItem.update({ where: { id: itemId }, data: { quantity } });
      await tx.inventoryOperation.create({ data: { itemId, type: InventoryOperationType.SET_QUANTITY, before: item.quantity, after: quantity, delta: quantity - item.quantity } });
      return updated;
    });
  }

  async getOperations(userId: string, vaultId: string, itemId: string) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    const item = await this.prisma.inventoryItem.findFirst({ where: { id: itemId, vaultId } });
    if (!item) throw new NotFoundException('颜色库存不存在');
    return this.prisma.inventoryOperation.findMany({ where: { itemId }, include: { undoneBy: { select: { id: true } } }, orderBy: { createdAt: 'desc' }, take: 20 });
  }

  async undoOperation(userId: string, vaultId: string, operationId: string) {
    await this.vaultsService.getOwnedVault(userId, vaultId);
    return this.prisma.$transaction(async (tx) => {
      const operation = await tx.inventoryOperation.findFirst({ where: { id: operationId, item: { vaultId } }, include: { item: true, undoneBy: true } });
      if (!operation) throw new NotFoundException('操作记录不存在');
      if (operation.undoneBy || operation.type === InventoryOperationType.UNDO || operation.type === InventoryOperationType.PATTERN_CONSUMPTION) throw new UnprocessableEntityException('该操作已撤回或不可撤回');
      const targetQuantity = operation.item.quantity - operation.delta;
      if (targetQuantity < 0) throw new UnprocessableEntityException('撤回后库存不能小于 0');
      const item = await tx.inventoryItem.update({ where: { id: operation.itemId }, data: { quantity: targetQuantity } });
      const undo = await tx.inventoryOperation.create({ data: { itemId: operation.itemId, type: InventoryOperationType.UNDO, before: operation.item.quantity, after: targetQuantity, delta: -operation.delta, undoOfId: operation.id } });
      return { item, undo };
    });
  }
}
