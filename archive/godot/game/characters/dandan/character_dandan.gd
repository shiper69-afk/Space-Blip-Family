@tool
extends PopochiuCharacter

const Data := preload("character_dandan_state.gd")

var state: Data = load("res://game/characters/dandan/character_dandan.tres")


func _on_room_set() -> void:
	pass


func _on_click() -> void:
	E.command_fallback()


func on_look() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.player.say("DanDan. Head chef. The omelet has already judged me.")


func on_talk() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.DanDan.say("Nebula omelet. If the synthesizer stops screaming.")
	await C.player.say("Cook for Grandma. My standards are a suggestion.")


func on_interact() -> void:
	await on_talk()


func _on_item_used(_item: PopochiuInventoryItem) -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.DanDan.say("That's not an ingredient. I checked.")
