import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VaultsService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: string) {
    return this.prisma.vault.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { items: true, patterns: true } } },
    });
  }

  create(userId: string, name: string) {
    return this.prisma.vault.create({ data: { userId, name: name.trim() } });
  }

  async rename(userId: string, vaultId: string, name: string) {
    await this.getOwnedVault(userId, vaultId);
    return this.prisma.vault.update({ where: { id: vaultId }, data: { name: name.trim() } });
  }

  async delete(userId: string, vaultId: string) {
    await this.getOwnedVault(userId, vaultId);
    await this.prisma.vault.delete({ where: { id: vaultId } });
    return { id: vaultId, deleted: true };
  }

  async getOwnedVault(userId: string, vaultId: string) {
    const vault = await this.prisma.vault.findFirst({ where: { id: vaultId, userId } });
    if (!vault) throw new NotFoundException('豆仓不存在或无权访问');
    return vault;
  }
}
