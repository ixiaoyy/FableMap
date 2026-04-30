# Batch 2 generated assets manifest

This artifact records the final pending rejected-expression cleanup slice for `04-30-public-welfare-npc-batch-upgrade`.

## Scope

- Target shops: `pw_after_school_hero_supply`, `pw_lantern_helpdesk`, `pw_lost_found_archive`, `pw_midnight_treehole`.
- Target characters: `char_pw_xiaozhou`, `char_pw_anlan`, `char_pw_wenjian`, `char_pw_zhijian`
- Generated/replaced expressions: `neutral`, `joy`, `anger`, `embarrassment`, `curiosity`
- Final project path pattern: `frontend/public/assets/npcs/public-welfare/<char_id>/<expression>.png`.
- Source prompt manifest: `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-prompt-manifest/public-welfare-batch-2-prompt-manifest.json`.
- Contact sheet: `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/batch-2-final-contact-sheet.png`.
- Reusable style recipes recorded in `.agents/skills/generate-character-prompt/references/style-recipes.md` sections 21–24.

## Method

Deterministic project-local PIL renderer based on the approved Batch 2 Prompt-as-Code manifest; no external IP, logos, readable real text, or private data. Source/reference images are 512×512; runtime sprites are 256×256 PNG.

## Asset records

| Character | Expression | Source | Target | Old SHA | New SHA | Rejected hash after rebuild? |
| --- | --- | --- | --- | --- | --- | --- |
| `char_pw_xiaozhou` | `neutral` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_xiaozhou/neutral-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/neutral.png` | `498abceb488b` | `5d1f60d3de36` | `False` |
| `char_pw_xiaozhou` | `joy` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_xiaozhou/joy-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/joy.png` | `d2b18c8f2abd` | `3084c6b57c92` | `False` |
| `char_pw_xiaozhou` | `anger` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_xiaozhou/anger-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/anger.png` | `9ea246cc97ab` | `008d197fda8a` | `False` |
| `char_pw_xiaozhou` | `embarrassment` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_xiaozhou/embarrassment-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/embarrassment.png` | `9a544b877c55` | `ed22814ba62c` | `False` |
| `char_pw_xiaozhou` | `curiosity` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_xiaozhou/curiosity-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_xiaozhou/curiosity.png` | `3b0b7ef8a95c` | `00135c484c06` | `False` |
| `char_pw_anlan` | `neutral` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_anlan/neutral-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_anlan/neutral.png` | `46df6bcdbb0e` | `dc3e68164c93` | `False` |
| `char_pw_anlan` | `joy` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_anlan/joy-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_anlan/joy.png` | `5119707e78bd` | `69a562075f76` | `False` |
| `char_pw_anlan` | `anger` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_anlan/anger-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_anlan/anger.png` | `bdcfc637e79d` | `123bd097e383` | `False` |
| `char_pw_anlan` | `embarrassment` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_anlan/embarrassment-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_anlan/embarrassment.png` | `3d7c717241d8` | `475b6abbb307` | `False` |
| `char_pw_anlan` | `curiosity` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_anlan/curiosity-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_anlan/curiosity.png` | `f5383d853e84` | `dd3775085664` | `False` |
| `char_pw_wenjian` | `neutral` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_wenjian/neutral-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/neutral.png` | `c8c1b127188d` | `26849c02497e` | `False` |
| `char_pw_wenjian` | `joy` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_wenjian/joy-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/joy.png` | `8bf666489d25` | `c2042acbaba0` | `False` |
| `char_pw_wenjian` | `anger` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_wenjian/anger-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/anger.png` | `f102e3148ae4` | `010f3dba8038` | `False` |
| `char_pw_wenjian` | `embarrassment` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_wenjian/embarrassment-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/embarrassment.png` | `03d6a39cc243` | `03408df0d167` | `False` |
| `char_pw_wenjian` | `curiosity` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_wenjian/curiosity-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_wenjian/curiosity.png` | `71f2e6cecc42` | `aca407075a86` | `False` |
| `char_pw_zhijian` | `neutral` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_zhijian/neutral-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/neutral.png` | `662a4f0839f0` | `91e34012ab4e` | `False` |
| `char_pw_zhijian` | `joy` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_zhijian/joy-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/joy.png` | `a8819aa579fd` | `4327bf5fd14a` | `False` |
| `char_pw_zhijian` | `anger` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_zhijian/anger-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/anger.png` | `22132438673d` | `ad290c17a8a0` | `False` |
| `char_pw_zhijian` | `embarrassment` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_zhijian/embarrassment-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/embarrassment.png` | `579bcebc9394` | `b37429667947` | `False` |
| `char_pw_zhijian` | `curiosity` | `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/sources/char_pw_zhijian/curiosity-source.png` | `frontend/public/assets/npcs/public-welfare/char_pw_zhijian/curiosity.png` | `15efe92a777f` | `259f71daf88a` | `False` |

## Old asset backups

Previous project sprites for this batch were copied to `artifacts/04-30-public-welfare-npc-batch-upgrade/batch-2-generated-assets/old-assets/` before overwrite.
