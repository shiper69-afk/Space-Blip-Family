@tool
extends PopochiuCharacter

const Data := preload("character_alan_state.gd")

var state: Data = load("res://game/characters/alan/character_alan.tres")


func _on_room_set() -> void:
	pass


func _on_click() -> void:
	E.command_fallback()


func on_look() -> void:
	await C.player.say("Captain of The Millennium Mini Van. That's me. The chair still fits.")


func on_talk() -> void:
	await C.player.say("Talking to myself is still free. For now.")


func on_interact() -> void:
	await C.player.say("I already have my hands full.")


func _on_item_used(_item: PopochiuInventoryItem) -> void:
	await C.player.say("I don't need to use that on myself.")
