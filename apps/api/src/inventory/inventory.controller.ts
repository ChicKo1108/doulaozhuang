import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { AuthenticatedUser, CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateInventoryItemDto, InitializeInventoryKitDto, InventoryQueryDto, UpdateInventoryQuantityDto } from './dto/inventory.dto';
import { InventoryService } from './inventory.service';

@UseGuards(JwtAuthGuard)
@Controller('vaults/:vaultId/inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
  @Get() getOverview(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Query() query: InventoryQueryDto) { return this.inventoryService.getOverview(user.id, vaultId, query.sort); }
  @Post() createItem(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Body() body: CreateInventoryItemDto) { return this.inventoryService.createItem(user.id, vaultId, body); }
  @Post('initialize-kit') initializeKit(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Body() body: InitializeInventoryKitDto) { return this.inventoryService.initializeKit(user.id, vaultId, body.colorCount, body.quantity); }
  @Patch(':itemId/quantity') updateQuantity(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Param('itemId') itemId: string, @Body() body: UpdateInventoryQuantityDto) { return this.inventoryService.updateQuantity(user.id, vaultId, itemId, body.quantity); }
  @Get(':itemId/operations') getOperations(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Param('itemId') itemId: string) { return this.inventoryService.getOperations(user.id, vaultId, itemId); }
  @Post('operations/:operationId/undo') undo(@CurrentUser() user: AuthenticatedUser, @Param('vaultId') vaultId: string, @Param('operationId') operationId: string) { return this.inventoryService.undoOperation(user.id, vaultId, operationId); }
}
