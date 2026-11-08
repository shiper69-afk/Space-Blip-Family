@tool
extends PopochiuCharacter

const Data := preload("character_joe_state.gd")

var state: Data = load("res://game/characters/joe/character_joe.tres")


func _on_room_set() -> void:
	pass


func _on_click() -> void:
	E.command_fallback()


func on_look() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.player.say("Joe. Sixteen. Head of security. The badge is bigger than the bridge.")


func on_talk() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	if state.accepted_printout:
		await C.Joe.say("Printout's logged, Captain. Galley wing is next on the list.")
		await C.player.say("That's my head of security.")
	else:
		await C.Joe.say("Hold it. Security patrol. I need authorization before anyone wanders.")
		await C.player.say("It's me, Joe. Dad. Captain.")
		await C.Joe.say("Protocol is protocol. Bring me the cockpit printout.")


func on_interact() -> void:
	await on_talk()


func _on_item_used(_item: PopochiuInventoryItem) -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	if _item == I.AlertPrintout:
		await C.player.say("Authorization, as requested.")
		await C.Joe.say("Alert Printout received. Logging the all-clear.")
		await I.AlertPrintout.remove()
		state.accepted_printout = true
		await C.Joe.say("You're cleared, Captain. Try not to trip over DavDav.")
	else:
		await C.Joe.say("That's not the authorization form.")
