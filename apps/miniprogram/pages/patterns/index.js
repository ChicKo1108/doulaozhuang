const { convertLocalImage } = require('../../utils/converter');
const api = require('../../utils/cloud-api');
const DEFAULT_GRID_SIZE = 32;
const DEFAULT_COLOR_LIMIT = 221;

Page({
  data: { isLoggedIn: false, loginError: '', sourcePath: '', isConverting: false, cells: [], usage: [], totalBeads: 0, actualColorCount: 0, recentPatterns: [], patternName: '', gridSize: DEFAULT_GRID_SIZE },
  async onShow() {
    const app = getApp(); const isLoggedIn = await app.login(); this.setData({ isLoggedIn, loginError: app.globalData.loginError });
    if (!isLoggedIn) return;
    try { const vaults = await api.listVaults(); const vaultId = app.globalData.activeVaultId || (vaults[0] && vaults[0].id); if (!vaultId) return; app.globalData.activeVaultId = vaultId; this.setData({ recentPatterns: (await api.getPatterns(vaultId)).slice(0, 5) }); } catch (error) { wx.showToast({ title: error.message || '读取图纸失败', icon: 'none' }); }
  },
  retryLogin() { this.onShow(); },
  async chooseImage() { try { const result = await wx.chooseMedia({ count: 1, mediaType: ['image'], sizeType: ['compressed'], sourceType: ['album', 'camera'] }); this.setData({ sourcePath: result.tempFiles[0].tempFilePath }); await this.convertImage(); } catch (error) { if (!(error.errMsg || '').includes('cancel')) wx.showToast({ title: '选择图片失败', icon: 'none' }); } },
  async convertImage() { if (!this.data.sourcePath || this.data.isConverting) return; this.setData({ isConverting: true }); try { const result = await convertLocalImage(this, this.data.sourcePath, DEFAULT_GRID_SIZE, DEFAULT_COLOR_LIMIT); this.setData({ cells: result.cells, usage: result.usage, totalBeads: result.totalBeads, actualColorCount: result.actualColorCount }); } catch (error) { wx.showToast({ title: error.message || '转换失败，请重试', icon: 'none' }); } finally { this.setData({ isConverting: false }); } },
  onNameInput(event) { this.setData({ patternName: event.detail.value }); },
  async saveCurrentPattern() {
    if (!this.data.cells.length) return wx.showToast({ title: '请先上传图片', icon: 'none' });
    const vaultId = getApp().globalData.activeVaultId; if (!vaultId) return wx.showToast({ title: '请先创建豆仓', icon: 'none' });
    try { await api.createPattern(vaultId, { name: this.data.patternName.trim() || `拼豆图纸 ${new Date().toLocaleDateString()}`, gridSize: DEFAULT_GRID_SIZE, colorLimit: DEFAULT_COLOR_LIMIT, totalBeads: this.data.totalBeads, colorCount: this.data.actualColorCount, usages: this.data.usage.map(({ code, quantity }) => ({ code, quantity })) }); this.setData({ recentPatterns: (await api.getPatterns(vaultId)).slice(0, 5), patternName: '' }); wx.showToast({ title: '图纸已保存', icon: 'success' }); } catch (error) { wx.showToast({ title: error.message || '保存失败', icon: 'none' }); }
  },
});
