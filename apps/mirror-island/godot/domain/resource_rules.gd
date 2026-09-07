class_name FarmResourceRules
extends RefCounted
## 采集与农田规则的 GDScript 实现；不包含动画、输入和保存。

var world: FarmWorldRules
var inventory: FarmInventory
var crops: Dictionary = {}
var seeds: Dictionary = {}

## 绑定共享库存与地图，并索引六种原春作。
func _init(world_rules: FarmWorldRules, inventory_rules: FarmInventory, definitions: Array) -> void:
	world=world_rules
	inventory=inventory_rules
	for crop: Dictionary in definitions:
		crops[crop.cropId]=crop
		seeds[crop.seedId]=crop

## 判断当前角色是否位于相邻格且处于四十二像素范围内。
func near_tile(state: Dictionary, column: int, row: int) -> bool:
	return column>=0 and row>=0 and absi(floori(state.player.x/16.0)-column)<=1 and absi(floori(state.player.y/16.0)-row)<=1 and FarmWorldRules.point(state.player).distance_to(Vector2(column*16+8,row*16+8))<=42

## 使用工具、种子或空手作用于农田；保持旧作物生长与水壶等级语义。
func farm(state: Dictionary, column: int, row: int, item_id: String, direction: String) -> String:
	if state.player.regionId!="farm" or not near_tile(state,column,row): return "too-far"
	if item_id!="" and inventory.quantity(state.inventory,item_id)<1: return "no-effect"
	if FarmWorldRules.covers(state,"farm",column,row): return "no-effect"
	var id := "farm:%d:%d"%[column,row]
	if not state.farmTiles.has(id):
		if item_id!="hoe": return "missing-tile"
		if not world.mask("farm","tillableTiles",column,row): return "missing-tile"
		for spawn: Dictionary in world.regions.farm.resources:
			if floori(spawn.x/16.0)==column and floori(spawn.y/16.0)==row and state.resources.has(spawn.entityId) and state.resources[spawn.entityId].phase!="cleared": return "missing-tile"
		if state.stamina<2: return "insufficient-stamina"
		state.stamina-=2
		state.farmTiles[id]={"id":id,"column":column,"row":row,"phase":"tilled","cropId":"","growthDays":0,"watered":state.weather.current=="rain","plantedDay":0,"harvestCount":0}
		return "tilled"
	var tile: Dictionary=state.farmTiles[id]
	if seeds.has(item_id) and tile.phase=="tilled":
		if not inventory.consume(state.inventory,item_id,1): return "no-effect"
		tile.merge({"phase":"growing","cropId":seeds[item_id].cropId,"growthDays":0,"watered":tile.watered or state.weather.current=="rain","plantedDay":state.day,"harvestCount":0},true)
		return "planted"
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
		var affordable := mini(eligible.size(),mini(int(state.wateringCanWater),int(state.stamina)))
		if affordable<=0: return "empty-watering-can" if state.wateringCanWater<=0 else "insufficient-stamina"
		for index in range(affordable): eligible[index].watered=true
		state.wateringCanWater-=affordable
		state.stamina-=affordable
		return "watered"
	if item_id=="" and tile.phase=="mature":
		var crop: Dictionary=crops[tile.cropId]
		var amount := 1
		if crop.get("yieldKind")=="spring-potato":
			var roll := FarmWorldRules.stable_hash(state.worldSeed,tile.plantedDay,"%s:%d:%d:spring-potato"%[id,tile.plantedDay,tile.harvestCount])%100
			amount+=int(roll<55)+int(roll<15)
		if not inventory.add(state.inventory,tile.cropId,amount): return "inventory-full"
		if crop.get("regrowDays",0)>0:
			tile.harvestCount+=1
			tile.phase="growing"
			tile.growthDays=maxi(0,int(crop.growthDays)-int(crop.regrowDays))
		else:
			tile.merge({"phase":"tilled","cropId":"","growthDays":0,"plantedDay":0,"harvestCount":0},true)
		tile.watered=tile.watered or state.weather.current=="rain"
		return "harvested"
	return "no-effect"

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
		var targets: Array=[]
		for entry: Dictionary in world.regions[spawn.regionId].resources:
			if entry.kind=="weed" and state.resources[entry.entityId].phase=="standing" and FarmWorldRules.point(state.player).distance_to(FarmWorldRules.point(entry))<=42 and FarmWorldRules.in_sector(FarmWorldRules.point(state.player),FarmWorldRules.point(entry),direction): targets.append(entry)
		var origin := FarmWorldRules.point(state.player)
		targets.sort_custom(func(a: Dictionary,b: Dictionary)->bool:
			var da := origin.distance_squared_to(FarmWorldRules.point(a)); var db := origin.distance_squared_to(FarmWorldRules.point(b))
			return a.entityId<b.entityId if is_equal_approx(da,db) else da<db)
		targets=targets.slice(0,3)
		var fiber := 0
		for entry: Dictionary in targets: fiber+=int(FarmWorldRules.stable_hash(state.worldSeed,state.day,"weed-fiber:"+entry.entityId)%2==0)
		if fiber>0 and not inventory.can_add(state.inventory,"fiber",fiber): return "inventory-full"
		for entry: Dictionary in targets: state.resources[entry.entityId].phase="cleared"
		if fiber>0: inventory.add(state.inventory,"fiber",fiber)
		return "cut"
	var amount := 3 if spawn.kind=="tree" and resource.phase=="standing" else 1
	var output := "wood" if spawn.kind=="tree" else "stone"
	if not inventory.can_add(state.inventory,output,amount): return "inventory-full"
	if state.stamina<2: return "insufficient-stamina"
	state.stamina-=2
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
