@tool
extends PopochiuCharacter

const Data := preload("character_alan_state.gd")

var state: Data = load("res://game/characters/alan/character_alan.tres")


func _play_idle() -> void:
	_play_oriented(idle_animation)


func _play_walk(target_pos: Vector2) -> void:
	face_direction(target_pos)
	_play_oriented(walk_animation)


func _play_oriented(root: String) -> void:
	if animation_player == null:
		return
	var anim := _get_valid_oriented_animation(root)
	if anim.is_empty():
		return
	# Popochiu calls _play_walk every physics frame via turn_towards. Restarting
	# the same clip each frame freezes him on frame 0 so he slides.
	if animation_player.current_animation == anim and animation_player.is_playing():
		return
	animation_player.play(anim)


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
