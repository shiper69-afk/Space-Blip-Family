@tool
extends PopochiuRoom

const Data := preload("room_cockpit_state.gd")

var state: Data = load("res://game/rooms/cockpit/room_cockpit.tres")


func _on_room_entered() -> void:
	if C.player.last_room == "Corridor":
		C.player.position = Vector2(560, 292)
		C.player.face_left()
	else:
		C.player.position = Vector2(220, 292)
		C.player.face_right()


func _on_room_transition_finished() -> void:
	if state.visited_first_time:
		await C.player.say("Morning checklist, Millennium Mini Van.")
		await C.player.say("Amber light's already angry. Of course it is.")
