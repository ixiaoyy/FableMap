# 技术设计

## Authority reconciliation

以当前 rewritten Git refs、生产运行、现有代码合同和用户最终人工验收为证据层级：

```text
rewritten main / tags
        +
production Actions / public health
        +
checkpoint acceptance / user confirmation
        ↓
README + PRODUCT_BRIEF + WHAT_NOT_TO_BUILD + Trellis spec/tasks
```

- 产品文档只描述当前事实与下一门槛，不把未来设计写成已实施。
- 历史部署 run 继续保留旧 head SHA；checkpoint 同时记录 rewritten 等价 commit，避免伪造当时的运行记录。
- 旧 feature-branch SHA 若未被 rewritten refs 保留，不再作为当前可点击 source ref；改用 rewritten main 上语义等价的提交。

## Task closure matrix

| Task | Evidence | Result |
|---|---|---|
| Life Loop release | 双账号生产验收、checkpoint、tag `cc4b6ff5` | 补齐 AC 后归档 |
| Town Showcase | 6 张原图、packed 清退、Gate A/B/C 人工通过、生产地图 | 补齐 AC 后归档 |
| Singleplayer Stardew Core | 全部 AC 已勾选，后续双账号 Life Loop 补足 owner 隔离证据 | 子任务归档后归档 |
| World Foundation | Farm/Town 路线、碰撞、持久资源、店铺、Gate B/C 均被后续生产验收覆盖 | 子任务归档后归档 |
| Forum SSO network | 自动合同与生产网络门禁存在；具体双登录人工证据仍未写入 | 自动检查通过后更新但不归档 |

归档顺序固定为子任务优先：Life Loop release、Town Showcase → Singleplayer Core、World Foundation。Forum SSO 独立保留。

## Lockfile repair

- `package.json` 的直接 dependency/devDependency/override 版本均为精确版本，是不可变输入。
- 使用 npm 10 的 `npm install --package-lock-only --ignore-scripts --no-audit --no-fund` 重新求解 lockfile。
- 比较修复前后 root package metadata 与所有直接依赖的 resolved version；任何直接版本变化视为失败。
- 随后运行真实 `npm ci --no-audit --no-fund`，证明 fresh clone 安装路径成立。
- `node_modules`、Prisma generated client、dist 均为 ignored 本地产物，不进入 Git。

## Safety boundaries

- 不连接数据库，不启动身份服务，不读取 `.env` 内容。
- 不编辑 `apps/mirror-island/domain/`、`client/`、`server/`、四张 TMJ 或媒体 manifest。
- Trellis archive 命令可能产生任务归档提交；这些提交只在当前 feature branch 上产生，最终统一审查，不直接推送 main。
- lockfile 修复失败时恢复本任务自己的 lockfile diff，不回滚用户或其他任务文件。

## Verification

- 文档：针对旧里程碑措辞、5 图集描述、旧 SHA 和 Expedition 当前优先级做全文检索。
- Git：图片二进制、TMJ、migration、业务代码 diff 均为零。
- npm：真实 `npm ci`、Life Loop/Town/identity 窄合同、typecheck、client/server build。
- 配置：`docker compose -f docker-compose.yml -f deploy/docker-compose.mirror-island.yml config`，只解析不启动、不连接数据库。
