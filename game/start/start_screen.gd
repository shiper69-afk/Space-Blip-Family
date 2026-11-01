extends Control
## First scene. Looping owner background with the game title drawn as overlay text
## (not painted into the startscreen frames).

@onready var _title: Label = %TitleLabel
@onready var _buttons: VBoxContainer = %MenuButtons
@onready var _slot_menu: SlotMenu = %SlotMenu


func _ready() -> void:
	# Runtime overlay — the animated PNG loop does not include this string.
	_title.text = GameFlow.TITLE
	GameFlow.in_game = false
	GameFlow.hide_adventure_gui()
	_slot_menu.visible = false
	_slot_menu.configure(SlotMenu.Mode.LOAD)
	_slot_menu.slot_chosen.connect(_on_slot_chosen)
	_slot_menu.cancelled.connect(_show_main_buttons)
	%NewGame.pressed.connect(_on_new_game)
	%LoadGame.pressed.connect(_on_load_game)
	%Quit.pressed.connect(GameFlow.quit_game)
	var beat := GameFlow.cli_value("intro-beat")
	if beat == "flyby" or beat == "title":
		get_tree().change_scene_to_file(GameFlow.INTRO_SCENE)
		return
	if beat == "bridge":
		GameFlow.begin_gameplay()
		return
	if not GameFlow.cli_value("capture-png").is_empty():
		await GameFlow.maybe_capture_and_quit()


func _on_new_game() -> void:
	await GameFlow.new_game()


func _on_load_game() -> void:
	_buttons.visible = false
	_slot_menu.open_load()


func _show_main_buttons() -> void:
	_slot_menu.visible = false
	_buttons.visible = true


func _on_slot_chosen(slot: int) -> void:
	await GameFlow.load_slot(slot)
