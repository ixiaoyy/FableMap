extends Node2D
## 复用旧 WeedEntity.drawBody 的几何、颜色和像素位置，不新增杂草美术。

## 绘制原杂草枝叶；可用性和清除由领域状态控制。
func _draw() -> void:
	draw_line(Vector2.ZERO,Vector2(0,-12),Color("416b3c"),2)
	draw_line(Vector2(-1,-5),Vector2(-6,-11),Color("416b3c"),2)
	draw_line(Vector2(1,-4),Vector2(6,-10),Color("416b3c"),2)
	draw_colored_polygon(PackedVector2Array([Vector2(-1,-7),Vector2(-8,-13),Vector2(-3,-3)]),Color("79a953"))
	draw_colored_polygon(PackedVector2Array([Vector2(1,-7),Vector2(8,-12),Vector2(3,-2)]),Color("79a953"))
	draw_colored_polygon(PackedVector2Array([Vector2(0,-10),Vector2(-3,-16),Vector2(3,-14)]),Color("a5c66c"))
	draw_rect(Rect2(-4,-2,8,2),Color("314f32"))
