# 鸡舍与草料 v1

## Goal

建立一条克制但完整的畜牧循环：在农场合法位置建设鸡舍/筒仓、饲养基础鸡舍容量内的四只鸡、每日喂养与抚摸、收蛋，并让镰刀割草真正进入草料用途。

## Background

- 当前只有不需喂养的猫/狗家园伙伴；不能复用其单体 pet state 充当生产动物系统。
- current v12 已有镰刀/杂草/植物纤维，但没有 grass、hay、silo、coop、animal produce 或建筑状态。

## Requirements

- 鸡舍和筒仓通过农场建筑 placement mode 在完整合法 footprint 上由玩家选择位置，经过参考建设时间后产生可见外观与可进入空间；不是固定 authored site。
- 基础鸡舍按参考容量容纳 4 只鸡并用三天建成；每只拥有 stable identity、当日喂养/抚摸、基础心情和满足条件后的蛋产出。
- Farm 草地与镰刀产干草只在筒仓有容量时生效；喂养从可见草料库存扣除，不能隐式生成。
- 对齐参考事实：未喂养不会直接死亡，但会降低心情、停止成长或产出；成年且前一天已喂养的鸡每天产蛋。繁殖、野外袭击、大蛋/品质等行为是否进入首版必须在 child PRD 中逐项列为采用或经用户批准的偏离，不能默认删除。

## Acceptance Criteria

- [ ] 玩家能建设筒仓和鸡舍、购买至少一只鸡、割草存干草、喂养/抚摸并在次日收蛋。
- [ ] 动物、草料、建筑和产出在 current save、刷新、跨季与日结失败中保持，单日行为至多结算一次。
- [ ] 猫狗现有 home pet 逻辑与鸡的生产状态互不混用或覆盖。

## Reference Facts

- [Coop](https://stardewvalleywiki.com/Coop)：基础鸡舍 footprint 为 6×3、容量 4、建造三天；建筑位置由玩家在农场内选择。
- [Animals](https://stardewvalleywiki.com/Animals)：生产动物需要所属建筑、每日食物与照料；未喂养影响心情和产出，不是直接死亡规则。
- [Chicken](https://stardewvalleywiki.com/Chickens)：鸡在连续喂养三夜后成年，成年且已喂养时每天产一枚蛋。
- [Silo](https://stardewvalleywiki.com/Silo)：基础筒仓容量 240；普通镰刀在筒仓未满时每格草有 50% 机会存入 1 干草。

## Out of Scope

- 牛羊鸭兔等其他畜种、屠宰、自动喂食、坐骑和通用动物框架。鸡的繁殖、野外袭击与产品品质不在此处预判，留给 child 参考审查。
