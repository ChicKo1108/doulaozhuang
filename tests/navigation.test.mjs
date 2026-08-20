import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('小程序底部导航包含首页、图纸库、豆仓和个人中心', async () => {
  const appConfig = JSON.parse(await readFile('apps/miniprogram/app.json', 'utf8'));
  assert.deepEqual(
    appConfig.tabBar.list.map((item) => item.pagePath),
    [
      'pages/home/index',
      'pages/patterns/index',
      'pages/inventory/index',
      'pages/profile/index',
    ],
  );
  assert.deepEqual(appConfig.tabBar.list.map((item) => item.text), ['首页', '图纸库', '豆仓', '个人中心']);
});
