class_name FarmSlotButton
extends Button
## 原生库存槽控件：点击、右键数量和跨容器拖放共用带明确索引的命令。

signal picked(grid: String, index: int, amount: String)
signal moved(data: Dictionary, grid: String, index: int)
var grid_id: String=""
var slot_index: int=0
var item_id: String=""
var amount_mode: String="stack"
var transfer_enabled:=true

## 左键/键盘使用选定数量，右键单件，Shift+右键半组；不自行修改库存。
func _gui_input(event: InputEvent) -> void:
	if disabled: return
	if event is InputEventMouseButton and event.pressed and event.button_index==MOUSE_BUTTON_RIGHT:
		picked.emit(grid_id,slot_index,"half" if event.shift_pressed else "one")
		accept_event()

## 接线原生激活信号，使 Enter/Space 和鼠标点选走相同路径。
func _ready() -> void:
	pressed.connect(_pick)

## 将选定槽信息交给面板，不在控件中持久化物品。
func _pick() -> void:
	picked.emit(grid_id,slot_index,amount_mode)

## 为非空槽提供只读拖拽数据和真实图标预览。
func _get_drag_data(_position: Vector2) -> Variant:
	if disabled or item_id=="" or not transfer_enabled: return null
	var preview:=TextureRect.new()
	preview.texture=icon
	preview.custom_minimum_size=Vector2(40,40)
	preview.expand_mode=TextureRect.EXPAND_IGNORE_SIZE
	preview.stretch_mode=TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	set_drag_preview(preview)
	return {"grid":grid_id,"index":slot_index,"itemId":item_id,"amount":amount_mode}

## 只接受同一库存界面产生的结构化拖拽记录，最终合法性仍由领域判断。
func _can_drop_data(_position: Vector2, data: Variant) -> bool:
	return not disabled and transfer_enabled and data is Dictionary and data.get("grid") in ["inventory","chest"] and data.get("index") is int

## 提交一次拖放意图；外部放下由 Godot 自动取消，不消耗任何物品。
func _drop_data(_position: Vector2, data: Variant) -> void:
	if _can_drop_data(_position,data): moved.emit(data,grid_id,slot_index)
