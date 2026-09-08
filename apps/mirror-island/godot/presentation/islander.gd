@tool
extends CharacterBody2D
## 三层岛民表现；保持原图 48×64 帧、脚底 y=60 和世界缩放 0.5。

const DIRECTION_ROWS := {Vector2.DOWN: 0, Vector2.LEFT: 1, Vector2.RIGHT: 2, Vector2.UP: 3}
const HEAD_ROWS := [[0, 1, 2], [5, 4, 3]]
const TOP_ROWS := [[1, 0, 2], [4, 3, 5]]
const BOTTOM_ROWS := [[0, 1, 2], [3, 4, 5]]
const SKIN := [Color8(246, 190, 132), Color8(205, 143, 91), Color8(142, 96, 69)]
const HAIR := [Color8(133, 89, 44), Color8(48, 50, 56), Color8(204, 168, 80)]
const TOP := [Color8(240, 228, 198), Color8(148, 195, 164), Color8(237, 170, 134), Color8(160, 203, 210)]
const BOTTOM := [Color8(42, 104, 129), Color8(186, 157, 111), Color8(90, 120, 65)]

@export_enum("男", "女") var gender: int = 1:
	set(value):
		gender = value
		_refresh_later()
@export_enum("清爽短发", "柔软短波波", "轻快马尾") var head: int = 1:
	set(value):
		head = value
		_refresh_later()
@export_enum("日常衬衫", "农场背带装", "轻便外套") var top: int = 1:
	set(value):
		top = value
		_refresh_later()
@export_enum("直筒长裤", "夏日短裤", "田园短裙") var bottom: int = 0:
	set(value):
		bottom = value
		_refresh_later()
@export_enum("浅桃", "暖棕", "深褐") var skin_tone: int = 0:
	set(value):
		skin_tone = value
		_refresh_later()
@export_enum("栗棕", "墨黑", "亚麻金") var hair_color: int = 0:
	set(value):
		hair_color = value
		_refresh_later()
@export_enum("暖白", "薄荷绿", "珊瑚橙", "晴空蓝") var top_color: int = 1:
	set(value):
		top_color = value
		_refresh_later()
@export_enum("牛仔蓝", "浅沙色", "森林绿") var bottom_color: int = 0:
	set(value):
		bottom_color = value
		_refresh_later()

var facing := Vector2.DOWN
var animation_time := 0.0
var refresh_queued := false
var tool_pose_active := false
var normal_top_texture: Texture2D
var tool_pose_frames: Dictionary = {}
var tool_arms: Array[Sprite2D] = []
var active_arm_data: Array = []

## 初始化可编辑角色图层；素材必须由项目准备脚本校验后提供。
func _ready() -> void:
	_refresh_art()

## 将多次属性编辑合并为一次重建；编辑器外未进树时不读取资源。
func _refresh_later() -> void:
	if not is_inside_tree() or refresh_queued:
		return
	refresh_queued = true
	_refresh_art.call_deferred()

## 按原素材遮罩换色并投影头、上装、下装；不生成新轮廓或修改源 PNG。
func _refresh_art() -> void:
	if tool_pose_active: end_tool_pose()
	refresh_queued = false
	if not FileAccess.file_exists("res://generated/catalog.json") or not has_node("Head"):
		return
	var parsed: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://generated/catalog.json"))
	if not parsed is Dictionary or not parsed.has("character"):
		push_error("角色资源目录未准备")
		return
	var atlas: Image = (load(parsed.character.layers) as Texture2D).get_image()
	var mask: Image = (load(parsed.character.materials) as Texture2D).get_image()
	var targets: Array[Color] = [Color.WHITE, SKIN[skin_tone], HAIR[hair_color], TOP[top_color], BOTTOM[bottom_color]]
	var bases: Array[Color] = [Color.WHITE, SKIN[0], HAIR[0], TOP[0], BOTTOM[0]]
	var variants: Array[int] = [HEAD_ROWS[gender][head], TOP_ROWS[gender][top], BOTTOM_ROWS[gender][bottom]]
	var names: Array[String] = ["Head", "Top", "Bottom"]
	for part in range(3):
		var origin := Vector2i(part * 144, variants[part] * 256)
		var image := atlas.get_region(Rect2i(origin, Vector2i(144, 256)))
		for y in range(256):
			for x in range(144):
				var pixel := image.get_pixel(x, y)
				if pixel.a == 0:
					continue
				var material_id := roundi(mask.get_pixel(origin.x + x, origin.y + y).r * 255.0)
				if material_id > 0 and material_id < 5:
					var ratio := targets[material_id] / bases[material_id]
					image.set_pixel(x, y, Color(minf(pixel.r * ratio.r, 1), minf(pixel.g * ratio.g, 1), minf(pixel.b * ratio.b, 1), pixel.a))
		var sprite := get_node(names[part]) as Sprite2D
		sprite.texture = ImageTexture.create_from_image(image)
		if part == 1:
			normal_top_texture = sprite.texture
			_prepare_tool_poses(image)
	_update_frame(1)

