const paletteFile = require('../data/mard-221');

const palette = paletteFile.colors;
const getColorByCode = (code) => palette.find((color) => color.code === code);

module.exports = {
  getColorByCode,
  palette,
};
