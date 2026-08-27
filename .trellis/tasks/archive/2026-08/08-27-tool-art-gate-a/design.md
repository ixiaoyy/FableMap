# 技术设计

## Candidate boundary

Gate A 只建立显式本地候选表现层：

```text
GameSession snapshot / current FarmTile phase
        ↓ read-only projection
WorldScene candidate tool renderer    Hotbar candidate icon renderer
        ↓                              ↓
Vecto plowing / HelloRumin overlay     GARDENS full original sheet frames
```

- Domain command、GameState、StoredGame、ItemDefinition 和 TMJ 均不包含 texture key、URL 或 frame。
- 默认启动路径继续使用当前汉字 Hotbar 与 Phaser code-drawn placeholder。
- 只有 `import.meta.env.DEV` 且显式 query 开关存在时加载 ignored 本地候选原图；生产 build 中开关恒为关闭。
- `?toolArt=preview` 在 dev 环境使用固定隔离 owner key `tool-art-preview` 自动创建 Farm，绕过本地缺失的 Keycloak proxy；它仍只使用现有 IndexedDB adapter，且 production build 中不可启用。旧双参数形式继续兼容，但不再作为人工验收入口。
- 候选图片不进入 Git、manifest、CDN 或正式公网部署。

## Official original inputs

| Role | Source | Original file | License |
|---|---|---|---|
| Hoe character action | VectoRaith Farming Sim v1.08 | `!$farmer_plowing.png` 96×128 | existing custom project-use license |
| Axe/watering overlay | HelloRumin Pixel Farm | `PixelFarm_Tool Animation-Sheet.png` 192×192 | free commercial/custom license; no redistribution/resale |
| Hotbar tools/seed | IvoryRed GARDENS | full original GARDENS PNG, native 16×16 cells | CC-BY 4.0 |
| Crop/wood visuals | current VectoRaith crops/details sheets | existing full originals | existing custom project-use license |

The complete source sheets are served unchanged. Phaser/Vue may select frame rectangles at runtime; no physical crop, atlas repack, resize or re-encode is produced.

## Action selection

- `playTreeAction` always projects the axe candidate overlay.
- `playFarmAction` reads the pre-command `FarmTileState.phase` from the latest immutable snapshot:
  - `untilled` → VectoRaith plowing sheet;
  - `tilled` → seed/planting indicator only;
  - `growing` → HelloRumin watering overlay;
  - `mature` → crop pickup/harvest pulse, no invented scythe.
- The existing `ActionTimeline` remains the only windup/impact/recovery owner; impact dispatch still occurs exactly once.
- Visual frame completion/failure cannot alter the command result or save state.

## Hotbar projection

- Add a client-only mapping from current `ItemId` to candidate icon source/frame.
- Axe/hoe/watering/turnip seed use reviewed GARDENS frames when available.
- Turnip and wood continue to select runtime frames from the already loaded VectoRaith crops/details/orchard sources, or remain text if no legible 16×16 frame exists; Gate A must not fabricate coverage.
- The accessible item name and quantity remain text; icons do not replace labels or become domain data.

## Local candidate files

- Official ZIPs and source images are downloaded only from the reviewed itch.io author pages.
- Source ZIP hashes and exact selected-file hashes are recorded under task research.
- Ignored runtime cache target: `apps/mirror-island/public/tool-art-candidate/`.
- Ignored screenshot target: `artifacts/tool-art-gate-a/`.
- A tracked `.gitignore` entry prevents accidental image commits.

## License delivery

- Gate A local prototype carries a draft credit note for HelloRumin and mandatory CC-BY 4.0 credit for IvoryRed/GARDENS.
- A later production adoption must update image asset docs, NOTICE and immutable media manifest before CDN upload.
- Gate A does not claim Web/CDN distribution approval for any new candidate.

## Failure and rollback

- Missing candidate file under the explicit dev flag → visible candidate error; never fall back silently and present a misleading screenshot.
- Default/no flag → byte-for-byte existing runtime behavior.
- Rejecting the visual candidate removes the client-only candidate code and ignored cache; GameSession/save/map remain untouched.
