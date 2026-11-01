@tool
extends PopochiuRoom

const Data := preload("room_corridor_state.gd")

var state: Data = load("res://game/rooms/corridor/room_corridor.tres")


func _on_room_entered() -> void:
	C.player.position = Vector2(90, 292)
	C.player.face_right()
	if is_instance_valid(C.Joe):
		C.Joe.position = Vector2(400, 292)
		C.Joe.face_left()


func _on_room_transition_finished() -> void:
	if state.visited_first_time:
		await C.Joe.say("Halt. This corridor is under family security.")
