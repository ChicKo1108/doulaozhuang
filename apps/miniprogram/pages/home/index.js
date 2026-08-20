const { convertLocalImage } = require('../../utils/converter');
const { getInventory, getPatterns, saveInventory, savePattern } = require('../../utils/storage');

const colorLimits = [24, 48, 72, 96, 120, 221];
const gridSizes = [16, 24, 32, 40];

function createUsageItems(usage, inventory) {
  const stockByCode = new Map(inventory.map((item) => [item.code, item.quantity]));
  return usage.map((item) => {
    const stock = stockByCode.get(item.code) || 0;
    return {
      ...item,
      stock,
      shortage: Math.max(0, item.quantity - stock),
    };
  });
}

Page({
  data: {
    colorLimits,
    gridSizes,
    selectedColorLimitIndex: 5,
    selectedGridSizeIndex: 1,
    selectedColorLimit: 221,
    gridSize: 24,
    sourcePath: '',
    isConverting: false,
    cells: [],
    usageItems: [],
    totalBeads: 0,
    actualColorCount: 0,
    inventory: [],
    inventoryColorOptions: [],
    selectedInventoryColorIndex: 0,
    stockInput: '',
    savedPatterns: [],
  },

  onShow() {
    this.setData({
      inventory: getInventory(),
      savedPatterns: getPatterns(),
    });
    this.refreshUsageWithInventory();
  },

  onPullDownRefresh() {
    this.onShow();
    wx.stopPullDownRefresh();
  },

  async chooseImage() {
    try {
      const result = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      const sourcePath = result.tempFiles[0].tempFilePath;
      this.setData({ sourcePath });
      await this.convertImage();
    } catch (error) {
      if (error.errMsg && error.errMsg.includes('cancel')) return;
      wx.showToast({ title: '选择图片失败', icon: 'none' });
    }
  },

  async convertImage() {
    if (!this.data.sourcePath || this.data.isConverting) return;

    this.setData({ isConverting: true });
    try {
      const result = await convertLocalImage(
        this,
        this.data.sourcePath,
        this.data.gridSize,
        this.data.selectedColorLimit,
      );
      this.setData({
        cells: result.cells,
        totalBeads: result.totalBeads,
        actualColorCount: result.actualColorCount,
      });
      this.refreshUsageWithInventory(result.usage);
    } catch (error) {
      wx.showToast({ title: error.message || '转换失败，请重试', icon: 'none' });
    } finally {
      this.setData({ isConverting: false });
    }
  },

  onColorLimitChange(event) {
    const selectedColorLimitIndex = Number(event.detail.value);
    this.setData({
      selectedColorLimitIndex,
      selectedColorLimit: colorLimits[selectedColorLimitIndex],
    });
    this.convertImage();
  },

  onGridSizeChange(event) {
    const selectedGridSizeIndex = Number(event.detail.value);
    this.setData({
      selectedGridSizeIndex,
      gridSize: gridSizes[selectedGridSizeIndex],
    });
    this.convertImage();
  },

  onInventoryColorChange(event) {
    this.setData({ selectedInventoryColorIndex: Number(event.detail.value) });
  },

  onStockInput(event) {
    this.setData({ stockInput: event.detail.value });
  },

  addStock() {
    const selectedColor = this.data.usageItems[this.data.selectedInventoryColorIndex];
    const quantity = Number.parseInt(this.data.stockInput, 10);
    if (!selectedColor || !Number.isInteger(quantity) || quantity <= 0) {
      wx.showToast({ title: '请选择颜色并填写正整数', icon: 'none' });
      return;
    }

    const inventory = [...this.data.inventory];
    const currentIndex = inventory.findIndex((item) => item.code === selectedColor.code);
    if (currentIndex >= 0) {
      inventory[currentIndex] = {
        ...inventory[currentIndex],
        quantity: inventory[currentIndex].quantity + quantity,
      };
    } else {
      inventory.push({
        code: selectedColor.code,
        hex: selectedColor.hex,
        quantity,
      });
    }
    inventory.sort((left, right) => left.code.localeCompare(right.code));
    saveInventory(inventory);
    this.setData({ inventory, stockInput: '' });
    this.refreshUsageWithInventory();
    wx.showToast({ title: '已加入豆子库', icon: 'success' });
  },

  clearInventory() {
    saveInventory([]);
    this.setData({ inventory: [] });
    this.refreshUsageWithInventory();
  },

  refreshUsageWithInventory(rawUsage) {
    const usage = rawUsage || this.data.usageItems.map((item) => ({
      code: item.code,
      name: item.name,
      hex: item.hex,
      quantity: item.quantity,
    }));
    const usageItems = createUsageItems(usage, this.data.inventory);
    this.setData({
      usageItems,
      inventoryColorOptions: usageItems.map((item) => `${item.code} · ${item.quantity} 颗`),
      selectedInventoryColorIndex: 0,
    });
  },

  saveCurrentPattern() {
    if (!this.data.cells.length) {
      wx.showToast({ title: '请先上传并转换图片', icon: 'none' });
      return;
    }
    const createdAt = new Date();
    savePattern({
      id: `${createdAt.getTime()}`,
      name: `未命名图纸 ${createdAt.toLocaleDateString()}`,
      gridSize: this.data.gridSize,
      colorLimit: this.data.selectedColorLimit,
      totalBeads: this.data.totalBeads,
      colorCount: this.data.actualColorCount,
      createdAt: createdAt.toISOString(),
      usage: this.data.usageItems.map(({ code, quantity }) => ({ code, quantity })),
    });
    this.setData({ savedPatterns: getPatterns() });
    wx.showToast({ title: '图纸已保存', icon: 'success' });
  },
});
