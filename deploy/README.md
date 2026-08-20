# 豆老庄生产部署（Ubuntu 24.04）

## 前置条件

- 一台 Ubuntu 24.04 LTS 腾讯云服务器。
- 一个已解析到服务器公网 IP 的域名，例如 `api.example.com`。
- 腾讯云安全组放行 TCP 22、80、443，以及 UDP 443。
- 微信小程序 AppSecret。

## 1. 安装 Docker Engine 与 Compose 插件

按 Docker 官方 Ubuntu 仓库安装，最终确认以下命令成功：

```bash
sudo systemctl enable --now docker
sudo docker run --rm hello-world
sudo docker compose version
```

不要安装旧版独立命令 `docker-compose`；本项目使用 `docker compose` 插件。

## 2. 获取代码和配置环境

```bash
git clone https://github.com/ChicKo1108/doulaozhuang.git
cd doulaozhuang
cp .env.production.example .env.production
```

编辑 `.env.production`：

- `API_DOMAIN`：只填写域名，不包含 `https://` 和路径。
- `POSTGRES_PASSWORD`：数据库强密码。
- `JWT_SECRET`：至少 32 字节随机字符串。
- `WECHAT_APP_ID`、`WECHAT_APP_SECRET`：微信小程序凭据。

可生成随机密钥：

```bash
openssl rand -base64 48
```

## 3. 检查并启动

```bash
sudo docker compose --env-file .env.production config
sudo docker compose --env-file .env.production up -d --build
sudo docker compose --env-file .env.production ps
sudo docker compose --env-file .env.production logs -f api caddy
```

Caddy 会为 `API_DOMAIN` 自动申请和续期 HTTPS 证书。验证：

```bash
curl https://你的域名/api/v1/health
```

预期返回：

```json
{"status":"ok","service":"doulaozhuang-api"}
```

## 4. 更新版本

```bash
git pull --ff-only
sudo docker compose --env-file .env.production up -d --build
sudo docker image prune -f
```

API 容器每次启动都会执行尚未应用的 Prisma migration。

## 5. 备份

数据库和图纸文件分别保存在 Docker 命名卷 `postgres-data` 和 `pattern-storage`。商业化前必须配置定时 PostgreSQL 备份，并将图纸文件备份到腾讯云 COS 或另一台机器。

不要提交 `.env.production`，不要在聊天、截图或日志中泄露 AppSecret、JWT 密钥和数据库密码。
