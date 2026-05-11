import sys

path = 'docs/WORLD_SCHEMA.md'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Replace lines 256-260 (0-indexed: 255-259)
# Current:
# 256:   appearance: dict[str, Any];    // 角色长相/外貌 preset 信息
# 257:   talkativeness: float;          // 0.0-1.0，群聊发言积极度
# 258: }
# 259:   sprites?: TavernSpriteSet;     // 表情精灵图
# 260: }

new_fields = [
    "  appearance: dict[str, Any];    // 角色长相/外貌 preset 信息\n",
    "  talkativeness: float;          // 0.0-1.0，群聊发言积极度\n",
    "\n",
    "  // ── 仿真与流动 (v0.9) ──────────────\n",
    "  current_tavern_id: string;     // 当前所在空间 ID（支持跨空间流动）\n",
    "  home_tavern_id: string;        // 初始锚点空间 ID（默认出生地）\n",
    "  simulation_state?: NpcSimulationState; // 生理与心理状态\n",
    "  traits: NpcTrait[];            // 性格特质枚举\n",
    "}\n"
]

lines[255:260] = new_fields

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Schema updated successfully via line index.")
