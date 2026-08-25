# 技术设计

## Direct original media

| Runtime key | Official file | Size | Bytes | SHA-256 |
|---|---|---:|---:|---|
| terrain | `vectoraith_tileset_farmingsims_terrain_spring_expanded.png` | 256×256 | 21,694 | `e86e6c9b5f003b0e74a7cbac261cd89df2bd56a0df6af90c6cd08e046a9dbffa` |
| buildings | `vectoraith_tileset_farmingsims_buildings.png` | 256×256 | 16,502 | `cf4670e091ab1a4e6b84b7f88c96de7304f33730c54fc9f6956f1051bf07b69a` |
| details | `vectoraith_tileset_farmingsims_details.png` | 256×256 | 27,372 | `d0e32b626904506b027ce9cb7eb4fb1ac5a70fe74572bdea75983cd06c728c9e` |
| orchard | `vectoraith_tileset_farmingsims_orchard.png` | 256×256 | 11,487 | `5488f4107c9bb136e057be2f1b95a6b3688d80026f295b940bd057e3396788fb` |
| crops | `vectoraith_tileset_farmingsims_crops.png` | 256×256 | 13,655 | `ac174d7c0a45afb6525f1210f06fad86d6fce1112f5ced5d5f472590fe6d3d61` |
| farmer | `$farmer.png` | 48×128 | 3,059 | `85fe4b7350f2ccf9a6225c2bec6fe1bc9f5dfa00909605cc4ec3962d1c006f08` |

- CDN keys preserve original filenames under `farming-sim-v1.08/original/16x16/`.
- Farm/Town tile bindings share terrain/buildings/details. Entity frames load orchard/crops additionally.
- Farm original firstgids remain terrain=1、buildings=257、details=513。
- Direct entity coordinates:
  - tree: orchard col 5 row 0, 3×3
  - stump: details col 5 row 5, 3×1
  - rock: details col 1 row 4, 3×2
  - crop growing/mature: crops col 5/7 row 1
  - soil: terrain col 1 row 3

## Safe migration and deletion

```text
push original-key publisher allowlist
  -> upload 6 exact official PNG
  -> verify CDN SHA/dimensions/cache
  -> switch manifest/runtime/Farm TMJ
  -> deploy and compare Farm
  -> exact-delete 5 retired derivative CDN keys
  -> delete local packed outputs and builder
```

- 删除工作流只接受 5 个 retired object keys，并在删除前确认 6 个 original keys 均存在。
- 不递归删除 VectoRaith prefix；不触碰 Ninja、game/ 其他对象或官方 Original 本地目录。

## Town Gate A composition

```text
Farm west gate
    → 2–3 tile main street
    → small central square
       ├─ Seed Shop (functional exterior)
       ├─ residence / inn facade
       └─ workshop / tea-house facade
```

- 使用原始 full tileset 直接在 ignored candidate TMJ 选 tile。
- Gate A 可以移动 Town 对象坐标但不能改 `west-gate`、`seed-shop-door`、`town-west-exit`、`town-seed-shop-entry`、`town-seed-shop-door`。
- Collision 只围住建筑、水体/边界并保证 Farm→Town→Seed Shop 往返。
