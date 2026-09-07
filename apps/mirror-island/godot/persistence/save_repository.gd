class_name FarmSaveRepository
extends RefCounted
## Windows 原子文件与 Web IndexedDB 的窄适配，完全隔离旧客户端存档。

signal completed(result: Dictionary)
const PATH := "user://game-v1.json"
var callback: JavaScriptObject
var browser: JavaScriptObject
var busy:=false
var storage_path: String

## Web 初始化仅装载项目自己的存储适配代码，玩法逻辑不跨入 JavaScript。
func _init(path: String = PATH) -> void:
	storage_path=path
	if OS.has_feature("web"):
		JavaScriptBridge.eval(FileAccess.get_file_as_string("res://persistence/browser_save.js"),true)
		browser=JavaScriptBridge.get_interface("MirrorIslandSave")
		callback=JavaScriptBridge.create_callback(_on_browser_complete)

## 读取当前引擎槽，空内容与失败分别返回，绝不枚举其他数据库。
func read() -> Dictionary:
	if busy: return {"ok":false,"text":"存档操作尚未完成。"}
	if OS.has_feature("web"):
		busy=true; browser.read(callback)
		return await completed
	if not FileAccess.file_exists(storage_path): return {"ok":true,"text":""}
	var file:=FileAccess.open(storage_path,FileAccess.READ)
	if file==null: return {"ok":false,"text":"无法读取本地存档。"}
	if file.get_length()>FarmSaveCodec.MAX_BYTES: return {"ok":false,"text":"存档体积超过上限。"}
	var content:=file.get_as_text()
	file.close()
	return {"ok":true,"text":content}

## 先写临时文件并刷新，再原子替换主文件；Web 等待事务完成再报告成功。
func write(text: String) -> bool:
	if busy or text.to_utf8_buffer().size()>FarmSaveCodec.MAX_BYTES: return false
	if OS.has_feature("web"):
		busy=true; browser.write(text,callback)
		var result: Dictionary=await completed
		return result.ok
	var file:=FileAccess.open(storage_path+".tmp",FileAccess.WRITE)
	if file==null: return false
	file.store_string(text); file.flush()
	var error:=file.get_error(); file.close()
	if error!=OK: return false
	return DirAccess.rename_absolute(ProjectSettings.globalize_path(storage_path+".tmp"),ProjectSettings.globalize_path(storage_path))==OK

## 将浏览器异步回调转为一次信号，保留 callback 引用直到操作结束。
func _on_browser_complete(arguments: Array) -> void:
	if not busy: return
	busy=false
	completed.emit({"ok":arguments.size()>=2 and arguments[0]==true,"text":str(arguments[1]) if arguments.size()>=2 else "浏览器存档回调无效。"})
