class_name FarmFishingView
extends Node2D
## 钓鱼的纯场景投影；读取阶段与保存结果，不决定咬钩、鱼种、进度或奖励。

var actor: CharacterBody2D
var assets: FarmAssets
var water:=Vector2.ZERO
var phase: String=""
var phase_time:=0.0
var grip:=Vector2.ZERO
var tip:=Vector2.ZERO
var bobber:=Vector2.ZERO
var biting:=false
var tension:=50.0
var progress:=0.0
var caught_icon: Texture2D

## 固定本次人物与钓位中心，复用人物的持工具姿势，不改脚底或领域朝向。
func configure(islander: CharacterBody2D, library: FarmAssets, target: Vector2) -> void:
	actor=islander; assets=library; water=target
	actor.begin_tool_pose(FarmWorldRules.VECTORS[FarmWorldRules.facing(target-actor.position,"down")])
	z_index=1

## 按真实运行态同步画面；caught 必须等保存成功才能播放，保存失败时保持收线姿势。
func project(runtime: Dictionary, bite: bool, committed: bool, delta: float) -> void:
	var next: String=runtime.phase
	if next=="caught" and not committed: next="reeling"
	if next!=phase: phase=next; phase_time=0.0
	else: phase_time+=delta
	biting=bite; tension=float(runtime.tension); progress=float(runtime.progress)
	if phase=="caught" and runtime.fish!=null: caught_icon=assets.icon(runtime.fish.itemId)
	var pull:=sin(phase_time*12)*(0.04+tension/100*0.08) if phase=="reeling" else 0.0
	grip=actor.position+actor.apply_tool_pose(-0.45-pull,0.025 if phase=="reeling" else 0.0,0.0)
	var direction: Vector2=(water-grip).normalized()
	var cast:=clampf(phase_time/0.35,0,1)
	tip=grip+direction*16+Vector2(0,-30 if phase!="casting" else -38-float(runtime.castPower)*0.06)
	bobber=water+Vector2(0,sin(phase_time*4)*0.8)
	if phase=="casting": bobber=tip+Vector2(0,6)
	elif phase=="waiting" and cast<1: bobber=tip.lerp(water,cast)+Vector2(0,-sin(cast*PI)*20)
	elif phase=="waiting" and biting: bobber.y+=2+sin(phase_time*25)*1.5
	elif phase=="reeling": bobber=water.lerp(grip+direction*12,progress/100.0*0.65)+Vector2(sin(phase_time*10)*2,0)
	elif phase=="caught": bobber=water.lerp(grip,clampf(phase_time/0.55,0,1))+Vector2(0,-sin(clampf(phase_time/0.55,0,1)*PI)*28)
	queue_redraw()

## 原生像素线绘制竹竿、鱼线、红白浮漂与水纹；终局图标只使用已提交鱼获。
func _draw() -> void:
	if phase=="": return
	draw_line(grip,tip,Color("97744e"),2)
	draw_line(grip+Vector2(-1,0),tip+Vector2(-1,0),Color("e5c487"),1)
	if phase in ["escaped","inventory-full"]: return
	var bend: Vector2=(tip+bobber)/2+Vector2(0,2 if phase=="reeling" else 5)
	draw_polyline(PackedVector2Array([tip,bend,bobber]),Color("f4efcf"),1)
	if phase=="caught" and caught_icon!=null:
		draw_texture_rect(caught_icon,Rect2(bobber-Vector2(8,16),Vector2(16,16)),false)
		return
	if phase in ["waiting","reeling"] and (phase_time>=0.35 or phase=="reeling"):
		var radius:=4.0+fmod(phase_time*5,4)
		draw_arc(bobber+Vector2(0,2),radius,0,TAU,12,Color(0.82,0.95,0.91,0.65),1)
	draw_rect(Rect2(bobber-Vector2(2,3),Vector2(4,3)),Color("df8065"))
	draw_rect(Rect2(bobber+Vector2(-2,0),Vector2(4,2)),Color("fff1d4"))
	if biting:
		draw_line(bobber+Vector2(0,-15),bobber+Vector2(0,-9),Color("fff1d4"),2)
		draw_rect(Rect2(bobber+Vector2(-1,-6),Vector2(2,2)),Color("df8065"))

## 关闭、换区或场景释放时恢复原人物姿势，不向会话发送取消或重复收鱼命令。
func _exit_tree() -> void:
	if is_instance_valid(actor): actor.end_tool_pose()
