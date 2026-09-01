# 声音与环境反馈 MVP：技术设计

## Ownership

- `client/src/audio/AudioDirector.ts`：唯一运行时声音 owner，接收语义 cue、管理脚步轮换、one-shot、区域 loop crossfade、音量和 teardown。
- `client/src/audio/audio-catalog.ts`：只定义已登记不可变 URL、默认增益、loop/cue 分组，不散落路径。
- `client/src/audio/audio-settings.ts`：版本化 non-gameplay preference decoder/repository，key 固定 `mirror-island.audio-settings.v1`。
- `client/src/audio/audio-events.ts`：Vue/session/Phaser 共用的窄语义事件边界；不把 Phaser sound object 放入 Vue store。
- `AudioSettingsPanel.vue`：只渲染/修改已解码设置，不加载音频、不计算混音。
- `WorldScene`：在真实 movement cadence、ActionTimeline impact、region commit/sleep 时发送 cue；不拥有声音文件或音量公式。
- `dispatchLocalGameCommand`：成功 buy/sell/action result 映射到固定 cue；失败不播放成功音。

## Runtime flow

```text
Phaser/Vue/GameSession result
          ↓ semantic AudioCue
     AudioDirector
   ┌──────┴────────┐
 SFX group     Ambience group
   ↓                  ↓
one-shots     current loop → crossfade → next loop
   └──────┬───────────┘
      Master × SFX gain
```

Music gain is decoded and saved but no music sound is created in this stage.

## Audio settings contract

```typescript
interface AudioSettingsV1 {
  version: 1
  master: number
  music: number
  sfx: number
}
```

- Values must be finite and clamped to `[0, 1]`; invalid/unknown payloads fall back to reviewed defaults without failing gameplay.
- Settings contain no identity, save state, secret or URL and may use localStorage independently from IndexedDB gameplay saves.
- Slider change updates current active sounds immediately. A short preview cue only plays for direct user input, never during initialization.

## Cue catalog

| Cue | Trigger owner | Rule |
|---|---|---|
| `footstep-1..3` | WorldScene movement | rotate deterministically at bounded cadence only when position changes |
| `hoe` / `water` / `axe` | ActionTimeline impact | fire once at impact, not windup |
| `stone` | stone hit presentation | catalog exists now; runtime connection may remain dormant until stone action is implemented, but no fake success action |
| `harvest` / `pickup` | successful domain feedback | fire only after mutation success |
| `door` | committed region transition | one cue per transition |
| `buy` / `sell` | successful command result | no cue for insufficient/missing/full failures |
| `dialogue-page` | DialoguePanel page advance | no cue on initial automatic render |
| `sleep` | confirmed fade-out | one cue after confirmation |
| Farm ambience | region `farm` | wind/birds loop |
| Town ambience | region `town` | outdoor bed + low walla loop |
| Lakeshore ambience | region `lakeshore` | water loop |
| Interior ambience | all other regions | room-tone loop |

## Asset selection and processing

- Candidate masters must come from official CC0 pages/archives and be stored outside Git.
- Prefer one compact general SFX archive plus the minimum individual ambience sources; adopt only selected files, not full packs.
- Every transformed output records source URL/ID, original filename/hash, trim range, normalization target, fade/loop treatment, codec settings and final hash.
- Browser delivery uses OGG Vorbis where source masters require conversion. One-shot clips remain short; ambience loops are trimmed to a practical duration with click-free boundaries.
- `game-media-manifest.json` remains the publication source of truth. `prepare-media.mjs` downloads exact final bytes from immutable CDN keys and writes ignored local runtime copies.
- Existing homepage hero media changes are concurrent user work. Audio additions must extend current arrays/counts/allowlists without rewriting or reverting hero entries.

## Lifecycle and failure

- AudioDirector binds once after Phaser scene creation, resumes on a direct user gesture and disposes all sound/tween/event listeners on scene shutdown/HMR.
- Missing/failed audio assets set a retryable client status and skip only affected cues; new/continue game remains usable.
- Starting the same ambience group twice reuses/crossfades rather than stacking duplicate loops.
- `prefers-reduced-motion` does not mute audio. Mute/volume are explicit user settings only.

## Human handoff

Agent completion proves files, hashes, load paths, trigger branches, cleanup and static checks. 真人验收清单负责：实际音色、相对响度、循环接缝、盲听地点区分、扬声器/耳机、手机与浏览器 autoplay 手感。

