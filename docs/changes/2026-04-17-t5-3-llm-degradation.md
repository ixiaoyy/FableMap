# T5.3 变更记录：LLM 降级策略 — API 错误差异化提示

## 变更日期
2026-04-17

## 任务 ID
T5.3

## 变更类型
用户体验改进

## 概述
`TavernChatRoom.handleSend` 的 `catch` 块不再对所有错误显示相同的通用消息，而是根据 HTTP 状态码（401/403/429/5xx）显示对应的友好提示。同时，`tavernService.readJson` 将 HTTP 状态码附加到错误对象的 `errorType` 字段。

## 为什么改
之前的 `catch` 块把所有错误（网络断开、401 认证失败、429 限流、500 服务器错误）都归并为同一句话"消息没有送达 / 网络或服务端暂时不可用"。用户和店主都无法从错误提示中判断真实原因，无法有针对性地处理。

## 改了什么

### 文件：`frontend/src/services/tavernService.js`

`readJson` 在抛出错误时附加 `errorType`（HTTP 状态码）：

```javascript
// 修改前
throw new Error(payload.error || payload.detail || `HTTP ${response.status}`)

// 修改后
const err = new Error(payload.error || payload.detail || `HTTP ${response.status}`)
err.errorType = response.status
throw err
```

### 文件：`frontend/src/TavernChatRoom.jsx`

`handleSend` 的 `catch` 块新增 `status = err.errorType` 分支判断：

| errorType | title | message | action |
|-----------|-------|---------|--------|
| `401` | 认证失败 | API 密钥无效或已过期，无法连接到 AI 后端。 | 请店主在 AI 配置中检查 API Key 是否正确。 |
| `403` | 无访问权限 | 没有权限访问该 AI 后端（可能被拒绝或 IP 未白名单）。 | 请店主确认 Base URL 和 API Key 的权限设置。 |
| `429` | 请求过于频繁 | AI 后端限流了，稍等片刻后可重试。 | 降低对话频率，或店主考虑升级 API 配额。 |
| `5xx` | 服务端暂时不可用 | AI 后端服务器出错，请稍后再试。 | 稍后重试；如果持续出现，请店主检查 AI 服务状态。 |
| 其他 | 消息没有送达 | 网络或服务端暂时不可用。（原有行为） | 原有提示。 |

降级提示仍然通过 `setDegradationNotice` 展示（与后端降级响应共用 UI）。

## 没改什么
- 后端未修改 — `tavern_chat_payload` 的降级逻辑（`_degraded_chat_payload`）保持不变，401/403 等 HTTP 层错误仍然由 FastAPI 框架抛出
- 降级消息气泡 UI 未修改
- `buildFallbackReply` 未修改

## 影响文件
| 文件 | 改动类型 |
|------|----------|
| `frontend/src/services/tavernService.js` | 错误处理增强 |
| `frontend/src/TavernChatRoom.jsx` | 差异化错误提示 |
| `docs/CURRENT_TASKS.md` | 状态同步 |

## 验证
- `npm run build` 在 `frontend/` 执行成功（73 modules, JS 316.30 kB, CSS 79.67 kB）

## 风险点
- `err.errorType` 仅在 `readJson` 路径（HTTP 响应非 OK）设置，网络完全断开时 `fetch` 本身抛出的 `TypeError` 没有 `errorType`（走 `其他` 分支），这是预期行为
- 未来后端若把 401/403 改为返回降级 payload（而非抛异常），前端会收到 `{degraded: true, ...}` 而不是抛异常，体验会更好；T5.3 只处理当前现状
