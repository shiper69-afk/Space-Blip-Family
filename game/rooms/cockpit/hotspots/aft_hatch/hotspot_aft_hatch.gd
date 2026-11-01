@tool
extends PopochiuHotspot


func on_look() -> void:
	await C.player.face_clicked()
	await C.player.say("Aft hatch. Mid-ship corridor. Joe is probably patrolling a five-meter hallway.")


func on_talk() -> void:
	await C.player.say("Doors don't do conversation. They do hinges.")


func on_interact() -> void:
	await C.player.walk_to_clicked()
	await R.goto_room("Corridor")


func _on_click() -> void:
	E.command_fallback()
