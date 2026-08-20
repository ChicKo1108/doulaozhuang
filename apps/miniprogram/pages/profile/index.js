const api = require('../../utils/cloud-api');
const { clearToken } = require('../../utils/auth');

Page({
  data: { isLoggedIn: false, inventoryCount: 0, patternCount: 0, vaultName: '', vaultCount: 0 },
  async onShow() {
    const app = getApp(); const isLoggedIn = await app.login(); this.setData({ isLoggedIn });
    if (!isLoggedIn) return;
    try {
      const vaults = await api.listVaults(); const selected = vaults.find((vault) => vault.id === app.globalData.activeVaultId) || vaults[0];
      const overviews = await Promise.all(vaults.map((vault) => api.getInventory(vault.id, 'code_asc')));
      this.setData({ vaultCount: vaults.length, inventoryCount: overviews.reduce((sum, item) => sum + item.items.length, 0), patternCount: vaults.reduce((sum, vault) => sum + vault._count.patterns, 0), vaultName: selected ? selected.name : '尚未创建豆仓' });
    } catch (error) { wx.showToast({ title: error.message || '读取账户信息失败', icon: 'none' }); }
  },
  logout() { wx.showModal({ title: '退出登录', content: '退出后需重新微信登录才能查看云端豆仓。', success: ({ confirm }) => { if (!confirm) return; clearToken(); getApp().globalData.isLoggedIn = false; this.setData({ isLoggedIn: false }); } }); },
});
