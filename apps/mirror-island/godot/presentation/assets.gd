class_name FarmAssets
extends RefCounted
## 同一资源索引供场景与界面使用，所有图片和声音只来自校验后的本地媒体包。

var media: Dictionary
var paths: Dictionary
var icons: Dictionary={}
var textures: Dictionary={}

## 读取已迁移的图集定义和不可变对象路径，不在游戏中下载或生成外部资源。
func _init() -> void:
	media=JSON.parse_string(FileAccess.get_file_as_string("res://data/media.json"))
	paths=JSON.parse_string(FileAccess.get_file_as_string("res://generated/asset-paths.json"))

## 从原同源 URL 解析已登记对象，版本查询串只用于源记录，不参与本地路径。
func path_for(url: String) -> String:
	var key:=url.split("?")[0]
	if key.begins_with("/game-media/v1/"): key=key.trim_prefix("/game-media/v1/")
	elif key.contains("/game/media/v1/"): key=key.split("/game/media/v1/")[1]
	return paths.get(key,"")

## 加载并缓存已登记纹理；缺失立即报告，不用占位图掩盖素材问题。
func texture(url: String) -> Texture2D:
	if textures.has(url): return textures[url]
	var path:=path_for(url)
	if url in ["res://media/cottage-woodwork.runtime.png","res://media/shop-interiors.runtime.png"]: path=url
	if path=="": push_error("素材未登记："+url); return null
	var image:=load(path) as Texture2D
	textures[url]=image
	return image

## 创建图集帧引用，不裁剪或改写原图；返回供 Sprite2D/TextureRect 共用的资源。
func frame(url: String, rectangle: Dictionary) -> Texture2D:
	var key: String="%s:%d:%d:%d:%d"%[url,rectangle.x,rectangle.y,rectangle.width,rectangle.height]
	if textures.has(key): return textures[key]
	var atlas:=AtlasTexture.new()
	atlas.atlas=texture(url)
	atlas.region=Rect2(rectangle.x,rectangle.y,rectangle.width,rectangle.height)
	textures[key]=atlas
	return atlas

## 返回物品原图标；旧代码像素图按原矩阵和调色板重建，避免混入新美术。
func icon(id: String) -> Texture2D:
	if icons.has(id): return icons[id]
	var definition: Variant=media.items.get(id)
	if definition==null: return null
	var result: Texture2D
	if definition.kind=="atlas": result=frame(definition.url,definition)
	else:
		var art: Dictionary=definition.art
		var image:=Image.create(art.rows[0].length(),art.rows.size(),false,Image.FORMAT_RGBA8)
		image.fill(Color.TRANSPARENT)
		for y in range(art.rows.size()):
			for x in range(art.rows[y].length()):
				var symbol: String=art.rows[y][x]
				if art.palette.has(symbol): image.set_pixel(x,y,Color.html(art.palette[symbol]))
		result=ImageTexture.create_from_image(image)
	icons[id]=result
	return result

## 种子袋上的作物徽记复用原独立图集帧，不新增或重编码图片。
func badge(id: String) -> Texture2D:
	var definition: Variant=media.badges.get(id)
	if definition==null or definition.kind!="atlas": return null
	return frame(definition.url,definition)

## 将旧纹理 key 转为图集 URL；只接受明确映射的 VectoRaith 键。
func entity_frame(texture_key: String, rectangle: Dictionary) -> Texture2D:
	var suffix:=texture_key.trim_prefix("vectoraith-")
	if media.textures.has(suffix): return frame(media.textures[suffix],rectangle)
	if texture_key.begins_with("item-original-"): return icon(texture_key.trim_prefix("item-original-"))
	push_error("实体纹理未迁移："+texture_key)
	return null

## 从八名居民的原帧构建显示，所有住宅居民继续使用同风格图集。
func npc_texture(id: String) -> Texture2D:
	var definition: Dictionary=media.regions.farm.npc
	return entity_frame(definition.textureKey,definition.frames[id])

## 按原宠物四向帧和休息帧返回纹理，动画索引始终在已登记图集内。
func pet_texture(pet: Dictionary, elapsed: float) -> Texture2D:
	var profile: Dictionary=media.pets[pet.species]
	var index: int=profile.idle[pet.facing]
	if pet.motion=="walking": index=profile.walk[pet.facing][int(elapsed/0.16)%4]
	elif pet.motion=="resting": index=profile.rest["left" if pet.facing=="left" else "right"]
	return frame(profile.url,{"x":index%16*32,"y":floori(float(index)/16)*32,"width":32,"height":32})
