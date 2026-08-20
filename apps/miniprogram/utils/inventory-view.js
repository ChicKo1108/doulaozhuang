const SORT_OPTIONS = [
  { id: 'code_asc', label: '色号升序' },
  { id: 'code_desc', label: '色号降序' },
  { id: 'quantity_asc', label: '余量升序' },
  { id: 'quantity_desc', label: '余量降序' },
];

function compareCodes(leftCode, rightCode) {
  const left = String(leftCode).match(/^([^0-9]*)([0-9]*)$/) || ['', String(leftCode), ''];
  const right = String(rightCode).match(/^([^0-9]*)([0-9]*)$/) || ['', String(rightCode), ''];
  const prefixComparison = left[1].localeCompare(right[1]);
  if (prefixComparison !== 0) return prefixComparison;
  return Number(left[2] || 0) - Number(right[2] || 0);
}

function getReplenishmentLevel(quantity) {
  if (quantity < 100) return { id: 'urgent', label: '急需补充', priority: 0 };
  if (quantity < 500) return { id: 'suggested', label: '建议补充', priority: 1 };
  return null;
}

function sortInventory(inventory, sortId) {
  const items = [...inventory];
  return items.sort((left, right) => {
    if (sortId === 'quantity_asc') return left.quantity - right.quantity || compareCodes(left.code, right.code);
    if (sortId === 'quantity_desc') return right.quantity - left.quantity || compareCodes(left.code, right.code);
    const direction = sortId === 'code_desc' ? -1 : 1;
    return compareCodes(left.code, right.code) * direction;
  });
}

function getReplenishmentItems(inventory) {
  return inventory
    .map((item) => ({ ...item, replenishment: getReplenishmentLevel(item.quantity) }))
    .filter((item) => item.replenishment)
    .sort((left, right) => left.replenishment.priority - right.replenishment.priority || left.quantity - right.quantity || compareCodes(left.code, right.code));
}

module.exports = { SORT_OPTIONS, compareCodes, getReplenishmentLevel, sortInventory, getReplenishmentItems };
