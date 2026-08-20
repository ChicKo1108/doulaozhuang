const { palette } = require('../../utils/palette');
const { getInventory, getVault, saveInventory, saveVault } = require('../../utils/storage');

const brands = ['MARD', '婆娑拼豆', 'COCO', '咪小窝', '其他'];
const paletteOptions = ['221 色', '291 色', '290 色', '自定义'];
const quickQuantities = [100, 500, 1000, 2000];

function colorOptionsForBrand(brand) {
  if (brand === 'MARD') return palette.map((item) => `${item.code} · ${item.hex}`);
  return ['自定义色号'];
}

Page({
  data: {
    brands,
    paletteOptions,
    quickQuantities,
    vault: null,
    inventory: [],
    showEditor: false,
    selectedBrandIndex: 0,
    selectedPaletteIndex: 0,
    selectedColorIndex: 0,
    colorOptions: colorOptionsForBrand('MARD'),
    isMard: true,
    customCode: '',
    quantity: 1000,
  },

  onShow() {
    this.setData({ vault: getVault(), inventory: getInventory() });
  },

  beginCreate() {
    this.setData({ showEditor: true });
  },

  closeEditor() {
    this.setData({ showEditor: false });
  },

  onBrandChange(event) {
    const selectedBrandIndex = Number(event.detail.value);
    const brand = brands[selectedBrandIndex];
    this.setData({
      selectedBrandIndex,
      selectedColorIndex: 0,
      colorOptions: colorOptionsForBrand(brand),
      isMard: brand === 'MARD',
      customCode: '',
    });
  },

  onPaletteChange(event) {
    this.setData({ selectedPaletteIndex: Number(event.detail.value) });
  },

  onColorChange(event) {
    this.setData({ selectedColorIndex: Number(event.detail.value) });
  },

  onCustomCodeInput(event) {
    this.setData({ customCode: event.detail.value.toUpperCase() });
  },

  onQuantityInput(event) {
    this.setData({ quantity: Number(event.detail.value) || '' });
  },

  selectQuickQuantity(event) {
    this.setData({ quantity: Number(event.currentTarget.dataset.quantity) });
  },

  saveBean() {
    const brand = brands[this.data.selectedBrandIndex];
    const paletteName = paletteOptions[this.data.selectedPaletteIndex];
    const quantity = Number.parseInt(this.data.quantity, 10);
    const selectedColor = this.data.colorOptions[this.data.selectedColorIndex] || '';
    const code = brand === 'MARD' ? selectedColor.split(' · ')[0] : this.data.customCode.trim();
    const hex = brand === 'MARD' ? selectedColor.split(' · ')[1] : '#D8D1C8';

    if (!code || !Number.isInteger(quantity) || quantity <= 0) {
      wx.showToast({ title: '请填写有效色号和数量', icon: 'none' });
      return;
    }

    const vault = this.data.vault || {
      id: `${Date.now()}`,
      name: '我的豆子库',
      createdAt: new Date().toISOString(),
    };
    const inventory = [...this.data.inventory];
    const existingIndex = inventory.findIndex(
      (item) => item.brand === brand && item.paletteName === paletteName && item.code === code,
    );
    if (existingIndex >= 0) {
      inventory[existingIndex] = {
        ...inventory[existingIndex],
        quantity: inventory[existingIndex].quantity + quantity,
      };
    } else {
      inventory.push({
        id: `${Date.now()}-${code}`,
        brand,
        paletteName,
        code,
        hex,
        quantity,
      });
    }
    inventory.sort((left, right) => `${left.brand}-${left.code}`.localeCompare(`${right.brand}-${right.code}`));
    saveVault(vault);
    saveInventory(inventory);
    this.setData({ vault, inventory, showEditor: false, quantity: 1000, customCode: '' });
    wx.showToast({ title: this.data.vault ? '已加入豆子库' : '豆子库创建成功', icon: 'success' });
  },
});
