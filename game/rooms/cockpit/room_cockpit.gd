@tool
extends PopochiuRoom

const Data := preload("room_cockpit_state.gd")
## Painted bridge is 1024×576, matching the project viewport. Room coords = image coords.
const FROM_CORRIDOR := Vector2(216, 376)
const AFTER_INTRO := Vector2(512, 380)

var state: Data = load("res://game/rooms/cockpit/room_cockpit.tres")


func _on_room_entered() -> void:
	if C.player.last_room == "Corridor":
		C.player.position = FROM_CORRIDOR
		C.player.face_right()
	else:
		C.player.position = AFTER_INTRO
		C.player.face_right()


func _on_room_transition_finished() -> void:
	# Intro already told the leftover-message / twenty-seconds beat.
	# No extra first-visit line — Popochiu speech clipped on the 1024×576 bridge.
	if GameFlow.cli_value("intro-beat") == "bridge" or not GameFlow.cli_value("capture-png").is_empty():
		GameFlow.show_adventure_gui()
		if is_instance_valid(PopochiuUtils.e.gui):
			var menu := PopochiuUtils.e.gui.get_node_or_null("SierraMenu") as Control
			if menu:
				menu.show()
				menu.set_process_input(false)
		await GameFlow.maybe_capture_and_quit()
