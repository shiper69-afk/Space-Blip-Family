@tool
extends PopochiuRoom

const Data := preload("room_cockpit_state.gd")
## Painted bridge is 1024×576. Popochiu centers large rooms on the 640×360 viewport,
## so image pixel (x, y) maps to room (x - 192, y - 108).
const FROM_CORRIDOR := Vector2(24, 268)
const AFTER_INTRO := Vector2(320, 272)

var state: Data = load("res://game/rooms/cockpit/room_cockpit.tres")


func _on_room_entered() -> void:
	if C.player.last_room == "Corridor":
		C.player.position = FROM_CORRIDOR
		C.player.face_right()
	else:
		C.player.position = AFTER_INTRO
		C.player.face_right()


func _on_room_transition_finished() -> void:
	# Intro already told the leftover-message / twenty-seconds beat.
	# No extra first-visit line — Popochiu speech clipped on the 1024×576 bridge.
	pass
