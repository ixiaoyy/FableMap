class_name FarmAudio
extends Node
## 原声音目录的 Godot 播放器；环境音与效果分组，音量偏好不写入玩法存档。

var assets: FarmAssets
var settings: Dictionary={"version":1,"master":0.8,"music":0.7,"sfx":0.8}
var ambient_players: Array[AudioStreamPlayer]=[]
var effect_players: Array[AudioStreamPlayer]=[]
var ambient_group: String=""
var footstep_index:=0
var settings_dirty:=false
var settings_delay:=0.0
var weather_player: AudioStreamPlayer
var weather_kind: String="sunny"
var outside:=false
var weather_streams: Dictionary={}

## 初始化有限声音通道和原三档音量，偏好读取失败不阻塞游戏。
func configure(library: FarmAssets) -> void:
	assets=library
	if OS.has_feature("web"):
		var raw: Variant=JavaScriptBridge.eval("(()=>{try{return localStorage.getItem('mirror-island.audio-settings.v1')||''}catch{return ''}})()")
		if raw is String and raw!="": _read_settings(JSON.parse_string(raw))
	else:
		var config:=ConfigFile.new()
		if config.load("user://audio.cfg")==OK: _read_settings(config.get_value("audio","settings",{}))
	for index in range(8):
		var player:=AudioStreamPlayer.new(); add_child(player); effect_players.append(player)
	weather_player=AudioStreamPlayer.new(); add_child(weather_player)

## 晴天和室内静音；雨/风复用有限噪声缓冲，不下载新素材。
func weather(kind: String, outdoors: bool) -> void:
	if weather_kind==kind and outside==outdoors: return
	weather_kind=kind; outside=outdoors
	weather_player.stop()
	if outdoors and kind!="sunny":
		weather_player.stream=_weather_stream(kind); weather_player.play()
	_mix()

## 将原天气噪声转为可在 Web 播放的两秒 PCM 循环，独立随机序列不影响玩法。
func _weather_stream(kind: String) -> AudioStreamWAV:
	if weather_streams.has(kind): return weather_streams[kind]
	var samples:=PackedByteArray(); samples.resize(44100*2)
	var rng:=RandomNumberGenerator.new(); rng.seed=714203
	var value:=0.0
	var alpha:=1.0-exp(-TAU*(4500.0 if kind=="rain" else 240.0)/22050.0)
	for index in range(44100):
		value+=(rng.randf_range(-1,1)-value)*alpha
		samples.encode_s16(index*2,clampi(roundi(value*32767),-32767,32767))
	var stream:=AudioStreamWAV.new(); stream.format=AudioStreamWAV.FORMAT_16_BITS; stream.mix_rate=22050; stream.stereo=false; stream.data=samples; stream.loop_mode=AudioStreamWAV.LOOP_FORWARD; stream.loop_begin=0; stream.loop_end=44100
	weather_streams[kind]=stream
	return stream

## 校验音量通道并采用原默认值，不允许非数值影响音频引擎。
func _read_settings(value: Variant) -> void:
	if not value is Dictionary or value.get("version")!=1: return
	for key in ["master","music","sfx"]:
		if FarmSaveCodec.number(value.get(key),0,1,false): settings[key]=value[key]

## 更新一个音量并延迟保存，拖动滑块不会高频写磁盘。
func volume(channel: String, value: float) -> void:
	if channel not in ["master","music","sfx"]: return
	settings[channel]=clampf(value,0,1); settings_dirty=true; settings_delay=0.3
	_mix()

## 播放已登记效果，最多八个并发声音，超出时复用最早通道。
func cue(name: String) -> void:
	var definition: Dictionary={}
	if name=="footstep":
		definition=assets.media.footsteps[footstep_index%assets.media.footsteps.size()]; footstep_index+=1
	else: definition=assets.media.cues.get(name,{})
	if definition.is_empty(): return
	var player: AudioStreamPlayer=effect_players[0]
	for candidate in effect_players:
		if not candidate.playing: player=candidate; break
	player.stop()
	player.stream=load(assets.path_for(definition.url)) as AudioStream
	player.volume_db=linear_to_db(maxf(0.0001,float(definition.gain)*float(settings.master)*float(settings.sfx)))
	player.play()

## 只在区域组变化时更换循环环境音，不重复叠加播放器。
func enter_region(region: String) -> void:
	var group:=region if region in ["farm","town","lakeshore"] else "farm" if region=="foothills" else "interior"
	if group==ambient_group: return
	for player in ambient_players: player.stop(); player.queue_free()
	ambient_players.clear(); ambient_group=group
	for definition: Dictionary in assets.media.ambience[group]:
		var player:=AudioStreamPlayer.new()
		player.stream=(load(assets.path_for(definition.url)) as AudioStream).duplicate()
		player.stream.set("loop",true)
		player.set_meta("gain",definition.gain)
		add_child(player); ambient_players.append(player); player.play()
	_mix()

## 更新已有环境通道的增益，静音不销毁资源或改变游戏时间。
func _mix() -> void:
	for player in ambient_players: player.volume_db=linear_to_db(maxf(0.0001,float(player.get_meta("gain"))*float(settings.master)*float(settings.music)))
	if weather_player!=null: weather_player.volume_db=linear_to_db(maxf(0.0001,float(settings.master)*float(settings.music)*(0.1 if weather_kind=="rain" else 0.3)))

## 延迟保存有限偏好；浏览器只写原音量键，不接触旧玩法存档。
func _process(delta: float) -> void:
	if not settings_dirty: return
	settings_delay-=delta
	if settings_delay>0: return
	settings_dirty=false
	if OS.has_feature("web"):
		var encoded:=JSON.stringify(JSON.stringify(settings))
		JavaScriptBridge.eval("try{localStorage.setItem('mirror-island.audio-settings.v1',"+encoded+")}catch{}")
	else:
		var config:=ConfigFile.new(); config.set_value("audio","settings",settings); config.save("user://audio.cfg")

## 隐藏窗口暂停所有环境音，恢复后继续，不在后台发声。
func _notification(what: int) -> void:
	if what not in [NOTIFICATION_APPLICATION_FOCUS_OUT,NOTIFICATION_APPLICATION_FOCUS_IN]: return
	for player in ambient_players: player.stream_paused=what==NOTIFICATION_APPLICATION_FOCUS_OUT
	if weather_player!=null: weather_player.stream_paused=what==NOTIFICATION_APPLICATION_FOCUS_OUT

## 离开场景时停止并释放所有音频引用，避免循环声留在混音器中。
func _exit_tree() -> void:
	for player in ambient_players+effect_players:
		if is_instance_valid(player): player.stop(); player.stream=null
	if is_instance_valid(weather_player): weather_player.stop(); weather_player.stream=null
	weather_streams.clear()
