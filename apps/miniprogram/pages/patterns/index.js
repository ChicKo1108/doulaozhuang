const { convertLocalImage } = require('../../utils/converter');
const { getPatterns, savePattern } = require('../../utils/storage');

const DEFAULT_GRID_SIZE = 32;
const DEFAULT_COLOR_LIMIT = 221;

function persistFile(tempFilePath) {
  return new Promise((resolve) => {
    wx.saveFile({
      tempFilePath,
      success: ({ savedFilePath }) => resolve(savedFilePath),
      fail: () => resolve(tempFilePath),
    });
  });
}

Page({
  data: {
    sourcePath: '',
    isConverting: false,
    cells: [],
    usage: [],
    totalBeads: 0,
    actualColorCount: 0,
    recentPatterns: [],
    patternName: '',
    gridSize: DEFAULT_GRID_SIZE,
  },

  onShow() {
    this.setData({ recentPatterns: getPatterns().slice(0, 5) });
  },

  async chooseImage() {
    try {
      const result = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });
      this.setData({ sourcePath: result.tempFiles[0].tempFilePath });
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
        DEFAULT_GRID_SIZE,
        DEFAULT_COLOR_LIMIT,
      );
      this.setData({
        cells: result.cells,
        usage: result.usage,
        totalBeads: result.totalBeads,
        actualColorCount: result.actualColorCount,
      });
    } catch (error) {
      wx.showToast({ title: error.message || '转换失败，请重试', icon: 'none' });
    } finally {
      this.setData({ isConverting: false });
    }
  },

  onNameInput(event) {
    this.setData({ patternName: event.detail.value });
  },

  async saveCurrentPattern() {
    if (!this.data.cells.length) {
      wx.showToast({ title: '请先上传图片', icon: 'none' });
      return;
    }
    const createdAt = new Date();
    const coverPath = await persistFile(this.data.sourcePath);
    savePattern({
      id: `${createdAt.getTime()}`,
      name: this.data.patternName.trim() || `拼豆图纸 ${createdAt.toLocaleDateString()}`,
      coverPath,
      gridSize: DEFAULT_GRID_SIZE,
      colorLimit: DEFAULT_COLOR_LIMIT,
      totalBeads: this.data.totalBeads,
      colorCount: this.data.actualColorCount,
      createdAt: createdAt.toISOString(),
      usage: this.data.usage.map(({ code, quantity }) => ({ code, quantity })),
    });
    this.setData({
      recentPatterns: getPatterns().slice(0, 5),
      patternName: '',
    });
    wx.showToast({ title: '图纸已保存', icon: 'success' });
  },
});
