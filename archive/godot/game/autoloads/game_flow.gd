extends Node
## Title-screen and 10-slot save/load, wrapping Popochiu's save files (`user://save_%d.json`).

const SLOT_COUNT := 10
const START_SCENE := "res://game/start/start_screen.tscn"
const INTRO_SCENE := "res://game/intro/intro.tscn"
const GRANDMA_CALL_SCENE := "res://game/intro/grandma_call.tscn"
const COCKPIT_SCENE := "res://game/rooms/cockpit/room_cockpit.tscn"
const TITLE := "Are We There Yet? (Galaxy edition)"
const EPISODE := "Episode 1: Grandma's Calling"
var mug_stuck := false

var in_game := false
var in_intro := false


func cli_value(name: String) -> String:
	var prefix := "--%s=" % name
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with(prefix):
			return arg.substr(prefix.length())
		if arg == "--%s" % name:
			return "1"
	return ""


func maybe_capture_and_quit() -> void:
	var path := cli_value("capture-png")
	if path.is_empty():
		return
	await get_tree().process_frame
	await get_tree().process_frame
	await get_tree().create_timer(0.45).timeout
	var image := get_viewport().get_texture().get_image()
	if image:
		image.save_png(path)
	get_tree().quit()


func hide_adventure_gui() -> void:
	_apply_adventure_gui(false)
	# E._ready yields a frame after instancing the GUI; hide again once that finishes.
	_apply_adventure_gui.call_deferred(false)


func show_adventure_gui() -> void:
	_apply_adventure_gui(true)
	# Win any deferred hide from the title screen when jumping straight to a room.
	_apply_adventure_gui.call_deferred(true)


func _apply_adventure_gui(show: bool) -> void:
	var gi := PopochiuUtils.e.get_node_or_null("GraphicInterfaceLayer") as CanvasLayer
	if gi:
		gi.visible = show
	if is_instance_valid(PopochiuUtils.e.gui):
		PopochiuUtils.e.gui.visible = show
	if is_instance_valid(PopochiuUtils.e.camera):
		PopochiuUtils.e.camera.enabled = show
		if show:
			PopochiuUtils.e.camera.restore_default_limits()
			PopochiuUtils.e.camera.make_current()
	if show:
		PopochiuUtils.g.show_interface()
		if is_instance_valid(PopochiuUtils.cursor):
			PopochiuUtils.cursor.show()
		Input.set_mouse_mode(Input.MOUSE_MODE_HIDDEN)
	else:
		PopochiuUtils.g.hide_interface()
		if is_instance_valid(PopochiuUtils.cursor):
			PopochiuUtils.cursor.hide()
		Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)


func slot_exists(slot: int) -> bool:
	return FileAccess.file_exists(PopochiuSaveLoad.SAVE_GAME_PATH % slot)


func slot_label(slot: int) -> String:
	var descriptions: Dictionary = PopochiuSaveLoad.new().get_saves_descriptions()
	if descriptions.has(slot):
		return "Slot %d  —  %s" % [slot, descriptions[slot]]
	return "Slot %d  —  empty" % slot


func make_save_description() -> String:
	var now := Time.get_datetime_dict_from_system()
	var stamp := "%04d-%02d-%02d %02d:%02d" % [
		now.year, now.month, now.day, now.hour, now.minute
	]
	var room := "Unknown"
	if is_instance_valid(PopochiuUtils.r.current):
		room = PopochiuUtils.r.current.script_name
	return "%s  |  %s" % [stamp, room]


func new_game() -> void:
	await reset_slice_state()
	in_game = false
	in_intro = true
	hide_adventure_gui()
	get_tree().change_scene_to_file(INTRO_SCENE)


func start_grandma_call() -> void:
	in_intro = true
	in_game = false
	hide_adventure_gui()
	get_tree().change_scene_to_file.call_deferred(GRANDMA_CALL_SCENE)


func begin_gameplay() -> void:
	in_intro = false
	in_game = true
	show_adventure_gui()
	get_tree().change_scene_to_file(COCKPIT_SCENE)


func save_slot(slot: int) -> void:
	if not in_game or not PopochiuUtils.e.in_room:
		return
	PopochiuUtils.e.save_game(slot, make_save_description())


func load_slot(slot: int) -> void:
	if not slot_exists(slot):
		return
	in_intro = false
	if PopochiuUtils.e.in_room:
		in_game = true
		show_adventure_gui()
		PopochiuUtils.e.load_game(slot)
		return
	await _load_from_title(slot)


func _load_from_title(slot: int) -> void:
	for c_name: String in PopochiuUtils.c.characters_states:
		var character: PopochiuCharacter = PopochiuUtils.c.get_character(c_name)
		if is_instance_valid(character):
			await PopochiuUtils.i.clean_inventory(character)
	var loader := PopochiuSaveLoad.new()
	PopochiuUtils.e.loaded_game = loader.load_game(slot)
	if PopochiuUtils.e.loaded_game.is_empty():
		return
	var room_name: String = PopochiuUtils.e.loaded_game.get("player", {}).get("room", "Cockpit")
	var tres_path: String = PopochiuResources.get_data_value("rooms", room_name, "")
	if tres_path.is_empty():
		return
	var room_data: Resource = load(tres_path)
	in_game = true
	show_adventure_gui()
	get_tree().change_scene_to_file(room_data.scene)


func return_to_title() -> void:
	in_game = false
	in_intro = false
	var menu := get_node_or_null("/root/GameMenu")
	if menu and menu.has_method("close"):
		menu.close()
	hide_adventure_gui()
	PopochiuUtils.e.in_room = false
	get_tree().paused = false
	get_tree().change_scene_to_file(START_SCENE)


func quit_game() -> void:
	get_tree().quit()


func reset_slice_state() -> void:
	PopochiuUtils.e.loaded_game = {}
	if is_instance_valid(PopochiuUtils.c.player):
		await PopochiuUtils.i.clean_inventory()
	_reset_room("Cockpit", true)
	_reset_room("Corridor", false)
	var joe: PopochiuCharacter = PopochiuUtils.c.get_character("Joe")
	if is_instance_valid(joe) and joe.state and "accepted_printout" in joe.state:
		joe.state.accepted_printout = false


func _reset_room(script_name: String, has_printout: bool) -> void:
	if not PopochiuUtils.r.rooms_states.has(script_name):
		return
	var state: PopochiuRoomData = PopochiuUtils.r.rooms_states[script_name]
	state.visited_times = 0
	state.characters.clear()
	if has_printout and "printout_taken" in state:
		state.printout_taken = false
