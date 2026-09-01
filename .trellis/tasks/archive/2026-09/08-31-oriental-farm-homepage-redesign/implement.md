# 东方田园首页改版实施计划

1. 写入项目级 `PRODUCT.md`、`DESIGN.md` 与首页 surface brief，固化产品事实和本次视觉世界。
2. 生成并检查三张无 UI 的东方田园背景构图候选，选定一张作为正式素材。
3. 将选定素材转换为 Web 交付格式，计算尺寸、MIME、bytes 与 SHA-256；通过既定媒体发布流程上传不可变对象并回读校验。
4. 更新媒体 manifest、来源记录、准备脚本和客户端媒体 URL owner。
5. 重构 `App.vue` 的非 playing 启动结构，保留所有现有状态与事件处理方法。
6. 重写首页相关 CSS，完成桌面、移动端、焦点、禁用、加载、错误和 reduced-motion 状态；不破坏角色创建器与游戏内 UI。
7. 运行 Impeccable detector、typecheck 和 client build；使用浏览器验收桌面、手机、200% zoom、新/旧存档与错误状态。
8. 核对完整 diff、Git 图片二进制跟踪为零，并只暂存本需求新增的生产代码/配置。

## Risk and Rollback Points

- 媒体上传前不让代码依赖临时路径；上传失败时先保留候选，不提交不完整生产引用。
- `style.css` 同时包含首页和游戏内 UI；使用限定选择器并核对 playing/character-creation 两条路径。
- 工作区已有大量他人改动；只操作本计划列出的目标，暂存时逐文件核对。

## Verification

```powershell
npm --prefix .\apps\mirror-island run typecheck
npm --prefix .\apps\mirror-island run build:client
node C:\Users\phpxi\.codex\skills\impeccable\scripts\detect.mjs --json apps/mirror-island/client/src/App.vue apps/mirror-island/client/src/style.css
```
