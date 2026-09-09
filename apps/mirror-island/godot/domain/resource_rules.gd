class_name FarmResourceRules
extends RefCounted
## 采集与农田规则的 GDScript 实现；不包含动画、输入和保存。

var world: FarmWorldRules
var inventory: FarmInventory
var crops: Dictionary = {}
var seeds: Dictionary = {}

## 绑定共享库存与地图，复用世界的作物定义并索引种子；不复制另一份内容规则。
func _init(world_rules: FarmWorldRules, inventory_rules: FarmInventory) -> void:
	world=world_rules
	inventory=inventory_rules
	crops=world.crops
	for crop: Dictionary in crops.values():
		seeds[crop.seedId]=crop

## 判断当前角色是否位于相邻格且处于四十二像素范围内。
func near_tile(state: Dictionary, column: int, row: int) -> bool:
	return column>=0 and row>=0 and absi(floori(state.player.x/16.0)-column)<=1 and absi(floori(state.player.y/16.0)-row)<=1 and FarmWorldRules.point(state.player).distance_to(Vector2(column*16+8,row*16+8))<=42

## 对候选农田使用工具、种子或空手，返回结果码；actors 为当前居民，架子不得种在角色脚下。
func farm(state: Dictionary, column: int, row: int, item_id: String, direction: String, actors: Array = []) -> String:
	if state.player.regionId!="farm" or not near_tile(state,column,row): return "too-far"
	if item_id!="" and inventory.quantity(state.inventory,item_id)<1: return "no-effect"
	if FarmWorldRules.covers(state,"farm",column,row): return "no-effect"
	var id := "farm:%d:%d"%[column,row]
	if not state.farmTiles.has(id):
		if item_id!="hoe": return "missing-tile"
		if not world.mask("farm","tillableTiles",column,row): return "missing-tile"
		for spawn: Dictionary in world.regions.farm.resources:
			if floori(spawn.x/16.0)==column and floori(spawn.y/16.0)==row and state.resources.has(spawn.entityId) and state.resources[spawn.entityId].phase!="cleared": return "missing-tile"
		if not FarmEnergyRules.spend(state,"hoe"): return "insufficient-stamina"
		state.farmTiles[id]={"id":id,"column":column,"row":row,"phase":"tilled","cropId":"","growthDays":0,"watered":state.weather.current=="rain","plantedDay":0,"harvestCount":0}
		return "tilled"
	var tile: Dictionary=state.farmTiles[id]
	if seeds.has(item_id) and tile.phase=="tilled":
		if seeds[item_id].get("isRaised",false):
			var cell:=Vector2i(column,row)
			if FarmWorldRules.feet_overlap(FarmWorldRules.point(state.player),cell,Vector2(5,4)): return "trellis-occupied"
			for actor: Dictionary in actors:
				if actor.regionId=="farm" and FarmWorldRules.feet_overlap(FarmWorldRules.point(actor),cell,Vector2(5,3)): return "trellis-occupied"
		if not inventory.consume(state.inventory,item_id,1): return "no-effect"
		tile.merge({"phase":"growing","cropId":seeds[item_id].cropId,"growthDays":0,"watered":tile.watered or state.weather.current=="rain","plantedDay":state.day,"harvestCount":0},true)
		return "planted"
	if item_id=="axe" and crops.get(tile.cropId,{}).get("isRaised",false):
		if not FarmEnergyRules.spend(state,"axe"): return "insufficient-stamina"
		tile.merge({"phase":"tilled","cropId":"","growthDays":0,"plantedDay":0,"harvestCount":0},true)
		return "crop-cleared"
	if item_id=="watering-can" and tile.phase in ["growing","tilled"]:
		var eligible: Array=[]
		var vector: Vector2=FarmWorldRules.VECTORS.get(direction,Vector2.DOWN)
		for offset in range(3 if state.wateringCanLevel==2 and direction!="" else 1):
			var x := column+int(vector.x)*offset
			var y := row+int(vector.y)*offset
			var key := "farm:%d:%d"%[x,y]
			if not world.mask("farm","tillableTiles",x,y) or FarmWorldRules.covers(state,"farm",x,y) or not state.farmTiles.has(key): break
			var candidate: Dictionary=state.farmTiles[key]
			if candidate.phase!="mature" and not candidate.watered: eligible.append(candidate)
		if eligible.is_empty(): return "waiting"
		var energy_uses:=floori(float(state.stamina)/FarmEnergyRules.unit_cost(state,"watering-can"))
		var affordable := mini(eligible.size(),mini(int(state.wateringCanWater),energy_uses))
		if affordable<=0: return "empty-watering-can" if state.wateringCanWater<=0 else "insufficient-stamina"
		# Lv2 仍逐格计水和熟练度耗能，不能当作原作铜壶蓄力。
		if not FarmEnergyRules.spend(state,"watering-can",affordable): return "insufficient-stamina"
		for index in range(affordable): eligible[index].watered=true
		state.wateringCanWater-=affordable
		return "watered"
	if item_id=="" and tile.phase=="mature":
		var crop: Dictionary=crops[tile.cropId]
		if crop.get("harvestTool","")=="scythe": return "requires-scythe"
		var amount:=harvest_amount(state,tile,crop)
		if not inventory.add(state.inventory,tile.cropId,amount): return "inventory-full"
		_finish_harvest(state,tile,crop)
		return "harvested"
	return "no-effect"

