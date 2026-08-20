const paletteFile = require('../data/mard-221.json');

const palette = paletteFile.colors.map((color) => ({
  ...color,
  red: Number.parseInt(color.hex.slice(1, 3), 16),
  green: Number.parseInt(color.hex.slice(3, 5), 16),
  blue: Number.parseInt(color.hex.slice(5, 7), 16),
}));

function colorDistance(red, green, blue, color) {
  const redDifference = red - color.red;
  const greenDifference = green - color.green;
  const blueDifference = blue - color.blue;
  return redDifference * redDifference + greenDifference * greenDifference + blueDifference * blueDifference;
}

function nearestColor(red, green, blue, candidates = palette) {
  let result = candidates[0];
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const color of candidates) {
    const distance = colorDistance(red, green, blue, color);
    if (distance < shortestDistance) {
      result = color;
      shortestDistance = distance;
    }
  }

  return result;
}

function buildPatternFromImageData(imageData, colorLimit) {
  const pixelCount = imageData.width * imageData.height;
  const firstPass = [];
  const frequency = new Map();

  for (let index = 0; index < pixelCount; index += 1) {
    const offset = index * 4;
    const alpha = imageData.data[offset + 3];
    if (alpha < 32) {
      firstPass.push(null);
      continue;
    }

    const color = nearestColor(
      imageData.data[offset],
      imageData.data[offset + 1],
      imageData.data[offset + 2],
    );
    firstPass.push(color);
    frequency.set(color.code, (frequency.get(color.code) || 0) + 1);
  }

  const allowedCodes = new Set(
    [...frequency.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, Math.min(colorLimit, frequency.size))
      .map(([code]) => code),
  );
  const activePalette = palette.filter((color) => allowedCodes.has(color.code));
  const counts = new Map();
  const cells = [];

  for (let index = 0; index < pixelCount; index += 1) {
    const offset = index * 4;
    if (firstPass[index] === null) {
      cells.push({ code: '', hex: 'transparent' });
      continue;
    }

    const color = nearestColor(
      imageData.data[offset],
      imageData.data[offset + 1],
      imageData.data[offset + 2],
      activePalette,
    );
    cells.push({ code: color.code, hex: color.hex });
    counts.set(color.code, (counts.get(color.code) || 0) + 1);
  }

  const usage = [...counts.entries()]
    .map(([code, quantity]) => {
      const color = palette.find((item) => item.code === code);
      return { ...color, quantity };
    })
    .sort((left, right) => right.quantity - left.quantity);

  return {
    cells,
    usage,
    totalBeads: usage.reduce((sum, item) => sum + item.quantity, 0),
    actualColorCount: usage.length,
  };
}

module.exports = {
  buildPatternFromImageData,
  palette,
};
