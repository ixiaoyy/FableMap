class_name FarmNpcMotion
extends RefCounted
## 日程在固定内容表中，运动由 Godot 四向寻路推进；对话/营业读取真实位置。

var world: FarmWorldRules
var schedules: Dictionary
var actors: Dictionary={}
var segment: Dictionary={}
var pending_pushes: Array[String]=[]

## 绑定地图与已提取的星期/天气日程，不持久化路径或透明度。
func _init(catalog: FarmWorldRules, timetable: Dictionary) -> void:
	world=catalog; schedules=timetable

## 新游戏/读档直接恢复当天锚点，不重放离线时间或旧路径。
func reset(state: Dictionary) -> void:
	actors.clear()
	segment=_segment(state)
	for target: Dictionary in segment.npcs:
		actors[target.npcId]=_actor(target)

## 查询当前位置投影；传送阶段不营业，木匠按真实柜台与当前服务标记判断。
func snapshot() -> Array:
	var result: Array=[]
	for actor: Dictionary in actors.values():
		var npc: Dictionary=actor.current.duplicate(true)
		npc.motion=actor.motion
		npc.opacity=actor.opacity
		npc.activity=actor.plan.kind if actor.plan!=null else null
		npc.activityPhase=int(actor.cycle>=400)
		npc.facing=actor.facing
		if actor.motion!="idle": npc.interactionType="dialogue"
		if npc.npcId=="town-resident-mozi":
			var serving:=false
			if actor.motion not in ["leaving","arriving"] and npc.regionId=="town-house-west" and segment.carpenter.service!="closed":
				var point:=FarmWorldRules.point(npc)
				var home: Dictionary=world.regions["town-house-west"].spawns
				serving=point.distance_to(FarmWorldRules.point(home["npc-mozi-counter"]))<=12 or (segment.carpenter.service=="passing" and point.distance_to(FarmWorldRules.point(home["npc-mozi-counter-pass"]))<=12)
			npc.interactionType="building-service" if serving else "dialogue"
		result.append(npc)
	return result

## 每个十分钟边界只为目标真正变化的 NPC 重建路径，避免巡逻被反复重置。
func transition(state: Dictionary) -> void:
	var next:=_segment(state)
	segment=next
	for target: Dictionary in next.npcs:
		if not actors.has(target.npcId): actors[target.npcId]=_actor(target); continue
		var actor: Dictionary=actors[target.npcId]
		var previous: Dictionary=actor.scheduled
		if previous.regionId==target.regionId and previous.x==target.x and previous.y==target.y and previous.interactionType==target.interactionType and previous.routine==target.routine: continue
		actor.scheduled=target.duplicate(true)
		actor.plan=null; actor.queue=[]; actor.path=[]; actor.cycle=0.0
		if target.npcId=="town-resident-mozi" and actor.current.regionId!=target.regionId:
			var home: Dictionary=world.regions["town-house-west"].spawns
			var pass_point:=target.duplicate(true); pass_point.merge(home["npc-mozi-counter-pass"],true); pass_point.regionId="town-house-west"
			var entry:=target.duplicate(true); entry.merge(home.entry,true); entry.regionId="town-house-west"
			actor.queue=[pass_point,entry,target] if actor.current.regionId=="town-house-west" else [entry,pass_point,target]
		else: actor.queue=[target]
		_begin_next(actor,[])

## 按最多五十毫秒子步推进，让稳定 ID 较早的角色先占据合法位置。
func advance(state: Dictionary, elapsed: float) -> void:
	var remaining:=clampf(elapsed,0,1000)
	pending_pushes.clear()
	var ids:=actors.keys(); ids.sort()
	while remaining>0:
		var step:=minf(50,remaining); remaining-=step
		for id: String in ids: _advance_actor(actors[id],state,step)

## 从有限日程段中选择当前段；星期以 Day 1 周一为基准。
func _segment(state: Dictionary) -> Dictionary:
	var key: String="%d:%s"%[(int(state.day)-1)%7+1,state.weather.current]
	var found: Dictionary=schedules[key][0]
	for candidate: Dictionary in schedules[key]:
		if candidate.minute>state.minuteOfDay: break
		found=candidate
	return found

## 构造一个锚点角色及巡逻初始状态，不与数据表共享可变字典。
func _actor(target: Dictionary) -> Dictionary:
	var actor: Dictionary={"current":target.duplicate(true),"scheduled":target.duplicate(true),"destination":target.duplicate(true),"queue":[],"path":[],"motion":"idle","opacity":1.0,"elapsed":0.0,"blocked":0.0,"plan":null,"dwell":2400.0,"routeIndex":0,"cycle":0.0,"facing":"down"}
	_arrive(actor)
	return actor

## 开始下一段行走或跨区淡入淡出；同位置不制造额外动作。
func _begin_next(actor: Dictionary, obstacles: Array) -> void:
	if actor.queue.is_empty(): _arrive(actor); return
	actor.destination=actor.queue.pop_front().duplicate(true)
	actor.elapsed=0.0; actor.blocked=0.0
	if actor.current.regionId!=actor.destination.regionId:
		actor.source=actor.current.duplicate(true)
		actor.motion="leaving"
		return
	actor.path=_path(actor.current.regionId,FarmWorldRules.point(actor.current),FarmWorldRules.point(actor.destination),obstacles)
	actor.motion="walking" if not actor.path.is_empty() else "waiting"
	if FarmWorldRules.point(actor.current).is_equal_approx(FarmWorldRules.point(actor.destination)):
		actor.current=actor.destination.duplicate(true)
		_begin_next(actor,obstacles)

