# 豆老庄

豆老庄是一个微信小程序优先的拼豆库存与图纸管理工具。首期支持 Mard 24、48、72、96、120、221 色标准套装，默认 221 色；闭环为库存维护、上传图片转图纸、确认图纸、制作扣减与补豆。

## 项目结构

- `apps/miniprogram`：微信小程序原生 JavaScript 客户端。
- `apps/api`：NestJS API，负责登录、库存、图纸转换任务和业务事务。
- `packages/shared-types`：共享领域类型。
- `packages/mard-palette`：Mard 221 色母色卡、标准套装配置、校验器和正式数据存放位置。
- `docs`：PRD、开发说明与开发计划。

## 本地启动

```bash
npm install
cp .env.example .env
npm run dev:api
```

在微信开发者工具中导入 `apps/miniprogram`，并将开发环境 API 地址配置为本地可访问的地址。

## Mard 221 色卡

仓库不会使用猜测的 Mard 官方色号或颜色值。请将确认过的色卡数据写入 `packages/mard-palette/data/mard-221.json`，然后运行：

```bash
npm run check:palette
```

校验要求：`colors` 必须刚好包含 221 项；每项必须具有唯一的 `code`、非空 `name` 与 `#RRGGBB` 格式的 `hex`。
