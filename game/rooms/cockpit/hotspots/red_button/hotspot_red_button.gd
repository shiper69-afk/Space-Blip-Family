@tool
extends PopochiuHotspot


func on_look() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.player.say("DO NOT PRESS. SERIOUSLY. — MOM. DavDav read that as a suggestion.")


func on_talk() -> void:
	await C.player.say("I am not bargaining with a button. It already won.")


func on_interact() -> void:
	await C.player.face_clicked()
	await C.player.say("DavDav already slapped it when she called. Once was plenty.")


func _on_click() -> void:
	E.command_fallback()
