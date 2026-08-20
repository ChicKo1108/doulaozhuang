const { buildPatternFromImageData } = require('./palette');

function getCanvas(page) {
  return new Promise((resolve, reject) => {
    wx.createSelectorQuery()
      .in(page)
      .select('#conversionCanvas')
      .fields({ node: true, size: true })
      .exec((result) => {
        const canvasInfo = result[0];
        if (!canvasInfo || !canvasInfo.node) {
          reject(new Error('画布未准备完成，请稍后再试。'));
          return;
        }
        resolve(canvasInfo.node);
      });
  });
}

function loadImage(canvas, sourcePath) {
  return new Promise((resolve, reject) => {
    const image = canvas.createImage();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('图片读取失败，请换一张图片重试。'));
    image.src = sourcePath;
  });
}

async function convertLocalImage(page, sourcePath, gridSize, colorLimit) {
  const canvas = await getCanvas(page);
  const context = canvas.getContext('2d');
  const image = await loadImage(canvas, sourcePath);

  canvas.width = gridSize;
  canvas.height = gridSize;
  context.clearRect(0, 0, gridSize, gridSize);

  const scale = Math.max(gridSize / image.width, gridSize / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  context.drawImage(image, (gridSize - width) / 2, (gridSize - height) / 2, width, height);

  const imageData = context.getImageData(0, 0, gridSize, gridSize);
  return {
    ...buildPatternFromImageData(imageData, colorLimit),
    gridSize,
  };
}

module.exports = { convertLocalImage };
