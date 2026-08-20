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
        reject(new Error(responseData.message || '服务请求失败'));
      },
      fail: () => reject(new Error('网络不可用，请检查连接后重试')),
    });
  });
}

module.exports = { request, getToken, setToken, clearToken };