## 返回同一地块本次基础产量；几何分布反函数替代无界连抽，稳定键确保满包或保存重试不重抽。
func harvest_amount(state: Dictionary, tile: Dictionary, crop: Dictionary) -> int:
	var chance: float=crop.get("extraHarvestChance",0.0)
	if chance==0.0: return 1
	var key: String="%s:%d:%d:crop-extra"%[tile.id,tile.plantedDay,tile.harvestCount]
	var value: int=FarmWorldRules.stable_hash(state.worldSeed,tile.plantedDay,key)
	# 半个步长使均匀值严格位于 (0,1)，避免 log(0)；当前可信内容仅有土豆 0.2。
	var uniform: float=(float(value)+0.5)/4294967296.0
	return 1+floori(log(uniform)/log(chance))

## 产物完整入包后授予一次收获经验并更新地块，保留复收与雨天浇水；不保存或重复发放产物。
func _finish_harvest(state: Dictionary, tile: Dictionary, crop: Dictionary) -> void:
	FarmSkillRules.gain(state,"farming",int(crop.harvestXp))
	if crop.get("regrowDays",0)>0:
		tile.harvestCount+=1
		tile.phase="growing"
		tile.growthDays=maxi(0,int(crop.growthDays)-int(crop.regrowDays))
	else:
		tile.merge({"phase":"tilled","cropId":"","growthDays":0,"plantedDay":0,"harvestCount":0},true)
	tile.watered=tile.watered or state.weather.current=="rain"

## 按朝向挥镰刀并返回结果码；暂用四十二像素、混合目标合计三个，满包整次无变化且不耗体力。
func sweep_scythe(state: Dictionary, direction: String) -> String:
	if inventory.quantity(state.inventory,"scythe")<1: return "wrong-tool"
	if not FarmWorldRules.VECTORS.has(direction): return "wrong-direction"
	var origin:=FarmWorldRules.point(state.player)
	var targets: Array[Dictionary]=[]
	for spawn: Dictionary in world.regions[state.player.regionId].resources:
		if spawn.kind=="weed" and state.resources[spawn.entityId].phase=="standing":
			var position:=FarmWorldRules.point(spawn)
			if origin.distance_to(position)<=42 and FarmWorldRules.in_sector(origin,position,direction):
				targets.append({"id":spawn.entityId,"position":position,"crop":false})
	if state.player.regionId=="farm":
		for tile: Dictionary in state.farmTiles.values():
			if tile.phase!="mature" or crops.get(tile.cropId,{}).get("harvestTool","")!="scythe": continue
			var position:=Vector2(tile.column*16+8,tile.row*16+8)
			if origin.distance_to(position)<=42 and FarmWorldRules.in_sector(origin,position,direction) and not FarmWorldRules.covers(state,"farm",tile.column,tile.row):
				targets.append({"id":tile.id,"position":position,"crop":true})
	targets.sort_custom(func(a: Dictionary,b: Dictionary)->bool:
		var da:=origin.distance_squared_to(a.position); var db:=origin.distance_squared_to(b.position)
		return a.id<b.id if is_equal_approx(da,db) else da<db)
	targets=targets.slice(0,3)
	if targets.is_empty(): return "no-effect"
	var slots: Array=state.inventory.duplicate(true)
	var harvested:=false
	for target: Dictionary in targets:
		if target.crop:
			if not inventory.add(slots,state.farmTiles[target.id].cropId,1): return "inventory-full"
			harvested=true
		elif FarmWorldRules.stable_hash(state.worldSeed,state.day,"weed-fiber:"+target.id)%2==0:
			if not inventory.add(slots,"fiber",1): return "inventory-full"
	state.inventory=slots
	for target: Dictionary in targets:
		if target.crop:
			var tile: Dictionary=state.farmTiles[target.id]
			_finish_harvest(state,tile,crops[tile.cropId])
		else: state.resources[target.id].phase="cleared"
	return "harvested" if harvested else "cut"

## 水源补水无体力消耗，仍要求拥有水壶和相邻范围。
func refill(state: Dictionary, column: int, row: int) -> String:
	if inventory.quantity(state.inventory,"watering-can")<1 or not world.mask(state.player.regionId,"waterTiles",column,row): return "no-effect"
	if not near_tile(state,column,row): return "too-far"
	var capacity := 20 if state.wateringCanLevel==1 else 40
	if state.wateringCanWater>=capacity: return "no-effect"
	state.wateringCanWater=capacity
	return "refilled"

