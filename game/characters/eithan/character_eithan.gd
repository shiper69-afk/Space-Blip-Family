@tool
extends PopochiuCharacter

const Data := preload("character_eithan_state.gd")

var state: Data = load("res://game/characters/eithan/character_eithan.tres")


func _on_room_set() -> void:
	pass


func _on_click() -> void:
	E.command_fallback()


func on_look() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.player.say("Eithan. Operations. He speaks in percentages, and he's usually right.")


func on_talk() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.Eithan.say("Synthesizer status: dying. I'm on it.")
	await C.player.say("Tell it the Captain believes in it.")


func on_interact() -> void:
	await on_talk()


func _on_item_used(_item: PopochiuInventoryItem) -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.Eithan.say("Not compatible. I would have written a note.")