## 用当前移动向量更新四向行走帧；停止时保持最后朝向，不改变游戏坐标。
func animate_movement(direction: Vector2, delta: float) -> void:
	if tool_pose_active: return
	if not direction.is_zero_approx():
		facing = Vector2(signf(direction.x), 0) if absf(direction.x) >= absf(direction.y) else Vector2(0, signf(direction.y))
		animation_time += delta
		_update_frame([0, 1, 2, 1][int(animation_time / 0.14) % 4])
	else:
		animation_time = 0.0
		_update_frame(1)

## 为三层使用同一朝向和步伐列，返回值无；节点尺寸仍由原图决定。
func _update_frame(column: int) -> void:
	var row: int = DIRECTION_ROWS.get(facing, 0)
	for name in ["Head", "Top", "Bottom"]:
		(get_node(name) as Sprite2D).frame = row * 3 + column

## 从已换色的上装拆出四向站立手臂；仅重排原像素，缓存结果且不写入源图。
func _prepare_tool_poses(image: Image) -> void:
	tool_pose_frames.clear()
	var definitions: Array = [
		[[Rect2i(30,28,8,21),Vector2(2,2),Vector2(3,16)],[Rect2i(11,28,7,21),Vector2(5,2),Vector2(3,16)]],
		[[Rect2i(24,28,9,21),Vector2(4,2),Vector2(3,16)]],
		[[Rect2i(16,28,9,21),Vector2(5,2),Vector2(4,16)]],
		[[Rect2i(12,28,7,21),Vector2(5,2),Vector2(2,16)],[Rect2i(30,28,7,21),Vector2(1,2),Vector2(3,16)]]
	]
	for row in range(4):
		var torso := image.get_region(Rect2i(48,row*64,48,64))
		var arms: Array = []
		for definition: Array in definitions[row]:
			var rectangle: Rect2i = definition[0]
			arms.append({"texture":ImageTexture.create_from_image(torso.get_region(rectangle)),"origin":Vector2(rectangle.position),"pivot":definition[1],"hand":definition[2]})
			torso.fill_rect(rectangle,Color.TRANSPARENT)
		tool_pose_frames[row] = {"torso":ImageTexture.create_from_image(torso),"arms":arms}
	if tool_arms.is_empty():
		for index in range(2):
			var arm := Sprite2D.new(); arm.name="ToolArm%d"%index; arm.centered=false; arm.scale=Vector2(0.5,0.5); arm.visible=false
			add_child(arm); tool_arms.append(arm)

## 切入指定朝向的工具姿势；保留外观和脚底坐标，返回值无。
func begin_tool_pose(direction: Vector2) -> void:
	facing=direction; _update_frame(1); tool_pose_active=true
	var pose: Dictionary=tool_pose_frames[DIRECTION_ROWS.get(facing,0)]
	active_arm_data=pose.arms
	var torso := get_node("Top") as Sprite2D
	torso.hframes=1; torso.vframes=1; torso.frame=0; torso.texture=pose.torso
	for index in range(tool_arms.size()):
		tool_arms[index].visible=index<active_arm_data.size()
		if tool_arms[index].visible:
			tool_arms[index].texture=active_arm_data[index].texture
			tool_arms[index].offset=-active_arm_data[index].pivot
			tool_arms[index].z_index=-1 if facing==Vector2.UP else 2

## 按手臂角度、上身倾角和下压量投影动作；返回主手握点，供工具逐帧跟随。
func apply_tool_pose(arm_angle: float, lean: float, crouch: float) -> Vector2:
	var waist := Vector2(0,-10)
	var shift := Vector2(0,crouch)
	for part in ["Head","Top"]:
		var sprite := get_node(part) as Sprite2D
		sprite.position=waist+shift; sprite.offset=Vector2(-24,-40); sprite.rotation=lean
	for index in range(active_arm_data.size()):
		var data: Dictionary=active_arm_data[index]
		var shoulder: Vector2 = Vector2(-12,-30)+(data.origin+data.pivot)*0.5
		tool_arms[index].position=waist+(shoulder-waist).rotated(lean)+shift
		tool_arms[index].rotation=arm_angle if index==0 else -arm_angle*0.65
	var primary: Dictionary=active_arm_data[0]
	return tool_arms[0].position+((primary.hand-primary.pivot)*0.5).rotated(arm_angle)

## 恢复完整上装和站立帧；可重复调用，取消与正常恢复走同一路径。
func end_tool_pose() -> void:
	if not tool_pose_active: return
	tool_pose_active=false
	var torso := get_node("Top") as Sprite2D
	torso.texture=normal_top_texture; torso.hframes=3; torso.vframes=4
	for part in ["Head","Top"]:
		var sprite := get_node(part) as Sprite2D
		sprite.position=Vector2(-12,-30); sprite.offset=Vector2.ZERO; sprite.rotation=0
	for arm in tool_arms: arm.visible=false
	_update_frame(1)
