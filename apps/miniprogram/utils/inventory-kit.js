const { palette } = require('./palette');

function createInventoryForKit(colorCount, quantity, vaultId) {
  const parsedColorCount = Number.parseInt(colorCount, 10);
  const parsedQuantity = Number.parseInt(quantity, 10);

  if (!Number.isInteger(parsedColorCount) || parsedColorCount <= 0 || parsedColorCount > palette.length) {
    throw new Error('请选择有效的色数套装');
  }
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error('请填写有效的每色数量');
  }

  const paletteName = `${parsedColorCount} 色`;
  return palette.slice(0, parsedColorCount).map((color) => ({
    id: `${vaultId}-${color.code}`,
    brand: 'MARD',
    paletteName,
    code: color.code,
    hex: color.hex,
    quantity: parsedQuantity,
  }));
}

module.exports = { createInventoryForKit };
