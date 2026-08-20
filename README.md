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
npm run prisma:generate --workspace=@doulaozhuang/api
npm run prisma:migrate --workspace=@doulaozhuang/api
npm run dev:api
```

在微信开发者工具中导入 `apps/miniprogram`，并将开发环境 API 地址配置为本地可访问的地址。

云端豆仓需要在 `.env` 中配置 PostgreSQL 的 `DATABASE_URL`、随机 `JWT_SECRET`，以及微信小程序的 `WECHAT_APP_ID`、`WECHAT_APP_SECRET`。小程序通过 `wx.login` 登录；正式发布前还需在微信公众平台配置 API 的合法请求域名。

## MVP 已实现能力

1. 选择照片或图片，在小程序本地缩放成 16、24、32、40 格图纸。
2. 按 24、48、72、96、120、221 色用色档位量化为 Mard 色号；默认 221 色。
3. 展示像素图纸、总颗数、每个色号的用量与库存缺口。
4. 将图纸用色直接加入本机豆子库，并保存最近 20 张图纸摘要。

MVP 的小档位使用图片主色在 Mard 221 母色卡中二次量化，不会超过选定色数；221 色使用完整母色卡。账号同步、云端库存流水和外部转换算法服务将作为下一阶段接入。

## Mard 221 色卡

仓库通过公开 MIT 许可的色卡数据同步 Mard 221 色母色卡；同步后仍应以实体豆与官方/商家色卡确认采购。运行：

```bash
npm run sync:mard-palette
npm run check:palette
```

校验要求：`colors` 必须刚好包含 221 项；每项必须具有唯一的 `code`、非空 `name` 与 `#RRGGBB` 格式的 `hex`。

色卡数据来源和许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
