# 手机启动优化与首页压缩副本

状态：本地实现和浏览器验证完成，尚未上传两张 WebP，也未提交或发布本轮代码。

## 资源与实现

首页先读取唯一浏览器试玩槽，仅在开始创建角色时加载角色图集，在进入世界时并行准备地图、角色和 Phaser。共享纹理名称移至不依赖 Phaser 的模块，防止图标模块把引擎重新带回首屏。存档仍使用 current v13，覆盖旧档仍需用户确认。

地图仍由同一个 WorldCatalog 校验；Phaser 使用原始地图的独立副本，不再二次请求。地图 URL 带整个地图集合的内容哈希，LF/CRLF 归一后计算，单个请求包含下载和 JSON 读取在内最多 15 秒。失败不发布半成品，后续显式操作可重新加载。Nginx 对地图设置 JSON 类型并开启 gzip；音频模板按首次播放创建，未进入区域的环境音不预取。

两张首页 WebP 都由已发布原图机械转换，原图保留，未新生成画作。真实提示词和原始来源继续见 [首页原图记录](mirror-island-home-hero-2026-08-31.md)。

- 原图 SHA-256：`f1182c1ef76eba8a048dd2f424ed0219c80575629e01f46be8e59519e2fe7adf`。
- 转换工具：已有 Pillow 11.3.0，WebP `quality=80`、`method=6`；手机使用 LANCZOS 缩放到 960×540，桌面保持 1672×941。
- 复现：`python deploy/cdn/prepare_home_hero.py <已校验原图> <输出目录>`。
- 新对象前缀：`game/media/v1/assets/original/mirror-island-home/2026-09-07/`。
- `home-hero-mobile.webp`：102226 字节，SHA-256 `a310db2133cede0c6b152a79c2a6dc68d7700bcd510b65785d1211053cbc306c`。
- `home-hero-desktop.webp`：233846 字节，SHA-256 `1bfc3bad03fb5fa969e74feebf68d819ff9a8ca805bfc183431be8c7b2166132`。
- MIME 为 `image/webp`，不透明 VP8 编码；校验脚本检查尺寸、完整 RIFF/VP8 长度、字节及 SHA-256。其他 WebP 编码明确拒绝。
- 宽度不超过 768px 时仅请求手机副本。全部图片二进制继续留在忽略目录，不提交 Git。

## 验证结果与边界

- 本地首屏 JavaScript gzip：约 503 KB → 127 KB；引擎在进入世界时另行加载，约 378 KB gzip。
- 手机首页背景：2659416 → 102226 字节，约减少 96%；桌面为 233846 字节。
- 12 张地图原文（LF）共 409687 字节，gzip 测算 25044 字节。生产 Nginx 实际响应待发布后核验；本机 Docker daemon 不可用，未运行镜像验证。
- 本地 390×844 浏览器首页资源清单只有入口脚本、样式、手机背景；角色创建时增加两张角色图集和创建组件；进入农场后才加载 Phaser 和 12 张带版本的地图，农场没有请求小镇、湖岸、室内环境音。
- 新建角色、进入农场、刷新后检测及继续 current save 通过，控制台无错误或警告。地图失败重试、全部校验后发布、Phaser 深拷贝与缓存复用检查通过。
- `typecheck`、`build:client`、`test:life-loop` 19/19、媒体 manifest 与本地 WebP 校验通过。发布工作流 YAML 和 Bash 语法通过。
- Impeccable 检查发现 6 项既有装饰/动画提示，均在本次未修改的样式声明中；本轮保留既有视觉。
- 本地浏览器检查不等同于反馈用户的真机网络测速，没有宣称具体进入秒数或 Core Web Vitals 达标。

## 发布与回滚

发布需先获本轮生产发布授权，再按顺序执行：

1. 只提交并推送 `.github/workflows/publish-media.yml` 与 `deploy/cdn/prepare_home_hero.py`，提交消息包含 `[skip ci]`；本步不发布新应用和媒体 manifest。
2. 分别触发现有 `publish-game-media` 事件：对象 key/bytes/hash 取上方记录，MIME 为 `image/webp`，`source_url` 为原图的固定 CDN URL，`source_encoding=home-hero-webp`。流水线校验原图哈希并确定性转换，不需要临时 gist 或把 base64 图片提交 Git。
3. 回读两张 CDN 对象，确认 MIME、尺寸、字节、SHA-256、一年 immutable 缓存全部匹配。任一项失败不得发布应用。
4. 提交其余代码和已准备的 manifest，推送 main，通过既有 Deploy Mirror Island 流水线发布；再核验公开入口、小图和地图 gzip。

本轮不新增数据库 migration、不改变存档版本。需要回滚时回退本轮应用变更并重新发布；原图及新 WebP 均保留，不删除对象或玩家存档。CI 只在专用图片转换分支安装 Pillow，游戏镜像与浏览器没有新增依赖。

实现参考：[Vue 按需加载](https://vuejs.org/guide/best-practices/performance)、[Nginx gzip](https://nginx.org/en/docs/http/ngx_http_gzip_module.html)、[Pillow WebP](https://pillow.readthedocs.io/en/stable/handbook/image-file-formats.html#webp)。
