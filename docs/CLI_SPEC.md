# FableMap CLI 设计草案 v0.1

## 目标

CLI 是 FableMap 第一阶段的核心交付物。

它的任务是把：

> 输入坐标 -> 拉取地图数据 -> 生成世界 JSON -> 写入本地文件

做成一个稳定、可重复执行的开发入口。

## 命令形式

建议主命令：

- `fablemap generate`
- `fablemap inspect`
- `fablemap cache`

## 1. generate

用途：根据坐标生成一个世界描述 JSON。

建议参数：

- `--lat`：纬度
- `--lon`：经度
- `--radius`：搜索半径，默认 300 米
- `--output`：输出文件路径
- `--seed`：可选种子
- `--refresh`：忽略缓存，强制重新生成

示例：

- `fablemap generate --lat 51.5237 --lon -0.1585 --radius 300 --output examples/baker_street.json`

## 2. inspect

用途：查看某个已生成世界文件的摘要信息。

建议参数：

- `--input`：世界 JSON 路径

输出建议：

- 世界 ID
- 区域主题
- POI 数量
- 地标数量
- 状态版本

## 3. cache

用途：管理本地世界记忆缓存。

建议子命令：

- `fablemap cache list`
- `fablemap cache show --world-id ...`
- `fablemap cache clear`

## 退出码建议

- `0`：成功
- `1`：通用错误
- `2`：参数错误
- `3`：网络请求失败
- `4`：Schema 校验失败
- `5`：持久化失败

## generate 输出要求

生成命令至少需要完成以下步骤：

1. 验证参数
2. 拉取 OSM 数据
3. 标准化 OSM 实体
4. 映射为世界 Schema
5. 与本地记忆层合并
6. 写出 JSON 文件
7. 返回摘要信息

## 第一版实现建议

建议目录：

- `tools/geo_parser/`
- `tools/world_builder/`
- `tools/memory/`
- `tools/cli/`

建议入口：

- `python -m fablemap generate ...`

或后续安装后支持：

- `fablemap generate ...`