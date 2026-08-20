const TOKEN_KEY = 'doulaozhuang:access-token:v1';

function getToken() { return wx.getStorageSync(TOKEN_KEY) || ''; }
function setToken(token) { wx.setStorageSync(TOKEN_KEY, token); }
function clearToken() { wx.removeStorageSync(TOKEN_KEY); }

function request({ url, method = 'GET', data, withAuth = true }) {
  const app = getApp();
  const token = getToken();
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiBaseUrl}${url}`,
      method,
      data,
      header: { ...(withAuth && token ? { Authorization: `Bearer ${token}` } : {}) },
      success: ({ statusCode, data: responseData }) => {
        if (statusCode >= 200 && statusCode < 300) return resolve(responseData);
        if (statusCode === 401) clearToken();
        const message = Array.isArray(responseData.message) ? responseData.message.join('；') : responseData.message;
        const error = new Error(message || '服务请求失败');
        error.code = responseData.code;
        error.data = responseData;
        error.statusCode = statusCode;
        reject(error);
      },
      fail: () => reject(new Error('网络不可用，请检查连接后重试')),
    });
  });
}

function upload({ url, filePath, formData }) {
  const app = getApp(); const token = getToken();
  return new Promise((resolve, reject) => wx.uploadFile({
    url: `${app.globalData.apiBaseUrl}${url}`, filePath, name: 'file', formData,
    header: token ? { Authorization: `Bearer ${token}` } : {},
    success: ({ statusCode, data }) => { let body; try { body = JSON.parse(data); } catch (_) { body = {}; } if (statusCode >= 200 && statusCode < 300) resolve(body); else reject(new Error(body.message || '图片分析失败')); },
    fail: () => reject(new Error('上传失败，请检查网络后重试')),
  }));
}

function download(url) {
  const app = getApp(); const token = getToken();
  return new Promise((resolve, reject) => wx.downloadFile({ url: `${app.globalData.apiBaseUrl}${url}`, header: token ? { Authorization: `Bearer ${token}` } : {}, success: r => r.statusCode === 200 ? resolve(r.tempFilePath) : reject(new Error('图纸下载失败')), fail: () => reject(new Error('图纸下载失败')) }));
}

module.exports = { request, upload, download, getToken, setToken, clearToken };
