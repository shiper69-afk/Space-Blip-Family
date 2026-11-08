@tool
extends PopochiuProp
## Bridge pocket door. RGBA overlay, top-left from [code]door.json[/code].
##
## [code]door_open_00[/code] is the closed door (kid sticker and all). The leaf slides
## left into the wall. [code]open[/code] and [code]close[/code] are 8 frames at 12 fps.
## [code]closed[/code] holds frame 00. [code]open_hold[/code] holds the open pose.
## Close frames are stored on their own even though [code]close_is_reverse_of_open[/code].
##
## The overlay already paints the corridor into the opening. [code]door_corridor_bg[/code]
## and [code]door_mask[/code] are on this prop, hidden, for a manual composite.
## Transparent pixels are only the rounded outer corners, so leave the corridor sprite
## hidden or those corners will cover the bridge.
##
## Instance under Props and leave the root at (180, 48) in a 1024×576 bridge room.
## Not instanced in the 640×360 placeholder cockpit. The aft-hatch hotspot is still
## the corridor exit there. This prop plays the slide; it does not change rooms.

const LAYOUT_PATH := "res://game/bridge/door/door.json"

const PLACEMENT := Vector2(180, 48)
const FRAME_SIZE := Vector2(59, 163)
const DOORWAY_THRESHOLD_Y := 219.0
const WALK_IN_POINT := Vector2(209, 225)
const WALKABLE_SPOT_INSIDE := Vector2(229, 259)

var doorway_threshold_y := DOORWAY_THRESHOLD_Y
var walk_in_point := WALK_IN_POINT
var walkable_spot_inside := WALKABLE_SPOT_INSIDE

@onready var _door: AnimatedSprite2D = $Door


func _ready() -> void:
	if not Engine.is_editor_hint():
		_apply_layout()
	super()


func show_closed() -> void:
	_play(&"closed")


func show_open_hold() -> void:
	_play(&"open_hold")


func play_open() -> void:
	_play(&"open")
	if _door != null:
		await _door.animation_finished
	show_open_hold()


func play_close() -> void:
	_play(&"close")
	if _door != null:
		await _door.animation_finished
	show_closed()


func is_open() -> bool:
	if _door == null:
		return false
	return _door.animation == &"open" or _door.animation == &"open_hold"


func on_look() -> void:
	await C.player.say("Pocket door to the corridor. Slides left into the wall. The sticker stays.")


func on_talk() -> void:
	await C.player.say("Doors don't do conversation. They do whoosh.")


func on_interact() -> void:
	if is_open():
		await play_close()
	else:
		await play_open()


func _on_click() -> void:
	E.command_fallback()


func _play(anim_name: StringName) -> void:
	if _door == null:
		return
	_door.play(anim_name)


func _apply_layout() -> void:
	var data := _read_layout()
	if data.is_empty():
		return
	var origin := Vector2(float(data.get("x", PLACEMENT.x)), float(data.get("y", PLACEMENT.y)))
	var size := Vector2(float(data.get("w", FRAME_SIZE.x)), float(data.get("h", FRAME_SIZE.y)))
	position = origin
	var walk_in: Array = data.get("walk_in_point", [WALK_IN_POINT.x, WALK_IN_POINT.y])
	walk_in_point = Vector2(float(walk_in[0]), float(walk_in[1]))
	walk_to_point = walk_in_point - origin
	var inside: Array = data.get("walkable_spot_inside_room", [WALKABLE_SPOT_INSIDE.x, WALKABLE_SPOT_INSIDE.y])
	walkable_spot_inside = Vector2(float(inside[0]), float(inside[1]))
	doorway_threshold_y = float(data.get("doorway_threshold_y", DOORWAY_THRESHOLD_Y))
	look_at_point = Vector2(size.x * 0.5, size.y * 0.5)
	interaction_polygon = PackedVector2Array([
		Vector2(0, 0), Vector2(size.x, 0), Vector2(size.x, size.y), Vector2(0, size.y),
	])
	var walk_in_marker := get_node_or_null("WalkIn")
	if walk_in_marker is Node2D:
		(walk_in_marker as Node2D).position = walk_to_point
	var threshold := get_node_or_null("Threshold")
	if threshold is Node2D:
		(threshold as Node2D).position = Vector2(size.x * 0.5, doorway_threshold_y - origin.y)
	var inside_marker := get_node_or_null("InsideRoom")
	if inside_marker is Node2D:
		(inside_marker as Node2D).position = walkable_spot_inside - origin


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
