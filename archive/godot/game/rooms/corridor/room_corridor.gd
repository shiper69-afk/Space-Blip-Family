@tool
extends PopochiuRoom

const Data := preload("room_corridor_state.gd")

var state: Data = load("res://game/rooms/corridor/room_corridor.tres")


func _on_room_entered() -> void:
	C.player.position = Vector2(144, 467)
	C.player.face_right()


func _on_room_transition_finished() -> void:
	# Joe stays on the bridge after the call. Only greet if a save left him here.
	if state.visited_first_time and has_character("Joe"):
		await C.Joe.say("Halt. This corridor is under family security.")
