# T5.8 — 店主身份贯通到前端写操作

## 概述

修复店主控制台写操作未携带店主身份的问题。创建、编辑、删除空间以及角色管理请求现在会把当前 `ownerId` 作为 `X-User-Id` 请求头发送给后端，创建空间时也会在 payload 中附带 `owner_id` 作为兼容兜底。

## 为什么改

后端对空间更新、删除、角色增删改等操作会校验 `owner_id` 与请求中的 `X-User-Id`。前端此前只在列表查询里使用 `owner_id`，写操作没有传请求头，容易导致：

- 新建空间没有稳定 owner 归属；
- 新建后回到“我的空间”列表不可见；
- 对已有 owner 空间执行编辑、AI 配置、角色管理或删除时触发 403。

## 改了什么

| 文件 | 变更 |
|------|------|
| `frontend/src/services/tavernService.js` | 新增 `buildHeaders` / `buildJsonHeaders`，写操作支持可选 `userId` 并发送 `X-User-Id` |
| `frontend/src/TavernCreatePanel.jsx` | 新增 `ownerId` prop；创建 payload 附带 `owner_id`；创建空间与初始角色添加时传入 ownerId |
| `frontend/src/TavernOwnerPanel.jsx` | 编辑、删除、切换营业状态、保存 AI 配置、打开创建面板时贯通 ownerId |
| `frontend/src/CharacterManagementModal.jsx` | 角色列表刷新、添加、编辑、删除、导入均传入 ownerId |

## 验证点

- 店主控制台创建的新空间带有当前 `ownerId`
- 创建后能在“我的空间”列表中继续看到
- 编辑空间、切换营业状态、保存 AI 配置不再因缺少身份触发 403
- 角色添加/编辑/删除/导入不再因缺少身份触发 403

