@tool
extends PopochiuHotspot


func on_look() -> void:
	await C.player.face_clicked()
	await C.player.say("Back to the cockpit. The amber light can wait. It won't, but it can.")


func on_interact() -> void:
	await C.player.walk_to_clicked()
	await R.goto_room("Cockpit")


func on_talk() -> void:
	await C.player.say("It's a hatch. It opens. That's the whole personality.")


func _on_click() -> void:
	E.command_fallback()
