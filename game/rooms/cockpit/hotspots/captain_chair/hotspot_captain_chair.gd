@tool
extends PopochiuHotspot


func on_look() -> void:
	await C.player.face_clicked()
	await C.player.say("The captain chair. Proud. Lumpy. Slightly sticky.")


func on_talk() -> void:
	await C.player.say("I already sat through the briefing. The chair agrees.")


func on_interact() -> void:
	await C.player.say("If I sit down now, the amber light wins.")


func _on_click() -> void:
	E.command_fallback()
