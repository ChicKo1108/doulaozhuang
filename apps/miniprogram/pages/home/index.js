const { getPatterns } = require('../../utils/storage');

function splitWaterfall(patterns) {
  return patterns.reduce(
    (columns, pattern, index) => {
      columns[index % 2].push(pattern);
      return columns;
    },
    [[], []],
  );
}

Page({
  data: {
    leftPatterns: [],
    rightPatterns: [],
    totalPatterns: 0,
  },

  onShow() {
    const patterns = getPatterns();
    const [leftPatterns, rightPatterns] = splitWaterfall(patterns);
    this.setData({ leftPatterns, rightPatterns, totalPatterns: patterns.length });
  },

  onPullDownRefresh() {
    this.onShow();
    wx.stopPullDownRefresh();
  },

  goToPatterns() {
    wx.switchTab({ url: '/pages/patterns/index' });
  },
});
