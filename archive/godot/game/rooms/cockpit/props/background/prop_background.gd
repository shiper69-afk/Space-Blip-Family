@tool
extends PopochiuProp
## Painted bridge (`bridge_v5`), blink frames 00/01.

const Frames := preload("res://game/intro/png_frames.gd")
const FRAME_A := "res://game/rooms/cockpit/props/background/bridge_v5_00.png"
const FRAME_B := "res://game/rooms/cockpit/props/background/bridge_v5_01.png"
const BLINK := 0.48

var _frames: Array[Texture2D] = []
var _index := 0
var _accum := 0.0


func _ready() -> void:
	super()
	_frames = [Frames.load_png(FRAME_A), Frames.load_png(FRAME_B)]
	_apply(0)


func _process(delta: float) -> void:
	if Engine.is_editor_hint() or _frames.size() < 2:
		return
	if _frames[0] == null or _frames[1] == null:
		return
	_accum += delta
	if _accum < BLINK:
		return
	_accum = 0.0
	_index = 1 - _index
	_apply(_index)


func _apply(index: int) -> void:
	if index < 0 or index >= _frames.size():
		return
	if _frames[index] == null:
		return
	if is_instance_valid($Sprite2D):
		$Sprite2D.texture = _frames[index]
