const { request, getToken, setToken, clearToken } = require('./request');

async function login() {
  const loginResult = await wx.login();
  if (!loginResult.code) throw new Error('未获取到微信登录凭据');
  const response = await request({ url: '/auth/wechat', method: 'POST', data: { code: loginResult.code }, withAuth: false });
  setToken(response.accessToken);
  return response;
}

async function ensureLogin() {
  if (getToken()) return true;
  await login();
  return true;
}

module.exports = { login, ensureLogin, getToken, clearToken };
