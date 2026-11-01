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
	if C.Joe.state.accepted_printout:
		await C.player.say("Joe cleared me, but the galley isn't built yet. Placeholder door.")
	else:
		await C.Joe.say("That's a restricted wing until I see authorization.")


func _on_click() -> void:
	E.command_fallback()