## 在原静态 Collision 上使用 Godot 内置四向 A*，并临时避开指定动态格。
func _path(region_id: String, start: Vector2, target: Vector2, obstacles: Array) -> Array:
	var region: Dictionary=world.regions[region_id]
	var finder:=AStarGrid2D.new()
	finder.region=Rect2i(0,0,region.collision.columns,region.collision.rows)
	finder.cell_size=Vector2(16,16); finder.offset=Vector2(8,8)
	finder.diagonal_mode=AStarGrid2D.DIAGONAL_MODE_NEVER
	finder.default_compute_heuristic=AStarGrid2D.HEURISTIC_MANHATTAN
	finder.default_estimate_heuristic=AStarGrid2D.HEURISTIC_MANHATTAN
	finder.update()
	for index in range(region.collision.blocked.size()):
		if region.collision.blocked[index]: finder.set_point_solid(Vector2i(index%int(region.collision.columns),floori(float(index)/region.collision.columns)))
	var first:=Vector2i(floori(start.x/16),floori(start.y/16))
	var last:=Vector2i(floori(target.x/16),floori(target.y/16))
	for obstacle: Dictionary in obstacles:
		if obstacle.regionId!=region_id: continue
		var cell:=Vector2i(floori(obstacle.x/16.0),floori(obstacle.y/16.0))
		if cell!=first and finder.is_in_boundsv(cell): finder.set_point_solid(cell)
	if not finder.is_in_boundsv(first) or not finder.is_in_boundsv(last) or finder.is_point_solid(last): return []
	var points:=finder.get_point_path(first,last)
	if points.is_empty(): return []
	var route: Array=[]
	for position: Vector2 in points:
		if not position.is_equal_approx(start): route.append(position)
	if route.is_empty() or not route.back().is_equal_approx(target): route.append(target)
	return route

## 完成路径后恢复锚点服务和活动；保留活动路线索引使其持续轮换。
func _arrive(actor: Dictionary) -> void:
	actor.motion="idle"; actor.opacity=1.0; actor.dwell=2400.0; actor.blocked=0.0
	if actor.plan==null:
		actor.plan=actor.scheduled.get("activityPlan")
		if actor.plan!=null:
			actor.plan=actor.plan.duplicate(true)
			for index in range(actor.plan.route.size()):
				if FarmWorldRules.point(actor.plan.route[index]).is_equal_approx(FarmWorldRules.point(actor.current)): actor.routeIndex=index; break

## 推进一个角色的有限运动状态机，并报告堵路的箱子供会话原子推移。
func _advance_actor(actor: Dictionary, state: Dictionary, elapsed: float) -> void:
	actor.cycle=fmod(actor.cycle+elapsed,800.0)
	if actor.motion in ["leaving","arriving"]:
		actor.elapsed+=elapsed
		if actor.elapsed<180:
			actor.current=actor.source.duplicate(true); actor.opacity=1.0-actor.elapsed/180.0; actor.motion="leaving"
		else:
			actor.current=actor.destination.duplicate(true); actor.opacity=minf(1,(actor.elapsed-180)/180.0); actor.motion="arriving"
		if actor.elapsed>=360: _begin_next(actor,[])
		return
	if actor.motion=="idle":
		actor.dwell=maxf(0,actor.dwell-elapsed)
		if actor.plan!=null and actor.plan.route.size()>1 and actor.dwell<=0:
			actor.routeIndex=(int(actor.routeIndex)+1)%actor.plan.route.size()
			var destination: Dictionary=actor.current.duplicate(true)
			destination.merge(actor.plan.route[actor.routeIndex],true)
			actor.queue=[destination]
			_begin_next(actor,[])
		return
	var obstacles: Array=[state.player]
	for other: Dictionary in actors.values():
		if other.current.npcId!=actor.current.npcId: obstacles.append(other.current)
	if actor.path.is_empty():
		actor.blocked+=elapsed
		if actor.blocked>=600: actor.path=_path(actor.current.regionId,FarmWorldRules.point(actor.current),FarmWorldRules.point(actor.destination),obstacles); actor.blocked=0.0
		return
	var from:=FarmWorldRules.point(actor.current)
	var target: Vector2=actor.path[0]
	var next:=from.move_toward(target,48.0*elapsed/1000.0)
	var obstructed:=world.blocked(state,actor.current.regionId,next,Vector2(5,3))
	for obstacle: Dictionary in obstacles:
		if obstacle.regionId==actor.current.regionId and ((absf(obstacle.x-next.x)<10 and absf(obstacle.y-next.y)<7) or Vector2i(floori(obstacle.x/16.0),floori(obstacle.y/16.0))==Vector2i(floori(next.x/16),floori(next.y/16))): obstructed=true
	if obstructed:
		for object: Dictionary in state.worldObjects:
			if object.kind=="chest" and object.regionId==actor.current.regionId and FarmWorldRules.feet_overlap(next,Vector2i(object.column,object.row),Vector2(5,3)) and object.id not in pending_pushes: pending_pushes.append(object.id)
		actor.blocked+=elapsed; actor.motion="waiting"
		if actor.blocked>=600:
			var route:=_path(actor.current.regionId,from,FarmWorldRules.point(actor.destination),obstacles)
			if not route.is_empty(): actor.path=route
			actor.blocked=0.00001
		return
	actor.blocked=0.0; actor.motion="walking"
	actor.facing=FarmWorldRules.facing(next-from,actor.facing)
	actor.current.x=next.x; actor.current.y=next.y
	if next.is_equal_approx(target): actor.path.pop_front()
	if actor.path.is_empty():
		actor.current=actor.destination.duplicate(true)
		_begin_next(actor,obstacles)
