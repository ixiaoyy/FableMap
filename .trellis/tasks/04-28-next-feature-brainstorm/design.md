# 首页视觉方向阶段 1 设计草案：City Cyber Life Shell

## Status

Draft for user review. Do not implement until approved.

## Goal

把 FableMap 首页从 “Tavern-only / 开酒馆工具” 的表达，升级为 **城市里的赛博生活模拟器**，同时保留原 `index` 设计的赛博视觉强度。第一阶段只做“设计系统 + 首页壳”，不全站铺开。

## North Star

**原 index 视觉强度 + City Cyber Life 叙事。**

参考基准：

- `设计参考/index.png`
- `frontend/app/assets/homepage-reference/neon-cyber-tavern-reference.png`

这两张图代表当前不能丢的视觉质量：高密度赛博氛围、霓虹空间、强主视觉、海报/游戏封面感。后续不能退回低保真渐变卡片或解释型 dashboard。

## Core Message

首页首屏不再解释一大堆概念，只负责抓人。

推荐主标题方向：

> 每个坐标，都可能藏着一个世界

备选副标题：

> 在真实地图上，进入一个个会回应你的区域。

首屏副标题也不能列举 Home / 学校 / 店铺 / 酒馆。对探索者来说，它们先是等价的待探索区域。

副标题必须短，不能把 Home / Place / 关系图完整说明塞进首屏。完整解释放到第二屏。

## Stage 1 Scope

### In Scope

- 重构 `frontend/app/routes/home.tsx` 的首页壳和文案层级。
- 保留/复用原 index 视觉资产或其视觉语言。
- 将首页叙事从 “Cyber taverns on real places / 开店 / 酒馆收录” 调整为 “真实城市里的 AI 生活切片”。
- 定义可复用视觉语言：暗色城市背景、霓虹高光、玻璃面板、Place 类型 chip、主 CTA/次 CTA、强海报首屏。
- 保留通往 `/discover`、`/create`、`/owner`、具体 Place/Tavern 的入口，但文案不再只围绕“开店”。

### Out of Scope

- 不重做 `/discover`、`/create`、`/tavern`、`/owner` 的完整页面。
- 不新增后端 API、Schema 字段或 Place/Home 数据模型。
- 不新增 AI 生成主视觉图；如果需要新图，单开图片资产任务。
- 不引入新的 UI 框架、状态管理库或地图依赖。
- 不做平台自动生成/发布内容、泛社交、RPG 战斗/等级等负面清单内容。

## Visual Design Principles

1. **First screen is a poster, not a brochure**
   - 首屏少文字。
   - 视觉先于解释。
   - 让用户觉得“我想点进去看看”。

2. **Preserve cyber density**
   - 保留原 index 的霓虹、高对比、层叠空间、强氛围。
   - 不用空洞大渐变替代高完成度图像/构图。

3. **Broaden category without diluting fantasy**
   - 酒馆保留，但只是 Place 类型之一。
   - 首屏不列举类型；探索者先看到的是“待探索区域”。
   - 类型信息可以在第二屏、筛选、详情页或创建流程中出现。
   - 不要把首页变成“地点类型说明书”。

4. **Product clarity moves to second layer**
   - 首屏：情绪与主 CTA。
   - 第二屏：解释真实地图、AI 场所、Home、角色关系、记忆回访。
   - 第三屏：展示精选 Place / 角色 / 记忆回访模块。

5. **Mobile first enough**
   - 首屏在窄屏不能只剩一张被裁坏的图。
   - CTA、标题和主视觉焦点必须在移动端安全区域内。

## Proposed Homepage Structure

### 1. Hero / Poster Screen

Purpose: 抓人。

Elements:

- Full-bleed cyber visual using `frontend/app/assets/homepage-reference/neon-cyber-tavern-reference.png` as the quality/style baseline.
- Minimal nav overlay.
- Main title: “每个坐标，都可能藏着一个世界”。
- One short subtitle, no type list.
- Primary CTA: “开始探索” / “进入地图” → `/discover`.
- Secondary CTA: “创建我的空间” → `/create`.
- No first-screen type chips. Home / 学校 / 店铺 / 酒馆 should not be enumerated in the hero; they are all equal explorable areas from the explorer perspective.

Avoid:

- 大段解释性段落。
- 太多指标数字。
- “酒馆收录 / 店主主权 / API Key” 这类后台或说明性语言占据首屏。

### 2. What Is This / Concept Strip

Purpose: 首屏之后快速解释，不抢首屏。

Three short cards:

- **真实地图是入口**：每个空间有真实坐标。
- **AI 场所会回应你**：Home、学校、店铺、酒馆都可以承载角色与记忆。
- **关系留在城市里**：角色、成员、地点关系可被回访。

### 3. Featured City Slices

Purpose: 展示多类型 Place，不再只展示酒馆。

Use existing image assets initially, but rename/copy semantics in UI:

- Home / 我的房间或家。
- 学校 / 社区空间。
- 咖啡店 / 便利店 / 酒馆。

For this stage, if actual backend examples still mostly tavern data, UI copy can frame them as “城市切片 / AI 场所”，but must not fake unavailable backend behavior. Links can still point to existing `/tavern/:id` until later route/model work.

### 4. NPC / Memory Module

Purpose: 保留 AI 角色和记忆回访卖点。

Copy should shift from “店主自动生成酒馆内容边界” to user-facing value:

- NPC remembers prior visits.
- Places become emotionally persistent.
- Owner/content boundary can be explained lower down or in docs, not in hero.

## Terminology Changes

Current home copy has several Tavern-only terms that should be changed in Stage 1:

| Current | Replace With |
| --- | --- |
| `Cyber taverns on real places` | `AI life on real places` / `Cyber life on real places` |
| `酒馆` nav as primary category | `AI 场所` / `城市切片` |
| `开店` | `创建空间` / `创建我的空间` |
| `酒馆收录` | `AI 场所` / `城市切片` |
| `热门酒馆` | `正在发光的地点` / `精选城市切片` |
| `店主入口` | `主人入口` / `管理我的空间` |

`酒馆` 可以继续作为卡片类型或示例出现，但不再是唯一世界观。

## Likely Files

- `frontend/app/routes/home.tsx`: primary implementation target.
- `frontend/app/assets/homepage-reference/neon-cyber-tavern-reference.png`: visual baseline / possible hero background.
- `frontend/app/assets/homepage-reference/modules/*.png`: optional lower-section supporting images.
- `frontend/app/ui/button`: only if button variants need minor reuse; avoid broad UI framework changes.

## Verification Plan for Implementation Phase

When implementation starts:

- Run `npm --prefix .\frontend run build`.
- If only `home.tsx` visual/copy changes, no backend tests are required.
- Use browser visual check for `/` at desktop and narrow viewport.
- Confirm homepage still links to `/discover`, `/create`, and existing place/tavern entry points.

## Open Review Questions

1. Confirmed hero headline: “每个坐标，都可能藏着一个世界”.
2. Confirmed: Stage 1 should reuse existing `neon-cyber-tavern-reference.png` as the actual hero visual baseline.
3. Confirmed: No Home / 学校 / 店铺 / 酒馆 type chips on the first screen. Types are equal explorable areas for explorers and should be revealed later.


