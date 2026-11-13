# 一餐 · yican

微信小程序「一餐」——家庭菜单与膳食管理应用。

- **前端**：uni-app (Vue 3 + TypeScript + Vite)，构建到微信小程序（包体约 435KB，上限 2MB）
- **后端**：Node.js + tsx 单文件服务，SQLite 持久化，可选 Docker 部署
- **内容**：内置 HowToCook 官方教程菜谱库（369 道）

## 功能

- 菜单（menu）、菜谱库（library）、采购清单（cart）、日志（journal）、库存（stock）、评价（reviews）、账户（account）
- 注册 / 登录会话、多端状态同步
- 主题与样式体系（themes / polish / form-controls，apply-shared 隔离）
- Lucide 图标管线（svg → 字体 + 组件包装）
- 后端 REST API（鉴权、状态同步、命令、静态图片服务）、健康检查

## 目录结构

```
├── src/            # uni-app 前端源码（pages / components / 主题与图标）
├── server/         # Node 后端（index.ts 入口，schema.sql 建表）
├── content/        # HowToCook 菜谱内容库
├── public/         # 静态资源（images 等）
├── scripts/        # 构建与辅助脚本（图标、隔离、校验）
├── data/           # 本地 SQLite 数据（已 gitignore）
├── dist/           # 构建产物（已 gitignore）
├── Dockerfile      # 后端容器化部署
└── 部署手册.md      # 小程序上线 + 后端部署完整步骤
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动后端

```bash
npx tsx server/index.ts
```

- 服务地址：<http://127.0.0.1:3000>
- 数据库：`data/kitchen.sqlite`（首次启动自动创建）
- 健康检查：`GET /api/health` → `{"ok":true,...}`

### 3. 启动前端开发

```bash
# 微信小程序（开发者工具导入 dist/build/mp-weixin 前先构建）
npm run dev:mp-weixin

# H5 网页版
npm run dev:h5
```

前端 API 地址在 `src/config.ts` 中配置，默认 `http://127.0.0.1:3000`；真机调试改为局域网 IP。

## 构建与发布

```bash
# 构建微信小程序包 → dist/build/mp-weixin
npm run build:mp-weixin

# 类型检查
npm run type-check
```

小程序后台申请 AppID 后填入 `src/manifest.json` 的 `mp-weixin.appid`，用微信开发者工具导入 `dist/build/mp-weixin` 上传即可。

服务器部署（HTTPS、Docker、反向代理）详见 [部署手册.md](./部署手册.md)。

## Docker

```bash
docker build -t yican-server .
docker run -d -p 3000:3000 -v yican-data:/app/data yican-server
```

## 技术栈

| 部分 | 选型 |
|------|------|
| 前端框架 | uni-app 3 (Vue 3) |
| 构建 | Vite 5 + TypeScript |
| 状态/校验 | immer + zod |
| 后端 | Node.js + tsx + 内置 SQLite |
| 部署 | Docker / 任意 Node 主机 |
