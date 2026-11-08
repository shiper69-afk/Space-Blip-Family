@tool
extends PopochiuCharacter

const Data := preload("character_naomi_state.gd")

var state: Data = load("res://game/characters/naomi/character_naomi.tres")


func _on_room_set() -> void:
	pass


func _on_click() -> void:
	E.command_fallback()


func on_look() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.player.say("Naomi. Second in command. First in being right.")


func on_talk() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.Naomi.say("Twenty minutes. Clean ship, hot breakfast, and you, combed.")
	await C.player.say("I can do one of those. Maybe.")


func on_interact() -> void:
	await on_talk()


func _on_item_used(_item: PopochiuInventoryItem) -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.Naomi.say("I don't want that. I want a clean ship.")
