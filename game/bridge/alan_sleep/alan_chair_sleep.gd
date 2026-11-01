class_name AlanChairSleep
extends Node2D
## Alan asleep in the captain's chair, for the Grandma-call intro.
##
## Instance at (0, 0) in the 1024×576 bridge room, above [code]prop_bridge_v5[/code]
## (the chair is painted into the background; this puppet draws on top of it).
## Not instanced in the 640×360 placeholder cockpit.
##
## [code]alan_sleep.json[/code] places the puppet at (462, 70). [code]sleep[/code] loops
## 8 frames at 6 fps with the armrest mug bob and the zzz overlay at (540, 66).
## [method play_wake] plays [code]wake_jolt[/code] (6 frames at 10 fps): he jolts, the
## mug follows [code]mug_path[/code], then sticks at [code]final_prop[/code] (598, 128).
## Say [constant AWAKE_LINE] on the yell — "ALAN!" — when you call [method play_wake].
##
## [code]mug_path[].rot[/code] is already baked into [code]mug_wake_XX.png[/code]. The
## AnimationPlayer moves the sprite and swaps frames; it does not rotate again.
## [code]mug_wake_00[/code] is [code]mug_prop[/code]. [code]mug_wake_05[/code] is
## [code]mug_stuck_console[/code].
##
## Tracks are baked in the scene so the editor can preview them, then rebuilt from
## the JSON on ready so the file stays in charge.

const LAYOUT_PATH := "res://game/bridge/alan_sleep/alan_sleep.json"
const AWAKE_LINE := "I'M AWAKE! I'M DRIVING!"

@export var autoplay_sleep := true

signal woke

var _layout: Dictionary = {}

@onready var alan: AnimatedSprite2D = $Alan
@onready var zzz: AnimatedSprite2D = $Zzz
@onready var mug: AnimatedSprite2D = $Mug
@onready var animation_player: AnimationPlayer = $AnimationPlayer


func _ready() -> void:
	_layout = _read_layout()
	if not _layout.is_empty():
		_place_from_layout(_layout)
		_build_animations(_layout)
	if autoplay_sleep:
		play_sleep()


func awake_line() -> String:
	var line := AWAKE_LINE
	if _layout.has("wake_jolt") and (_layout["wake_jolt"] as Dictionary).has("line"):
		line = str((_layout["wake_jolt"] as Dictionary)["line"])
	return line


func play_sleep() -> void:
	if animation_player != null and animation_player.has_animation(&"sleep"):
		animation_player.play(&"sleep")


func play_wake() -> void:
	if animation_player == null or not animation_player.has_animation(&"wake"):
		_stick_mug()
		woke.emit()
		return
	animation_player.play(&"wake")
	await animation_player.animation_finished
	_stick_mug()
	woke.emit()


func _place_from_layout(data: Dictionary) -> void:
	alan.centered = false
	alan.position = Vector2(float(data.get("x", 462)), float(data.get("y", 70)))
	var sleep: Dictionary = data.get("sleep_chair", {})
	var zzz_spec: Dictionary = sleep.get("zzz", {})
	zzz.centered = false
	zzz.position = Vector2(float(zzz_spec.get("x", 540)), float(zzz_spec.get("y", 66)))
	mug.centered = false
	mug.rotation = 0.0
	var mug_pos: Array = sleep.get("mug_pos", [])
	if not mug_pos.is_empty():
		mug.position = Vector2(float(mug_pos[0][0]), float(mug_pos[0][1]))


func _build_animations(data: Dictionary) -> void:
	if animation_player.has_animation_library(&""):
		animation_player.remove_animation_library(&"")
	var library := AnimationLibrary.new()
	library.add_animation(&"sleep", _make_sleep(data.get("sleep_chair", {})))
	library.add_animation(&"wake", _make_wake(data.get("wake_jolt", {})))
	animation_player.add_animation_library(&"", library)


