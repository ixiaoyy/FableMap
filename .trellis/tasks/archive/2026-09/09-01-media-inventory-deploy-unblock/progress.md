# 完成证据（2026-09-01）

- 本地安全分支：`codex/audio-feedback-wip-preserved-20260901`，固定混合音频 WIP commit；主工作树未 reset/rebase/amend，未覆盖未提交音频文件。
- 干净修复提交：`7cdf50f7 fix: reconcile deployed media inventory`。
- PR #3：`https://github.com/ixiaoyy/FableSpace/pull/3`，创建时精确三个 deploy/cdn 文件、单一提交、无客户端代码。
- 并行音频任务在 PR #3 合并前已把相同三文件合入 `main`；因此 PR #3 最终 merge commit `b13251a2` 为幂等空提交，没有重复触发部署。
- 生效部署：run `33473240482`，head `7b33bd5b4f598cb11b19f363864d563cedad323a`，结论 success。
- Manifest 正向：34 entries，15 images / 2,874,147 bytes，19 audio / 7,806,934 bytes。
- Manifest 负向：缺音频 totals、音频伪造 dimensions、未知 MIME 三种情况均 fail-closed。
- 公开 CDN：34 项全部通过 bytes、SHA-256、MIME、immutable cache；PNG 额外通过 IHDR dimensions。
- 生产 `https://fable.pingxingxian.space/`：HTML 200/430 bytes，JS 200/1,622,201 bytes，CSS 200/47,454 bytes；bundle 包含 `开始新旅`、`mirror-island-home-hero.png`、`.home-scroll` 和 `.start-panel--welcome`。
- Chrome 标签成功加载为“镜像岛”；浏览器控制插件读取 DOM/console 连续超时，未取得 console 证据，但 HTTP/bundle/deploy/CDN 证据均正常。
