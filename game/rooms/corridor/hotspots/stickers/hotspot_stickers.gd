@tool
extends PopochiuHotspot


func on_look() -> void:
	await C.player.face_clicked()
	await C.player.say("Family stickers. A faded sun, a lopsided star, something that used to be a dog.")


func on_talk() -> void:
	await C.player.say("The stickers have heard every pep talk. They're over it.")


func on_interact() -> void:
	await C.player.say("If I peel one, Naomi will know. She always knows.")


func _on_click() -> void:
	E.command_fallback()
