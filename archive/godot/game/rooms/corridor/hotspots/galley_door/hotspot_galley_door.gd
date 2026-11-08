@tool
extends PopochiuHotspot


func on_look() -> void:
	await C.player.face_clicked()
	await C.player.say("Galley wing. DanDan's domain. Closed for this slice.")


func on_talk() -> void:
	await C.player.say("The door does not discuss breakfast.")


func on_interact() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	var joe := C.get_character("Joe")
	if joe and joe.state.accepted_printout:
		await C.player.say("Joe cleared me, but the galley isn't built yet. Placeholder door.")
	elif R.current and R.current.has_character("Joe"):
		await C.Joe.say("That's a restricted wing until I see authorization.")
	else:
		await C.player.say("Joe locked this from the bridge. He wants the printout first.")


func _on_click() -> void:
	E.command_fallback()
