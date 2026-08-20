const api = require('../../utils/cloud-api');

function splitWaterfall(patterns) { return patterns.reduce((columns, pattern, index) => { columns[index % 2].push(pattern); return columns; }, [[], []]); }
const statusLabel = { UNSTARTED: '未拼', IN_PROGRESS: '正在拼', COMPLETED: '已拼' };
async function withCovers(patterns) { return Promise.all(patterns.map(async (pattern) => ({ ...pattern, statusLabel: statusLabel[pattern.status] || '未拼', coverPath: pattern.previewUrl ? await api.downloadPatternAsset(pattern.previewUrl).catch(() => '') : '' }))); }

Page({
  data: { isLoggedIn: false, loginError: '', leftPatterns: [], rightPatterns: [], totalPatterns: 0 },
  async onShow() {
    const app = getApp(); const isLoggedIn = await app.login(); this.setData({ isLoggedIn, loginError: app.globalData.loginError });
    if (!isLoggedIn) return;
    try {
      const vaults = await api.listVaults(); const vaultId = app.globalData.activeVaultId || (vaults[0] && vaults[0].id);
      if (!vaultId) return this.setData({ leftPatterns: [], rightPatterns: [], totalPatterns: 0 });
      app.globalData.activeVaultId = vaultId;
      const patterns = await withCovers(await api.getPatterns(vaultId)); const [leftPatterns, rightPatterns] = splitWaterfall(patterns);
      this.setData({ leftPatterns, rightPatterns, totalPatterns: patterns.length });
    } catch (error) { wx.showToast({ title: error.message || '读取图纸失败', icon: 'none' }); }
  },
  onPullDownRefresh() { this.onShow().finally(() => wx.stopPullDownRefresh()); },
  retryLogin() { this.onShow(); },
  goToPatterns() { wx.switchTab({ url: '/pages/patterns/index' }); },
  openPattern(event) { wx.navigateTo({ url: `/pages/pattern-detail/index?id=${event.currentTarget.dataset.id}` }); },
});
