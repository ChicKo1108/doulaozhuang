const { palette } = require('../../utils/palette');
const { SORT_OPTIONS } = require('../../utils/inventory-view');
const api = require('../../utils/cloud-api');

const ACTIVE_VAULT_KEY = 'doulaozhuang:active-vault-id:v1';
const VIEW_MODE_KEY = 'doulaozhuang:inventory-view-mode:v1';
const brands = ['MARD', '婆娑拼豆', 'COCO', '咪小窝', '其他'];
const paletteOptions = ['24 色', '48 色', '72 色', '96 色', '120 色', '221 色'];
const quickQuantities = [100, 500, 1000, 2000];

function colorOptionsForBrand(brand) { return brand === 'MARD' ? palette.map((item) => `${item.code} · ${item.hex}`) : ['自定义色号']; }
function formatOperation(operation) { return { ...operation, timeText: new Date(operation.createdAt).toLocaleString('zh-CN'), canUndo: !operation.undoneBy && operation.type !== 'UNDO' }; }

Page({
  data: {
    isLoggedIn: false, loginError: '', vaults: [], activeVault: null, inventory: [], replenishmentItems: [],
    sortOptions: SORT_OPTIONS.map((item) => item.label), sortIds: SORT_OPTIONS.map((item) => item.id), selectedSortIndex: 0,
    viewMode: 'detail', showVaultPanel: false, showVaultEditor: false, vaultEditorMode: 'create', vaultName: '',
    showItemEditor: false, selectedItem: null, itemQuantity: '', operations: [],
    showAddColor: false, brands, paletteOptions, quickQuantities, selectedBrandIndex: 0, selectedPaletteIndex: 5, selectedColorIndex: 0,
    colorOptions: colorOptionsForBrand('MARD'), isMard: true, customCode: '', quantity: 1000,
  },

  async onShow() { await this.ensureAuthenticated(); },

  async ensureAuthenticated() {
    const app = getApp();
    const isLoggedIn = await app.login();
    this.setData({ isLoggedIn, loginError: app.globalData.loginError });
    if (isLoggedIn) await this.loadVaults();
  },

  async loadVaults() {
    try {
      const vaults = await api.listVaults();
      const savedId = wx.getStorageSync(ACTIVE_VAULT_KEY);
      const activeVault = vaults.find((vault) => vault.id === savedId) || vaults[0] || null;
      this.setData({ vaults, activeVault, viewMode: wx.getStorageSync(VIEW_MODE_KEY) || 'detail' });
      getApp().globalData.activeVaultId = activeVault ? activeVault.id : '';
      if (activeVault) await this.refreshInventory();
    } catch (error) { this.showError(error); }
  },

  async refreshInventory() {
    if (!this.data.activeVault) return;
    try {
      const sort = this.data.sortIds[this.data.selectedSortIndex];
      const overview = await api.getInventory(this.data.activeVault.id, sort);
      this.setData({ inventory: overview.items, replenishmentItems: overview.replenishment.items });
    } catch (error) { this.showError(error); }
  },

  showError(error) { wx.showToast({ title: error.message || '操作失败，请重试', icon: 'none' }); },
  retryLogin() { this.ensureAuthenticated(); },
  openVaultPanel() { this.setData({ showVaultPanel: true }); },
  closeVaultPanel() { this.setData({ showVaultPanel: false }); },

  async selectVault(event) {
    const vaultId = event.currentTarget.dataset.id;
    const activeVault = this.data.vaults.find((vault) => vault.id === vaultId);
    if (!activeVault) return;
    wx.setStorageSync(ACTIVE_VAULT_KEY, vaultId);
    getApp().globalData.activeVaultId = vaultId;
    this.setData({ activeVault, showVaultPanel: false });
    await this.refreshInventory();
  },

  openCreateVault() { this.setData({ showVaultPanel: false, showVaultEditor: true, vaultEditorMode: 'create', vaultName: '', quantity: 1000, selectedPaletteIndex: 5 }); },
  openRenameVault() { this.setData({ showVaultPanel: false, showVaultEditor: true, vaultEditorMode: 'rename', vaultName: this.data.activeVault.name }); },
  closeVaultEditor() { this.setData({ showVaultEditor: false }); },
  onVaultNameInput(event) { this.setData({ vaultName: event.detail.value }); },

  async saveVault() {
    const name = this.data.vaultName.trim();
    if (!name) return wx.showToast({ title: '请输入豆仓名称', icon: 'none' });
    try {
      if (this.data.vaultEditorMode === 'rename') {
        await api.renameVault(this.data.activeVault.id, name);
      } else {
        const vault = await api.createVault(name);
        const count = Number.parseInt(paletteOptions[this.data.selectedPaletteIndex], 10);
        await api.initializeKit(vault.id, count, Number(this.data.quantity));
        wx.setStorageSync(ACTIVE_VAULT_KEY, vault.id);
      }
      this.setData({ showVaultEditor: false });
      await this.loadVaults();
    } catch (error) { this.showError(error); }
  },

  deleteCurrentVault() {
    wx.showModal({ title: '删除豆仓', content: `确定删除“${this.data.activeVault.name}”及全部库存和图纸吗？此操作不可恢复。`, success: async ({ confirm }) => {
      if (!confirm) return;
      try { await api.deleteVault(this.data.activeVault.id); wx.removeStorageSync(ACTIVE_VAULT_KEY); this.setData({ showVaultPanel: false, activeVault: null, inventory: [] }); await this.loadVaults(); } catch (error) { this.showError(error); }
    }});
  },

  onSortChange(event) { this.setData({ selectedSortIndex: Number(event.detail.value) }, () => this.refreshInventory()); },
  toggleViewMode() { const viewMode = this.data.viewMode === 'detail' ? 'compact' : 'detail'; wx.setStorageSync(VIEW_MODE_KEY, viewMode); this.setData({ viewMode }); },

  async openItemEditor(event) {
    const item = event.currentTarget.dataset.item;
    this.setData({ selectedItem: item, itemQuantity: item.quantity, showItemEditor: true, operations: [] });
    try { this.setData({ operations: (await api.getOperations(this.data.activeVault.id, item.id)).map(formatOperation) }); } catch (error) { this.showError(error); }
  },
  closeItemEditor() { this.setData({ showItemEditor: false, selectedItem: null, operations: [] }); },
  onItemQuantityInput(event) { this.setData({ itemQuantity: event.detail.value }); },
  changeItemQuantity(event) { const value = Math.max(0, Number(this.data.itemQuantity) + Number(event.currentTarget.dataset.delta)); this.setData({ itemQuantity: value }); },
  async saveItemQuantity() {
    const quantity = Number.parseInt(this.data.itemQuantity, 10);
    if (!Number.isInteger(quantity) || quantity < 0) return wx.showToast({ title: '请输入有效数量', icon: 'none' });
    try { await api.updateQuantity(this.data.activeVault.id, this.data.selectedItem.id, quantity); this.closeItemEditor(); await this.refreshInventory(); } catch (error) { this.showError(error); }
  },
  async undoOperation(event) { try { await api.undoOperation(this.data.activeVault.id, event.currentTarget.dataset.id); await this.openItemEditor({ currentTarget: { dataset: { item: this.data.selectedItem } } }); await this.refreshInventory(); } catch (error) { this.showError(error); } },

  openAddColor() { this.setData({ showVaultPanel: false, showAddColor: true, quantity: 1000 }); }, closeAddColor() { this.setData({ showAddColor: false }); },
  onBrandChange(event) { const selectedBrandIndex = Number(event.detail.value); const brand = brands[selectedBrandIndex]; this.setData({ selectedBrandIndex, selectedColorIndex: 0, colorOptions: colorOptionsForBrand(brand), isMard: brand === 'MARD', customCode: '' }); },
  onPaletteChange(event) { this.setData({ selectedPaletteIndex: Number(event.detail.value) }); }, onColorChange(event) { this.setData({ selectedColorIndex: Number(event.detail.value) }); }, onCustomCodeInput(event) { this.setData({ customCode: event.detail.value.toUpperCase() }); }, onQuantityInput(event) { this.setData({ quantity: Number(event.detail.value) || '' }); }, selectQuickQuantity(event) { this.setData({ quantity: Number(event.currentTarget.dataset.quantity) }); },
  async saveNewColor() {
    const brand = brands[this.data.selectedBrandIndex]; const selected = this.data.colorOptions[this.data.selectedColorIndex] || ''; const code = brand === 'MARD' ? selected.split(' · ')[0] : this.data.customCode.trim(); const hex = brand === 'MARD' ? selected.split(' · ')[1] : '#D8D1C8'; const quantity = Number.parseInt(this.data.quantity, 10);
    if (!code || !Number.isInteger(quantity) || quantity < 0) return wx.showToast({ title: '请填写有效色号和数量', icon: 'none' });
    try { await api.createInventoryItem(this.data.activeVault.id, { brand, paletteName: paletteOptions[this.data.selectedPaletteIndex], code, hex, quantity }); this.setData({ showAddColor: false }); await this.refreshInventory(); } catch (error) { this.showError(error); }
  },
});
