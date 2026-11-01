extends CanvasLayer
## In-game Esc menu. Does not steal popochiu-skip during cutscenes, system text, or popups.

@onready var _root: Control = $Root
@onready var _buttons: VBoxContainer = %MenuButtons
@onready var _slot_menu: SlotMenu = %SlotMenu


func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	layer = 128
	_root.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hide()
	_slot_menu.visible = false
	_slot_menu.slot_chosen.connect(_on_slot_chosen)
	_slot_menu.cancelled.connect(_show_buttons)
	%Resume.pressed.connect(close)
	%SaveGame.pressed.connect(_on_save)
	%LoadGame.pressed.connect(_on_load)
	%ReturnToTitle.pressed.connect(_on_return_to_title)
	%Quit.pressed.connect(GameFlow.quit_game)


func _input(event: InputEvent) -> void:
	if GameFlow.in_intro or not GameFlow.in_game:
		return
	if not event.is_action_pressed("game-menu"):
		return
	if _should_defer_to_skip():
		return
	get_viewport().set_input_as_handled()
	if visible:
		close()
	else:
		open()


func open() -> void:
	_slot_menu.visible = false
	_buttons.visible = true
	show()
	get_tree().paused = true
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	if is_instance_valid(PopochiuUtils.cursor):
		PopochiuUtils.cursor.hide()


func close() -> void:
	hide()
	_slot_menu.visible = false
	_buttons.visible = true
	get_tree().paused = false
	if GameFlow.in_game:
		Input.set_mouse_mode(Input.MOUSE_MODE_HIDDEN)
		if is_instance_valid(PopochiuUtils.cursor):
			PopochiuUtils.cursor.show()


func _should_defer_to_skip() -> bool:
	if visible:
		return false
	if PopochiuUtils.e.playing_queue:
		return true
	if PopochiuUtils.g.is_blocked:
		return true
	if is_instance_valid(PopochiuUtils.e.gui) and not PopochiuUtils.e.gui.popups_stack.is_empty():
		return true
	return false


func _show_buttons() -> void:
	_slot_menu.visible = false
	_buttons.visible = true


func _on_save() -> void:
	_buttons.visible = false
	_slot_menu.open_save()


func _on_load() -> void:
	_buttons.visible = false
	_slot_menu.open_load()


func _on_slot_chosen(slot: int) -> void:
	if _slot_menu._mode == SlotMenu.Mode.LOAD:
		close()
		GameFlow.load_slot(slot)
	# Save already wrote the file inside SlotMenu; stay on the list so the stamp updates.


func _on_return_to_title() -> void:
	close()
	GameFlow.return_to_title()
