# IndexedDB 方案评审

## 候选：idb

- 官方包：`idb`
- 当前稳定版本：`8.0.3`
- 官方仓库：`https://github.com/jakearchibald/idb`
- 许可证：ISC
- 能力：对 IndexedDB request、transaction 和 schema upgrade 提供轻量 Promise 封装。

## 结论

暂不采用。项目默认许可证 allowlist 未包含 ISC，且当前只需要一个 object store、四个 repository 方法和一个升级回调。接入新依赖的许可评审/升级成本高于受控原生薄层。

## 原生实现边界

- 只封装 `open`、单 store transaction、request Promise 和 transaction completion。
- 不建设通用 IndexedDB ORM、查询 DSL、migration 框架或多 store abstraction。
- 所有存档结构验证仍归 domain decoder，adapter 不以类型断言信任数据库值。