func _make_sleep(spec: Dictionary) -> Animation:
	var frame_count := 8
	var frames: Array = spec.get("frames", [])
	if not frames.is_empty():
		frame_count = frames.size()
	var fps := float(spec.get("fps", 6))
	if fps <= 0.0:
		fps = 6.0
	var anim := Animation.new()
	anim.resource_name = "sleep"
	anim.length = frame_count / fps
	anim.loop_mode = Animation.LOOP_LINEAR
	anim.step = 1.0 / fps
	var times := _times(frame_count, fps)
	var frame_ids: Array = []
	for i in frame_count:
		frame_ids.append(i)
	_add_discrete(anim, "Alan:animation", [0.0], [&"sleep_chair"])
	_add_discrete(anim, "Alan:frame", times, frame_ids)
	_add_discrete(anim, "Zzz:animation", [0.0], [&"zzz"])
	_add_discrete(anim, "Zzz:visible", [0.0], [true])
	_add_discrete(anim, "Zzz:frame", times, frame_ids)
	_add_discrete(anim, "Mug:animation", [0.0], [&"rest"])
	_add_discrete(anim, "Mug:frame", [0.0], [0])
	_add_discrete(anim, "Mug:rotation", [0.0], [0.0])
	var positions: Array = []
	var mug_pos: Array = spec.get("mug_pos", [])
	for i in frame_count:
		if i < mug_pos.size():
			positions.append(Vector2(float(mug_pos[i][0]), float(mug_pos[i][1])))
		else:
			positions.append(mug.position)
	_add_discrete(anim, "Mug:position", times, positions)
	return anim


func _make_wake(spec: Dictionary) -> Animation:
	var path: Array = spec.get("mug_path", [])
	var frame_count := path.size()
	if frame_count == 0:
		var frames: Array = spec.get("frames", [])
		frame_count = maxi(frames.size(), 1)
	var fps := float(spec.get("fps", 10))
	if fps <= 0.0:
		fps = 10.0
	var anim := Animation.new()
	anim.resource_name = "wake"
	anim.length = frame_count / fps
	anim.loop_mode = Animation.LOOP_NONE
	anim.step = 1.0 / fps
	var times := _times(frame_count, fps)
	var frame_ids: Array = []
	var positions: Array = []
	for i in frame_count:
		frame_ids.append(i)
		if i < path.size():
			var step: Dictionary = path[i]
			positions.append(Vector2(float(step.get("x", 0)), float(step.get("y", 0))))
		else:
			positions.append(mug.position)
	_add_discrete(anim, "Alan:animation", [0.0], [&"wake_jolt"])
	_add_discrete(anim, "Alan:frame", times, frame_ids)
	_add_discrete(anim, "Zzz:visible", [0.0], [false])
	_add_discrete(anim, "Mug:animation", [0.0], [&"fly"])
	_add_discrete(anim, "Mug:frame", times, frame_ids)
	_add_discrete(anim, "Mug:rotation", [0.0], [0.0])
	_add_discrete(anim, "Mug:position", times, positions)
	return anim


func _stick_mug() -> void:
	var final := {"x": 598, "y": 128}
	if _layout.has("wake_jolt"):
		var spec: Dictionary = _layout["wake_jolt"]
		if spec.has("final_prop"):
			final = spec["final_prop"]
	mug.animation = &"stuck"
	mug.frame = 0
	mug.rotation = 0.0
	mug.position = Vector2(float(final.get("x", 598)), float(final.get("y", 128)))
	zzz.visible = false


func _times(count: int, fps: float) -> Array:
	var times: Array = []
	for i in count:
		times.append(float(i) / fps)
	return times


func _add_discrete(anim: Animation, path: String, times: Array, values: Array) -> void:
	var idx := anim.add_track(Animation.TYPE_VALUE)
	anim.track_set_path(idx, NodePath(path))
	anim.track_set_interpolation_type(idx, Animation.INTERPOLATION_NEAREST)
	anim.value_track_set_update_mode(idx, Animation.UPDATE_DISCRETE)
	for i in times.size():
		anim.track_insert_key(idx, float(times[i]), values[i])


func _read_layout() -> Dictionary:
	if not FileAccess.file_exists(LAYOUT_PATH):
		return {}
	var file := FileAccess.open(LAYOUT_PATH, FileAccess.READ)
	if file == null:
		return {}
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary:
		return parsed
	return {}
