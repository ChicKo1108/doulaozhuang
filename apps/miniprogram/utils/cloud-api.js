const { request } = require('./request');

const listVaults = () => request({ url: '/vaults' });
const createVault = (name) => request({ url: '/vaults', method: 'POST', data: { name } });
const renameVault = (vaultId, name) => request({ url: `/vaults/${vaultId}`, method: 'PATCH', data: { name } });
const deleteVault = (vaultId) => request({ url: `/vaults/${vaultId}`, method: 'DELETE' });
const getInventory = (vaultId, sort) => request({ url: `/vaults/${vaultId}/inventory?sort=${sort}` });
const initializeKit = (vaultId, colorCount, quantity) => request({ url: `/vaults/${vaultId}/inventory/initialize-kit`, method: 'POST', data: { colorCount, quantity } });
const createInventoryItem = (vaultId, item) => request({ url: `/vaults/${vaultId}/inventory`, method: 'POST', data: item });
const updateQuantity = (vaultId, itemId, quantity) => request({ url: `/vaults/${vaultId}/inventory/${itemId}/quantity`, method: 'PATCH', data: { quantity } });
const getOperations = (vaultId, itemId) => request({ url: `/vaults/${vaultId}/inventory/${itemId}/operations` });
const undoOperation = (vaultId, operationId) => request({ url: `/vaults/${vaultId}/inventory/operations/${operationId}/undo`, method: 'POST' });
const getPatterns = (vaultId) => request({ url: `/vaults/${vaultId}/patterns` });
const createPattern = (vaultId, pattern) => request({ url: `/vaults/${vaultId}/patterns`, method: 'POST', data: pattern });

module.exports = { listVaults, createVault, renameVault, deleteVault, getInventory, initializeKit, createInventoryItem, updateQuantity, getOperations, undoOperation, getPatterns, createPattern };
