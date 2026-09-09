class_name FarmCrowDeparture
extends Node2D
## 已提交隔夜结果的短暂离场表现；没有会话引用，不吃作物或增加驱赶次数。

var assets: FarmAssets
var bird: Sprite2D
var elapsed:=0.0
var delay:=0.0
var scared:=false
var direction:=1.0
var origin:=Vector2.ZERO

## 用实际目标格与结算结果配置一次离场；序号只错开最多四只鸟的起飞时间。
func configure(library: FarmAssets, event: Dictionary, index: int) -> void:
	assets=library; scared=event.outcome=="scared"; direction=float(event.direction)
	origin=Vector2(event.column*16+8,event.row*16+10); position=origin
	delay=index*0.16
	bird=Sprite2D.new(); bird.centered=false; bird.offset=Vector2(-8,-15)
	bird.texture=assets.crow_texture("wings-up" if scared else "perched")
	bird.flip_h=direction<0; add_child(bird)
	visible=false

## 地面短暂停留后振翅飞离；受惊时直接上扬，固定时长结束后释放节点。
func _process(delta: float) -> void:
	elapsed+=delta
	var time:=elapsed-delay
	visible=time>=0
	if time<0: return
	var pause:=0.18 if scared else 0.7
	var flight:=maxf(0,time-pause)
	if flight==0:
		bird.texture=assets.crow_texture("wings-up" if scared else "peck" if int(time/0.18)%2==1 else "perched")
	else:
		var poses: Array[String]=["wings-up","wings-level","wings-down","wings-level"]
		bird.texture=assets.crow_texture(poses[int(flight/0.10)%poses.size()])
		position=origin+Vector2(direction*(24*flight+16*flight*flight),-28*flight-16*flight*flight)
		bird.modulate.a=clampf((2.0-flight)/0.4,0,1)
	queue_redraw()
	if flight>=2.0: queue_free()

## 在落点画短暂接地影，飞起后渐隐；影子不参与碰撞或场景状态。
func _draw() -> void:
	var alpha:=clampf(1.0-maxf(0,elapsed-delay-0.2)*2,0,1)*0.22
	var color:=Color(0.16,0.23,0.19,alpha)
	draw_rect(Rect2(origin-position+Vector2(-4,-1),Vector2(8,1)),color)
	draw_rect(Rect2(origin-position+Vector2(-3,0),Vector2(6,1)),color)
