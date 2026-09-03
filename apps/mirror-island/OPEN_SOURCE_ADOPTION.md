# 开源采用记录

| 能力 | 固定版本/提交 | 许可证 | 采用边界 |
|---|---|---|---|
| Phaser | `4.2.1` | MIT | 浏览器 2D 渲染、输入、相机和实体表现 |
| Vue | `3.5.41` | MIT | Hotbar、背包、制作和状态 UI |
| EasyStar.js | `0.4.4` | MIT | 只在 domain 薄适配 Tiled Collision 四方向 NPC 短路径；不拥有日程、存档或动态避障 |
| Phaser/Colyseus 多人切片 | tag `phaser-colyseus-checkpoint-2026-08-24` | 版本见 checkpoint | 已冻结技术参考，不进入单人 active graph |
| Keycloak Server | `26.7.1` + 固定多架构 digest | Apache-2.0 | 保留的身份与论坛 OIDC broker 基础设施；当前试玩客户端不接入 |
| `oidc-provider` | `9.11.1` | MIT | 把现有 ParallelLines ticket 窄适配为 OpenID Certified OIDC provider |
| Prisma/@prisma/client/@prisma/adapter-pg | `7.9.1` | Apache-2.0 | PostgreSQL schema、migration、transaction/OCC、生成 client |
| `pg` | `8.23.0` | MIT | Prisma 7 PostgreSQL driver adapter |
| `jose` | `6.2.9` | MIT | Keycloak JWT/JWKS 验证和 OIDC 签名键生成 |
| Ninja Adventure | 固定提交 `6ac78232...` | CC0-1.0 | 只使用 manifest 已登记角色/地形子集 |
| VectoRaith Farming Sim | v1.08 ZIP SHA-256 `1957927a...` | 自定义项目使用许可 | Farm v1；只发布 used-tile compact atlases、EntityFactory frames 和 farmer sheet，不再分发原 ZIP/完整图集 |
| IvoryRed GARDENS | 2026-08-27 原图 SHA-256 `de4dbbb...` | CC BY 4.0 | 只发布原始 160×176 图标 sheet；Hotbar 选择四个 16×16 frame，并在产品内交付署名 |
| bluecarrot16 `[LPC] Cats and Dogs` | 2026-09-02 快照；cat SHA-256 `914bae85...`、dog `77f4667a...` | CC BY 3.0（采用页面提供的可选许可） | 只发布两个原始 512×256 PNG；运行时固定选择橘猫/黄犬 32×32 四方向 walk、idle 与 rest 帧，并在产品内交付署名 |
| Phaser Vue TS template | 固定提交 `2fe6c3e...` | MIT | 只采用 Vue/Phaser 生命周期与 Vite 结构 |
| Cabacos | 固定提交 `79e423d...` | 仓库声明 MIT，holder 待澄清 | 仅行为级移植物品、背包、种田和 Tiled 模式 |
| Rick Survival | 固定提交 `ea9738c...` | 源码 MIT，素材禁用 | 首阶段不采用；后续仅参考战斗结构 |
| 原生 IndexedDB | Browser standard | Web Platform API | 单 store SaveRepository adapter；不引入通用 ORM |

## 春季 v10 增量（2026-09-03）

- 天气、农田、钓鱼与送礼是项目专用 domain 规则，继续复用已有 Phaser/Vue/EasyStar/IndexedDB 边界，没有新增 npm 运行时依赖。
- 六作物与树桩继续引用已登记 VectoRaith 原图中的固定帧；没有引入新图片、音频文件或新的 CDN 对象。像素帧经原图网格核对，青豌豆/土豆不再误用瓜类帧。
- 天气声只用浏览器 [AudioBufferSourceNode](https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode) 与 [BiquadFilter](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBiquadFilter) 产生原创、低音量的雨/风噪声；挂在现有 AudioDirector 下，服从 master/SFX、室内外与隐藏状态，无网络/存档数据访问。
- 核对过官方 [Howler.js v2.2.4](https://github.com/goldfire/howler.js/tree/v2.2.4)：MIT、无外部依赖，官方标示约7KB gzip，兼容 Web Audio/HTML Audio。此次不采用：既有 AudioDirector 已拥有播放/音量/淡化，而合成仍需原生音频图，引入另一播放 owner 收益不足。未采用，因此不新增锁文件或宣称完成上游全量安全审计；退出仅删除 WeatherAmbience 适配，不影响存档或 domain。

## 安全与退出

- Phaser/Vue 直接依赖锁定确切版本；Stardew Core 成立前不追新版本。
- EasyStar.js 的 npm 最新发布仍为 CommonJS `0.4.4`，依赖面只有 `heap@0.2.6`，当前生产依赖审计没有归因到二者的公告；因上游发布节奏低，只允许 `npc-pathfinding.ts` 单点同步适配，未来不兼容时可在不改 GameSession/runtime 合同的前提下替换。
- 已评审 `idb@8.0.3`，ISC 不在默认 allowlist，且当前接口窄，因此使用受控原生 IndexedDB 薄层并记录退出成本。
- Prisma CLI 的 `deepmerge-ts@7.1.5` 存在递归图合并栈耗尽公告。CLI 只位于一次性 migration 镜像，只读仓库内受信 `prisma.config.ts`/模式，不处理用户对象图；不用不兼容的强制降级伪修复。
- `oidc-provider` 不保存长期身份；只有单进程、有 TTL 的交互/code/grant 适配。进程重启只使正在进行的论坛登录重试，已建立的身份和会话归 Keycloak 持久化。
- OIDC ID Token 使用生产配置首次生成并后续复用的 P-256/ES256 私钥；Keycloak 通过稳定 JWKS 验签，`mirror-game` 重启不轮换签名身份。
- 底层替换必须保持同一 Keycloak 身份、SaveRepository 边界和九表后端数据合同；不通过恢复 RPGJS、Colyseus active graph 或 FastAPI 系统退出。
