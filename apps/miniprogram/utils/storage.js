const INVENTORY_KEY = 'doulaozhuang:inventory:v1';
const PATTERNS_KEY = 'doulaozhuang:patterns:v1';
const VAULT_KEY = 'doulaozhuang:vault:v1';

function getInventory() {
  const inventory = wx.getStorageSync(INVENTORY_KEY) || [];
  return inventory.map((item) => ({
    ...item,
    id: item.id || `${item.brand || 'MARD'}-${item.code}`,
    brand: item.brand || 'MARD',
    paletteName: item.paletteName || '221 色',
  }));
}

function saveInventory(inventory) {
  wx.setStorageSync(INVENTORY_KEY, inventory);
}

function getPatterns() {
  return wx.getStorageSync(PATTERNS_KEY) || [];
}

function savePattern(pattern) {
  const patterns = getPatterns();
  patterns.unshift(pattern);
  wx.setStorageSync(PATTERNS_KEY, patterns.slice(0, 20));
}

function getVault() {
  return wx.getStorageSync(VAULT_KEY) || null;
}

function saveVault(vault) {
  wx.setStorageSync(VAULT_KEY, vault);
}

function clearAllLocalData() {
  wx.removeStorageSync(INVENTORY_KEY);
  wx.removeStorageSync(PATTERNS_KEY);
  wx.removeStorageSync(VAULT_KEY);
}

module.exports = {
  getInventory,
  getPatterns,
  saveInventory,
  savePattern,
  getVault,
  saveVault,
  clearAllLocalData,
};
