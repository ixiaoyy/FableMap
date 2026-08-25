# 技术设计

## 目录与构建边界

首阶段继续使用 `apps/mirror-island/package.json` 作为单一依赖和脚本 owner，避免为纵向切片预建 workspace：

```text
apps/mirror-island/
├── client/
│   └── src/
│       ├── game/{scenes,entities,world,network}
│       ├── ui/{hotbar,inventory,crafting}
│       └── stores/
├── server/
│   ├── rooms/
│   ├── systems/
│   ├── auth/
│   └── persistence/
├── shared/
│   ├── messages/
│   ├── schemas/
│   ├── items/
│   ├── recipes/
│   └── constants/
└── package.json
```

- Vite client 入口位于 `client/`，Phaser 4.2.1 canvas 由 Vue 组件负责创建和销毁。
- Node/Colyseus server 入口位于 `server/`；服务端构建继续沿用独立 SSR config，不把 Prisma、Keycloak verifier 或 secret 带入 browser bundle。
- `shared/` 使用无副作用 TypeScript；消息入口必须从 `unknown` 统一解码，Phaser/Vue 不自行 cast raw payload。
- 现有 `src/sso`、Keycloak 主题、Prisma schema 和部署脚本先保持稳定，通过窄 adapter 接入；纵向切片成立后再做机械目录整理，避免把搬家和架构验证混为一次风险。

## 固定依赖

- `phaser@4.2.1`
- `vue@3.5.41`
- `@colyseus/core@0.17.50`
- `@colyseus/sdk@0.17.43`
- `@colyseus/schema@4.0.31`
- `@colyseus/ws-transport@0.17.13`
- 继续使用仓库当前 `vite@8.2.1`、`typescript@6.0.3` 和 `@vitejs/plugin-vue@6.0.8`，不从官方模板降级构建工具。

版本在纵向切片完成前固定；若兼容性检查失败，先报告真实阻塞，再提出单一版本调整，不使用 `^4` 或漂移 latest。

## 数据流与所有权

```text
Keyboard/Pointer
  -> typed client intent
  -> Colyseus message decoder
  -> WorldRoom command dispatcher
  -> authoritative system mutation
  -> Schema patch
  -> client projection
  -> Phaser renderer / Vue store
```

- `MoveIntent` 只携带递增序号和 `xAxis/yAxis`（-1/0/1）；WorldRoom 20 Hz tick 计算速度、归一化、边界和位置。
- `InteractIntent` 只携带资源 ID；GatheringSystem 验证资源存在、可用、距离和工具。
- `CraftIntent` 只携带 recipe ID；CraftingSystem 从 shared recipe 读取成本并在服务端一次结算。
- `FarmIntent` 只携带 tile ID 和动作；FarmingSystem 根据当前 tile state、物品和动作执行封闭转换。
- Vue/Phaser 只订阅 client projection，不直接拥有第二份玩法 reducer。

## 并发采集合同

WorldRoom 的消息处理不等待数据库。GatheringSystem 在同一个同步命令内：

1. 读取资源节点并验证 `available === true`。
2. 验证玩家距离和必要工具。
3. 先把节点标记为 depleted 并增加 revision。
4. 再把唯一掉落加入该玩家背包。
5. 发布一次 state patch。

第二个同树意图看到 depleted revision 后返回固定失败码，不产生掉落。持久化 checkpoint 只能在命令完成后异步排队，不能重新打开资源竞态。

## 移动、断线与重连

- Room simulation tick 固定为 50 ms；客户端缓存最近两个权威位置并插值远端实体。
- 本地玩家第一阶段也以权威位置为准，不做预测；可接受轻微延迟，先证明所有权模型。
- 玩家断线后从在线 `players` Schema 删除，使其他客户端立即移除实体；快照保留在 `InMemoryPersistence`，键为 Keycloak subject。
- 短期 `allowReconnection` 成功时恢复同一 session；超时后重新加入仍按 subject 加载进程内快照。
- snapshot 包含位置、背包和农田状态，不包含 Keycloak token 或 socket/session 对象。

## 身份合同

- Vue 启动时复用 `keycloak-js` 初始化和刷新逻辑。
- 同源 matchmaking 请求在 body/options 中携带短期 access token；不进入 URL、持久存储或日志。
- Colyseus `onAuth` 调用从现有 `auth/server.ts` 提取的纯 verifier，返回稳定 `accountId=sub`；Room state 和错误文本不包含 token。
- SSO bridge、realm、主题和论坛网络保持原样；只替换游戏 WebSocket 的认证 adapter。

## 持久化接口

```typescript
interface GamePersistence {
  loadPlayer(accountId: string): Promise<PlayerCheckpoint | null>;
  savePlayer(checkpoint: PlayerCheckpoint): Promise<void>;
  loadWorld(worldId: string): Promise<WorldCheckpoint | null>;
  saveWorld(checkpoint: WorldCheckpoint): Promise<void>;
}
```

- 首阶段 `InMemoryGamePersistence` 负责刷新和重新加入恢复，不连接 PostgreSQL。
- Room 内存是实时真相；checkpoint 由关键事件、离开房间和低频 dirty flush 触发。
- Prisma adapter 单独评审后实现；现有 schema 不足时停在接口边界，不修改数据库。

## 开源规则迁移

- 官方 Phaser 模板：采用 Vue/Phaser 生命周期和 Vite 入口；删除 demo scene、无类型 EventBus 和模板日志脚本。
- Cabacos：重建 ItemDefinition、库存命令、作物转换和 Tiled/输入表现；不复制 SaveService、Phaser Canvas UI 和素材。
- Rick Survival：本阶段不进入生产依赖或源码，仅保留后续战斗研究记录。
- 所有移植项记录固定来源、原路径、分类和改造说明；LICENSE 不明确的代码只做行为级实现。

## 回滚与切换

- 生产继续运行 `origin/main@44d69cb4`，新分支在人工纵向切片验收前不部署。
- RPGJS 恢复点为远端 branch/tag/commit 三重定位，不从 Git 历史复制到 Phaser 分支。
- 每层边界独立提交：合同/骨架、权威 Room、客户端投影、玩法规则、持久化接口；失败只回滚当前层。

## 验证

- 自动：TypeScript、client build、server build、必要配置解析。
- 人工：两个 Keycloak 账号、同房移动、同树并发、Hotbar、制作、农田、刷新、B 断线/A 移除、B 重进恢复。
- 不运行数据库测试，不连接数据库，不建设大规模自动化矩阵。
