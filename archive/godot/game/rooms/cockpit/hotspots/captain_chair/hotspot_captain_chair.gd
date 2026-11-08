@tool
extends PopochiuHotspot


func on_look() -> void:
	await C.player.face_clicked()
	await C.player.say("The DADHOOD chair. Still warm. Still lumpy. Still mine.")


func on_talk() -> void:
	await C.player.say("The chair and I have an understanding. It holds. I sit. Later.")


func on_interact() -> void:
	await C.player.say("If I sit down now, Grandma wins on posture alone.")


func _on_click() -> void:
	E.command_fallback()
