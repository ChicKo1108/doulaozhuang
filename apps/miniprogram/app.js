const { ensureLogin, clearToken } = require('./utils/auth');

App({
  globalData: {
    apiBaseUrl: 'http://localhost:3000/api/v1',
    isLoggedIn: false,
    loginError: '',
  },
  onLaunch() { this.login(); },
  async login() {
    try {
      await ensureLogin();
      this.globalData.isLoggedIn = true;
      this.globalData.loginError = '';
      return true;
    } catch (error) {
      clearToken();
      this.globalData.isLoggedIn = false;
      this.globalData.loginError = error.message || '登录失败';
      return false;
    }
  },
});
