const { request, upload, download } = require('./request');

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
const getPattern = (vaultId, patternId) => request({ url: `/vaults/${vaultId}/patterns/${patternId}` });
const updatePattern = (vaultId, patternId, data) => request({ url: `/vaults/${vaultId}/patterns/${patternId}`, method: 'PATCH', data });
const completePattern = (vaultId, patternId, inventoryVaultId) => request({ url: `/vaults/${vaultId}/patterns/${patternId}/complete`, method: 'POST', data: { inventoryVaultId } });
const createPattern = (vaultId, pattern) => request({ url: `/vaults/${vaultId}/patterns`, method: 'POST', data: pattern });
const analyzePattern = (vaultId, filePath, sourceType) => upload({ url: `/vaults/${vaultId}/pattern-conversions/analyze`, filePath, formData: { sourceType } });
const convertPattern = (vaultId, id, options) => request({ url: `/vaults/${vaultId}/pattern-conversions/${id}/convert`, method: 'POST', data: options });
const confirmPattern = (vaultId, id, name) => request({ url: `/vaults/${vaultId}/pattern-conversions/${id}/confirm`, method: 'POST', data: { name } });
const downloadPatternAsset = (url) => download(url);

module.exports = { listVaults, createVault, renameVault, deleteVault, getInventory, initializeKit, createInventoryItem, updateQuantity, getOperations, undoOperation, getPatterns, getPattern, updatePattern, completePattern, createPattern, analyzePattern, convertPattern, confirmPattern, downloadPatternAsset };
