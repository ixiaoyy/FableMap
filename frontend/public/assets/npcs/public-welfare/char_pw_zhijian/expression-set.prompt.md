---
prompt_scope: npc-expression-set
asset_group: frontend/public/assets/npcs/public-welfare/char_pw_zhijian/
assets: frontend/public/assets/npcs/public-welfare/char_pw_zhijian/neutral.png; frontend/public/assets/npcs/public-welfare/char_pw_zhijian/joy.png; frontend/public/assets/npcs/public-welfare/char_pw_zhijian/anger.png; frontend/public/assets/npcs/public-welfare/char_pw_zhijian/embarrassment.png; frontend/public/assets/npcs/public-welfare/char_pw_zhijian/curiosity.png
expressions: neutral, joy, anger, embarrassment, curiosity
asset_count: 5
prompt_type: original-final
source_type: prompt-manifest
source_manifest: artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-prompt-manifest/public-welfare-batch-2-prompt-manifest.json
character_id: char_pw_zhijian
widths: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
heights: neutral=256; joy=256; anger=256; embarrassment=256; curiosity=256
sha256s: neutral=91e34012ab4ed490ff9b1942b942b1befc07fe32dffb6ae61ba813631bbea2e1; joy=4327bf5fd14a3fbdbd6797a2f389cbfad0ca0a66e3e9c387a65e2f7020a2a57e; anger=ad290c17a8a0a1f12f737ea5a21c76fa6fb5685bc5afb652f7be6ccc225ebc69; embarrassment=b37429667947d8078d18542a6f2e6d1df7d247e1edc48c3c2c53e5593ccb7df2; curiosity=259f71daf88a6d09b0503c383236539628ca4010e2c082c39d72c911418aa31c
updated_at: 2026-05-03
can_regenerate_higher_quality: true
---

## Final prompt

Generate exactly one square NPC portrait image: one character, one natural/neutral expression, not a contact sheet, not a multi-panel grid, not an expression sheet, not five faces, and not multiple expressions in one image.

Create a finished original FableMap cyber-tavern NPC square portrait sprite for 纸剑 (char_pw_zhijian). Subject identity: small harmless paper-shadow child echo, folded-paper silhouette, translucent edge, origami sword. Identity locks: folded-paper silhouette, harmless origami sword, old hero-card sleeve, sunset drawer reflection. Signature prop: folded paper sword and blank hero-card sleeve. The portrait is visibly inside pw_after_school_hero_supply with tavern/service cues: bar or service counter, cups, shelves, lantern/task light, map-table or coordinate card. Style DNA: after-school sticker toybox riso portrait, paper-shadow magical realism without horror; palette and light: sunset cream, hero-card red, schoolbag blue, paper-white silhouette, golden after-school glow / soft toy-shop light; medium/texture: sticker edges, riso grain, folded-paper shadow, old hero-card frames, abstract badge shapes. Anti-repetition rule: not battle RPG; not ghost horror; paper sword must be harmless and childhood-memory oriented. Composition: square waist-up or half-body portrait, clear face and expression, foreground prop depth cue, background tavern rhythm, no centered same-face template. No readable text except simulated abstract marks; no logo, no watermark, no existing IP, no living-artist imitation, no private data, no API keys.

Expression suffix (neutral): neutral expression, attentive but relaxed, mouth closed or soft small smile, readable tavern-service body language

## Expression assets

- `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/neutral.png` — `neutral`
- `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/joy.png` — `joy`
- `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/anger.png` — `anger`
- `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/embarrassment.png` — `embarrassment`
- `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/curiosity.png` — `curiosity`

## Negative constraints

- No readable brand text, logo, watermark, or existing IP imitation.
- No living-artist imitation and no private data, API keys, visitor secrets, or exact private addresses.
- Preserve FableMap tavern meaning: real-place anchor, owner-authored content, AI NPC/chat/memory support.
- Do not create a contact sheet, multi-panel grid, expression sheet, five faces, or multiple expressions in one image.

## Style recipe / Style DNA source

- style_family: after-school sticker toybox riso portrait, paper-shadow magical realism without horror; palette_light: sunset cream, hero-card red, schoolbag blue, paper-white silhouette, golden after-school glow / soft toy-shop light; material_system: sticker edges, riso grain, folded-paper shadow, old hero-card frames, abstract badge shapes; anti_repetition: not battle RPG; not ghost horror; paper sword must be harmless and childhood-memory oriented

## Identity locks

- folded-paper silhouette
- harmless origami sword
- old hero-card sleeve
- sunset drawer reflection
- signature prop: folded paper sword and blank hero-card sleeve

## Provenance notes

This expression-set sidecar records original final prompts or prompt-manifest reconstructions for the grouped NPC sprite set.

The reusable generation prompt above intentionally uses only `neutral` / natural expression. Other expressions are listed only for provenance coverage and should be generated one at a time by changing the expression suffix.

- Reconstructed from the public-welfare batch prompt manifest before sidecar rollout.
