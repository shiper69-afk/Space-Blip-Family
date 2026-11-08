@tool
extends PopochiuHotspot


func on_look() -> void:
	await C.player.face_clicked()
	await C.player.say("The mug flew, then stuck. Entropy and optimism. Classic.")


func on_talk() -> void:
	await C.player.say("It doesn't talk. That's what I like about it.")


func on_interact() -> void:
	await C.player.say("Still glued. A mystery for later. Or never.")


func _on_click() -> void:
	E.command_fallback()
