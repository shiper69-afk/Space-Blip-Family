@tool
extends PopochiuCharacter

const Data := preload("character_davdav_state.gd")

var state: Data = load("res://game/characters/davdav/character_davdav.tres")


func _on_room_set() -> void:
	pass


func _on_click() -> void:
	E.command_fallback()


func on_look() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.player.say("DavDav. Five. The red button's most loyal customer.")


func on_talk() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.DavDav.say("Red means yes!")
	await C.player.say("Red means we have a meeting.")


func on_interact() -> void:
	await on_talk()


func _on_item_used(_item: PopochiuInventoryItem) -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.DavDav.say("Is it a toy? Then no.")
