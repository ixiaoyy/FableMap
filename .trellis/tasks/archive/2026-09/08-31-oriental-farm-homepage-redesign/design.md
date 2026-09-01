# 东方田园首页改版技术设计

## Boundaries

- `App.vue` 继续拥有启动阶段的状态分支与命令调用，只调整非 playing 阶段的可访问语义结构。
- `style.css` 负责首页视觉系统与响应式；现有游戏内样式和角色创建器样式保持兼容。
- 新背景作为项目原创生成素材接入同源媒体命名空间；页面不直接引用临时文件或外部生成地址。
- GameSession、SaveRepository、IndexedDB schema、Phaser scene 与 server 不改动。

## Visual Contract

- Thesis：以一幅正在展开的东方田园画卷作为“进入本地生活世界”的仪式，拒绝现有技术控制台式启动页。
- Own-world：雾青山水、稻穗金、竹青与宣纸白；木构画框、纸张纤维、篆印和云纹构成控件语言。
- Story：玩家先识别镜像岛与单人本地世界，再看到存档状态，最后选择开始新旅或继续上次。
- First viewport：主视觉铺满背景，左侧约 38% 为竖向画卷面板，右上悬挂存档状态，底部为轻量信息带。
- Form：参考图已锁定“东方田园画卷启动页”，布局采用响应式 CSS 结构而非把 UI 烘焙进图片。

## Data Flow

```text
onMounted -> initialize local session -> hasSave -> gameUiState.phase/menu
menu button -> existing startNewGame/continueGame -> existing GameSession calls
generated background -> manifest/prepare-media -> /game-media/v1 -> CSS custom property
```

## Compatibility

- `playing` 分支继续使用全屏 `.island-shell--game`，首页样式只在非 playing 结构上生效。
- `character-creation` 继续复用现有组件；外层背景与返回阶段不变。
- 背景加载失败时使用同色系 CSS 山雾渐变兜底，按钮与文案仍可操作。
- 移动端隐藏纯装饰性悬挂细节并让画卷面板成为可滚动单列。

## Media Contract

- 生成一张无文字、无标识、无 UI 的 16:9 横向插画；左侧保留较安静的雾景以容纳面板，右侧聚焦农舍、竹林、菜畦与远山。
- 使用新 `assets/original/mirror-island-home/2026-08-31/mirror-island-home-hero.png` 不可变 key，与现有 PNG-only manifest 校验合同保持一致。
- 更新 `deploy/cdn/game-media-manifest.json`、`apps/mirror-island/scripts/prepare-media.mjs` 与一份 `docs/assets/` 来源记录。
- 只有完成远端上传和回读校验后，生产代码才引用该对象；仓库不提交图片二进制。

## Rollback

- UI 回滚只涉及 `App.vue`、`style.css` 和新增媒体 URL 常量。
- 媒体对象不可变，不执行覆盖或删除；回滚代码与 manifest 条目即可停止引用。
