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
	if GameFlow.mug_stuck:
		_place_stuck_mug()


func _place_stuck_mug() -> void:
	var Frames := preload("res://game/intro/png_frames.gd")
	var mug := Sprite2D.new()
	mug.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	mug.centered = false
	mug.position = Vector2(598, 128)
	mug.z_index = 12
	mug.texture = Frames.load_png("res://game/intro/frames/alan_sleep/mug_stuck_console.png")
	add_child(mug)


func _on_room_transition_finished() -> void:
	# Live Chaya call already played. HUD shows 19:59 and does not tick.
	var beat := GameFlow.cli_value("intro-beat")
	if beat == "walk":
		await _demo_walk()
		return
	if GameFlow.cli_value("auto-new-game") or GameFlow.cli_value("quit-after"):
		var hold := float(GameFlow.cli_value("quit-after"))
		if hold <= 0.0:
			hold = 2.4
		await get_tree().create_timer(hold).timeout
		GameFlow.quit_game()
		return
	if beat == "bridge" or not GameFlow.cli_value("capture-png").is_empty():
		GameFlow.show_adventure_gui()
		if is_instance_valid(PopochiuUtils.e.gui):
			var menu := PopochiuUtils.e.gui.get_node_or_null("SierraMenu") as Control
			if menu:
				menu.show()
				menu.set_process_input(false)
		await GameFlow.maybe_capture_and_quit()


func _demo_walk() -> void:
	C.player.can_move = true
	C.player.position = Vector2(512, 400)
	C.player.face_right()
	await C.player.walk(Vector2(760, 410))
	await C.player.walk(Vector2(260, 410))
	await C.player.walk(Vector2(500, 478))
	await C.player.walk(Vector2(500, 348))
	await C.player.idle()
