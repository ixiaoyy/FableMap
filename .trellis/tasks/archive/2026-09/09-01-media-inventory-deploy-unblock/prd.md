# 修复媒体账本部署门禁

## Goal

恢复严格媒体库存校验，使已经合并的东方田园首页能够通过生产部署，同时不提前合入仍在开发中的音频运行时功能。

## Background

- 首页代码已通过 PR #1 合入 `main`，主视觉对象已按不可变 key 发布并经直接 CDN/同源代理回读验证。
- 部署 run `33464306633` 在媒体库存步骤失败：当时首页对象尚未发布，同时 CDN 已存在 19 个并行音频对象，而 `main` manifest 尚未登记它们。
- 当前音频 WIP 已包含完整 34 项 manifest 与支持 PNG/OGG/MP3/WAV 的两个校验器；公开 CDN 全量校验已返回 34 项成功。
- 音频运行时、设置 UI、事件接入、`prepare-media` 和人工听音仍属于 `08-31-audio-feedback-mvp`，不进入本修复。

## Requirements

- 从最新 GitHub `main` 建立干净分支，不使用当前混合 dirty 工作区作为 PR 基线。
- 只合入 `deploy/cdn/game-media-manifest.json`、`deploy/cdn/verify_media_manifest.py`、`deploy/cdn/verify_cdn_assets.py`。
- manifest 保留 15 张图片/2,874,147 bytes，并登记 19 个已发布音频/7,806,934 bytes；所有 URL、MIME、bytes 与 SHA-256 保持当前审核值。
- 校验器必须继续拒绝未知 MIME、重复/非规范 key、图片缺尺寸、音频伪造尺寸、总数不一致、缺失/多余远端对象和非 immutable cache。
- 不修改客户端、server、数据库、migration、音频播放代码或首页视觉。
- 创建本地安全分支固定当前混合音频 WIP；禁止 reset/rebase/amend 或覆盖并行音频文件。

## Acceptance Criteria

- [x] `_validate_manifest` 接受 34 项并返回图片/音频精确计数与字节总数。
- [x] `verify_cdn_assets.py` 从公开 CDN 验证全部 34 项成功。
- [x] PR 文件列表精确为三个 deploy/cdn 文件，无音频客户端或其它工作区改动。
- [x] PR 合并后 `Deploy Mirror Island` 对新 `main` 成功。
- [x] 生产 `/` 发布东方田园画卷首页 bundle，首页主视觉请求成功；浏览器控制接口读取 DOM/console 超时，未把该工具限制伪报为 console 结论。
- [x] 本地音频 WIP 有独立安全引用且没有丢失、撤销或重写。

## Out of Scope

- 完成、验收或归档音频 MVP。
- 修改或删除已经发布的音频/CDN 对象。
- 绕过媒体库存校验、手工跳过部署步骤或连接数据库。
