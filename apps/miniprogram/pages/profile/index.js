const { getInventory, getPatterns, getVault, clearAllLocalData } = require('../../utils/storage');

Page({
  data: { inventoryCount: 0, patternCount: 0, vaultName: '' },

  onShow() {
    const vault = getVault();
    this.setData({
      inventoryCount: getInventory().length,
      patternCount: getPatterns().length,
      vaultName: vault ? vault.name : '尚未创建豆子库',
    });
  },

  clearData() {
    wx.showModal({
      title: '清除本地数据',
      content: '将清除本机图纸和豆子库，且无法恢复。',
      success: ({ confirm }) => {
        if (!confirm) return;
        clearAllLocalData();
        this.onShow();
        wx.showToast({ title: '本地数据已清除', icon: 'success' });
      },
    });
  },
});
