extends Node2D
## 轻量雨线与风中叶片表现，随机外观不参与天气规则、资源或存档。

var kind: String="sunny"
var outdoors:=false
var elapsed:=0.0

## 更新当前天气，进入室内立即清除室外效果。
func configure(weather: String, outside: bool) -> void:
	if kind==weather and outdoors==outside: return
	kind=weather; outdoors=outside; queue_redraw()

## 动画时间仅用于显示，世界暂停不会推进任何游戏规则。
func _process(delta: float) -> void:
	if outdoors and kind!="sunny": elapsed+=minf(delta,0.1); queue_redraw()

## 按有限数量绘制雨线或风痕，设备尺寸变化时仍覆盖当前视口。
func _draw() -> void:
	if not outdoors or kind=="sunny": return
	var size:=get_viewport().get_visible_rect().size
	if kind=="rain":
		for index in range(80):
			var x:=fmod(index*137.0+elapsed*35,maxf(1,size.x))
			var y:=fmod(index*83.0+elapsed*260,maxf(1,size.y))
			draw_line(Vector2(x,y),Vector2(x-3,y+9),Color(0.8,0.92,0.96,0.38),1)
	else:
		for index in range(22):
			var x:=fmod(index*151.0+elapsed*70,maxf(1,size.x))
			var y:=fmod(index*91.0+sin(elapsed+index)*9,maxf(1,size.y))
			draw_line(Vector2(x,y),Vector2(x+5,y-1),Color(0.75,0.87,0.53,0.45),2)
