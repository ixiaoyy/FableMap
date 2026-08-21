# 开源采用记录

| 能力 | 固定版本/提交 | 许可证 | 采用边界 |
|---|---|---|---|
| Phaser | `4.2.1` | MIT | 浏览器 2D 渲染、输入、相机和实体表现 |
| Vue | `3.5.41` | MIT | Hotbar、背包、制作和状态 UI |
| `@colyseus/core` | `0.17.50` | MIT | 权威 WorldRoom、matchmaking、server tick 和生命周期；不采用带未使用 auth/playground/Redis 的元包 |
| `@colyseus/sdk` / Schema / WS transport | `0.17.43` / `4.0.31` / `0.17.13` | MIT | 浏览器连接、类型化 state patch 和 WebSocket transport |
| Keycloak Server | `26.7.1` + 固定多架构 digest | Apache-2.0 | 独立账号、Remember Me、OIDC broker、会话 |
| `keycloak-js` | `26.2.4` | Apache-2.0 | browser Authorization Code + PKCE、内存 token 刷新 |
| `oidc-provider` | `9.11.1` | MIT | 把现有 ParallelLines ticket 窄适配为 OpenID Certified OIDC provider |
| Prisma/@prisma/client/@prisma/adapter-pg | `7.9.1` | Apache-2.0 | PostgreSQL schema、migration、transaction/OCC、生成 client |
| `pg` | `8.23.0` | MIT | Prisma 7 PostgreSQL driver adapter |
| `jose` | `6.2.9` | MIT | Keycloak JWT/JWKS 验证和 OIDC 签名键生成 |
| Ninja Adventure | 固定提交 `6ac78232...` | CC0-1.0 | 只使用 manifest 已登记角色/地形子集 |
| Phaser Vue TS template | 固定提交 `2fe6c3e...` | MIT | 只采用 Vue/Phaser 生命周期与 Vite 结构 |
| Cabacos | 固定提交 `79e423d...` | 仓库声明 MIT，holder 待澄清 | 仅行为级移植物品、背包、种田和 Tiled 模式 |
| Rick Survival | 固定提交 `ea9738c...` | 源码 MIT，素材禁用 | 首阶段不采用；后续仅参考战斗结构 |

## 安全与退出

- Phaser 和 Colyseus 直接依赖锁定确切版本；纵向切片完成前不追新版本，升级必须先核对 API、renderer、Schema 和重连兼容性。
- Prisma CLI 的 `deepmerge-ts@7.1.5` 存在递归图合并栈耗尽公告。CLI 只位于一次性 migration 镜像，只读仓库内受信 `prisma.config.ts`/模式，不处理用户对象图；不用不兼容的强制降级伪修复。
- `oidc-provider` 不保存长期身份；只有单进程、有 TTL 的交互/code/grant 适配。进程重启只使正在进行的论坛登录重试，已建立的身份和会话归 Keycloak 持久化。
- OIDC ID Token 使用生产配置首次生成并后续复用的 P-256/ES256 私钥；Keycloak 通过稳定 JWKS 验签，`mirror-game` 重启不轮换签名身份。
- 底层替换必须保持同一 Keycloak subject、checkpoint interface 和九表数据合同；不通过恢复旧本地单机原型、RPGJS 或 FastAPI 系统退出。
