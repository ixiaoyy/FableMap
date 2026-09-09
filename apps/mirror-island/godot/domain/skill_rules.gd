class_name FarmSkillRules
extends RefCounted
## 首批已核实劳动的累计经验、即时等级和日结升级记录；不拥有另一份会话状态。

const NAMES := {"farming":"种植","foraging":"采集","mining":"采矿"}
const THRESHOLDS := [100,380,770,1300,2150,3300,4800,6900,10000,15000]
const TOOL_SKILLS := {"hoe":"farming","watering-can":"farming","axe":"foraging","pickaxe":"mining"}

## 根据非负累计经验返回 0–10 级；超过十级门槛仍保留经验，不代替精通系统。
static func level_for(xp: int) -> int:
	var level:=0
	for threshold: int in THRESHOLDS:
		if xp<threshold: break
		level+=1
	return level

## 给成功劳动的同一候选增加经验并即时升级；调用方负责完整产物检查和候选保存。
static func gain(state: Dictionary, skill: String, amount: int) -> void:
	var progress: Dictionary=state.skills[skill]
	progress.xp+=amount
	progress.level=level_for(int(progress.xp))

## 返回日结等级差并更新展示记录，不表示已领取配方或职业；结果随报告保存，重试不得再次调用。
static func settle_day(state: Dictionary) -> Array:
	var upgrades: Array=[]
	for id: String in NAMES:
		var progress: Dictionary=state.skills[id]
		if progress.level>progress.reportedLevel:
			upgrades.append({"skill":id,"from":progress.reportedLevel,"to":progress.level})
			progress.reportedLevel=progress.level
	return upgrades

## 列出已达等级但尚未学会的实际配方；仅供夜间报告，确认保存后才进入已知配方。
static func recipe_unlocks(state: Dictionary, recipes: Dictionary) -> Array:
	var result: Array=[]
	for id: String in recipes:
		var recipe: Dictionary=recipes[id]
		if id not in state.knownRecipes and not recipe.knownByDefault and state.skills[recipe.skill].level>=recipe.level: result.append(id)
	return result
