@tool
extends PopochiuHotspot


func on_look() -> void:
	await C.player.walk_to_clicked()
	await C.player.face_clicked()
	await C.player.say("Chaya hung up mid-FRAAANK. The clock says %s and it is not moving. That's worse." % GameFlow.story_countdown)


func on_talk() -> void:
	await C.player.say("Hello? No. We are not starting early. We are not ready.")


func on_interact() -> void:
	await C.player.face_clicked()
	await C.player.say("If I poke the call it will only get closer. Emotionally.")


func _on_click() -> void:
	E.command_fallback()