## 处理树木、石头、杂草和野采目标，所有产出先检查容量。
func gather(state: Dictionary, target_id: String, item_id: String, direction: String) -> String:
	var spawn: Dictionary=world.resources.get(target_id,{})
	if spawn.is_empty() or spawn.regionId!=state.player.regionId: return "missing-target"
	if FarmWorldRules.point(state.player).distance_to(FarmWorldRules.point(spawn))>42: return "too-far"
	if spawn.kind in ["spring-wildflower","bamboo-shoot","fallen-branch"]:
		if item_id!="" or spawn not in world.active_forage(state,spawn.regionId): return "inactive"
		var output: String="wood" if spawn.kind=="fallen-branch" else spawn.kind
		if not inventory.add(state.inventory,output,1): return "inventory-full"
		state.dailyForage.collectedIds.append(target_id)
		return "collected"
	var resource: Dictionary=state.resources.get(target_id,{})
	if resource.is_empty() or resource.phase=="cleared": return "depleted"
	var tool: String={"tree":"axe","stone":"pickaxe","weed":"scythe"}[spawn.kind]
	if item_id!=tool or inventory.quantity(state.inventory,tool)<1: return "wrong-tool"
	if spawn.kind=="weed":
		if not FarmWorldRules.in_sector(FarmWorldRules.point(state.player),FarmWorldRules.point(spawn),direction): return "wrong-direction"
		return sweep_scythe(state,direction)
	var amount := 3 if spawn.kind=="tree" and resource.phase=="standing" else 1
	var output := "wood" if spawn.kind=="tree" else "stone"
	if not inventory.can_add(state.inventory,output,amount): return "inventory-full"
	if not FarmEnergyRules.spend(state,tool): return "insufficient-stamina"
	FarmSkillRules.gain(state,"mining" if spawn.kind=="stone" else "foraging",1 if spawn.kind=="stone" else 14 if resource.phase=="standing" else 2)
	resource.phase="stump" if spawn.kind=="tree" and resource.phase=="standing" else "cleared"
	resource.regrowOnDay=state.day+7 if spawn.kind=="tree" and resource.phase=="cleared" and spawn.regionId!="farm" else null
	inventory.add(state.inventory,output,amount)
	return "mined" if spawn.kind=="stone" else "chopped" if resource.phase=="stump" else "stump-cleared"

## 结算浇水后的生长并清除浇水标记；日增在会话中只执行一次。
func settle_crops(state: Dictionary) -> void:
	for tile: Dictionary in state.farmTiles.values():
		if tile.phase=="growing" and tile.watered:
			tile.growthDays+=1
			if tile.growthDays>=crops[tile.cropId].growthDays: tile.phase="mature"
		tile.watered=false

## 在已递增的日期恢复原数量资源；建筑占用不累积补偿名额。
func regenerate(state: Dictionary) -> void:
	for resource: Dictionary in state.resources.values():
		var spawn: Dictionary=world.resources[resource.id]
		if resource.kind=="tree" and resource.phase=="cleared" and resource.regrowOnDay!=null and resource.regrowOnDay<=state.day and not FarmWorldRules.covers(state,spawn.regionId,floori(spawn.x/16.0),floori(spawn.y/16.0)):
			resource.phase="standing"; resource.regrowOnDay=null
	for rule in [["stone","foothills",2,"surface-stone:"],["weed","farm",1,"surface-weed:"],["weed","foothills",2,"surface-weed:"],["weed","lakeshore",1,"surface-weed:"]]:
		var field := "lastSurfaceStoneRefreshDay" if rule[0]=="stone" else "lastSurfaceWeedRefreshDay"
		if state[field]==state.day: continue
		var candidates: Array=[]
		for spawn: Dictionary in world.regions[rule[1]].resources:
			if spawn.kind!=rule[0] or state.resources[spawn.entityId].phase!="cleared": continue
			var x:=floori(spawn.x/16.0); var y:=floori(spawn.y/16.0)
			if FarmWorldRules.covers(state,rule[1],x,y) or (rule[0]=="weed" and rule[1]=="farm" and state.farmTiles.has("farm:%d:%d"%[x,y])): continue
			candidates.append(spawn)
		candidates.sort_custom(func(a: Dictionary,b: Dictionary)->bool:
			var ha:=FarmWorldRules.stable_hash(state.worldSeed,state.day,rule[3]+a.entityId); var hb:=FarmWorldRules.stable_hash(state.worldSeed,state.day,rule[3]+b.entityId)
			return a.entityId<b.entityId if ha==hb else ha<hb)
		for spawn: Dictionary in candidates.slice(0,rule[2]): state.resources[spawn.entityId].phase="standing"
	state.lastSurfaceStoneRefreshDay=state.day
	state.lastSurfaceWeedRefreshDay=state.day
