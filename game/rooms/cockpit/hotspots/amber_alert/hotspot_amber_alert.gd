@tool
extends PopochiuHotspot


func _on_click() -> void:
	E.command_fallback()


func on_look() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.player.say("The family-systems light is stuck on amber. It pulses like it's judging me.")


func on_talk() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.player.say("Computer. Status.")
	await C.player.say("...It prints a sigh. Then a form.")
	await _maybe_give_printout()


func on_interact() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await _maybe_give_printout()


func _on_item_used(_item: PopochiuInventoryItem) -> void:
	await C.player.face_clicked()
	await C.player.say("The light wants a form, not more stuff on the console.")


func _maybe_give_printout() -> void:
	if R.Cockpit.state.printout_taken or I.is_item_in_inventory("AlertPrintout"):
		await C.player.say("I already have the printout. Joe will want the original.")
		return
	await C.player.say("Acknowledged. Printing the all-clear request...")
	R.Cockpit.state.printout_taken = true
	await I.AlertPrintout.add()
	await C.player.say("An Alert Printout. Official enough for Joe.")
