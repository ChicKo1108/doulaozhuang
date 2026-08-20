const INVENTORY_KEY = 'doulaozhuang:inventory:v1';
const PATTERNS_KEY = 'doulaozhuang:patterns:v1';

function getInventory() {
  return wx.getStorageSync(INVENTORY_KEY) || [];
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

module.exports = {
  getInventory,
  getPatterns,
  saveInventory,
  savePattern,
};
