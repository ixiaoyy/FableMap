extends SceneTree
## 内容构建工具：从固定矩形绘图数据重建两张内景图，不依赖浏览器或旧引擎。

## 读取固定绘图文件并写入固定 media 路径；无网络、无递归遍历，失败以非零退出。
func _initialize() -> void:
	var paintings: Variant = JSON.parse_string(FileAccess.get_file_as_string("res://tools/interior-atlases.json"))
	if not paintings is Array or paintings.size() != 2:
		quit(1)
		return
	for painting: Dictionary in paintings:
		if painting.name not in ["cottage-woodwork.runtime.png", "shop-interiors.runtime.png"]:
			quit(1)
			return
		var image := Image.create(int(painting.width), int(painting.height), false, Image.FORMAT_RGBA8)
		image.fill(Color.TRANSPARENT)
		for operation: Array in painting.operations:
			image.fill_rect(Rect2i(int(operation[0]), int(operation[1]), int(operation[2]), int(operation[3])), Color.html(operation[4]))
		if image.save_png("res://media/" + painting.name) != OK:
			quit(1)
			return
	quit(0)
