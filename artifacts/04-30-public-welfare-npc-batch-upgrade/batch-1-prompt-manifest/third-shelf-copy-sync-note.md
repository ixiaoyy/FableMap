# Batch 1 copy sync note — Third Shelf Observatory

Date: 2026-04-30
Task: `04-30-public-welfare-npc-batch-upgrade`

This note records the first implementation slice after Batch 0 audit and Batch 1 prompt manifest.

## Scope

Updated only `pw_third_shelf_observatory` default seed text so the existing `TavernCharacter` fields carry the species/body-plan decisions that the Batch 1 visual prompt manifest already requires. No schema fields were added. No image files were generated or overwritten in this slice.

## Character body-plan sync

| Character | Body-plan now encoded in seed text/tags |
| --- | --- |
| `char_pw_9_delta` / 社长 9-Delta | 细长身形、多层透明观察镜片、细长手指 |
| `char_pw_mu_mu` / 临时店员 Mu-Mu | 软胶质外星生命、无害触腕、拟态失败店员袖口 |
| `char_pw_v17` / 样本保管员 V-17 | 半机械透明外壳、收据状记忆芯、透明标签抽屉 |
| `char_pw_pi_pi` / 地球礼仪实习生 Pi-Pi | 漂浮外星实习生、短触角、寒暄时触角抖动 |

## Why

The audit flagged the alien convenience tavern as the first rebuild candidate because all four roles still have pending rejected expression assets and the non-realistic theme must not collapse into ordinary human anime portraits. Encoding the body plan in existing text fields keeps visual generation, role behavior, and chat prompts aligned without changing `TavernCharacter` schema.

## Not done

- Did not generate source images.
- Did not replace official sprites under `frontend/public/assets/npcs/public-welfare/`.
- Did not alter rules backend, LLM config, chat persistence, or gameplay definitions.
