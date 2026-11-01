class_name SlotMenu
extends Control
## Compact 10-slot save/load list. Uses Popochiu files via GameFlow.

enum Mode { SAVE, LOAD }

signal slot_chosen(slot: int)
signal cancelled

var _mode: Mode = Mode.LOAD
var _buttons: Array[Button] = []

@onready var _heading: Label = %Heading
@onready var _slot_box: VBoxContainer = %Slots
@onready var _back: Button = %Back


func _ready() -> void:
	visible = false
	_back.pressed.connect(func () -> void: cancelled.emit())
	# Build the 10 buttons now; labels refresh on open so we never touch E before it is ready.
	if _buttons.is_empty():
		_build_slots(false)


func configure(mode: Mode) -> void:
	_mode = mode
	if _heading:
		_heading.text = "Save Game" if mode == Mode.SAVE else "Load Game"
	refresh()


func open_save() -> void:
	configure(Mode.SAVE)
	visible = true


func open_load() -> void:
	configure(Mode.LOAD)
	visible = true


func refresh() -> void:
	if _buttons.is_empty():
		return
	for slot in range(1, GameFlow.SLOT_COUNT + 1):
		var button := _buttons[slot - 1]
		button.text = GameFlow.slot_label(slot)
		if _mode == Mode.LOAD:
			button.disabled = not GameFlow.slot_exists(slot)
		else:
			button.disabled = false


func _build_slots(do_refresh := true) -> void:
	for child in _slot_box.get_children():
		child.queue_free()
	_buttons.clear()
	for slot in range(1, GameFlow.SLOT_COUNT + 1):
		var button := Button.new()
		button.custom_minimum_size = Vector2(0, 22)
		button.alignment = HORIZONTAL_ALIGNMENT_LEFT
		button.text = "Slot %d  —  empty" % slot
		button.pressed.connect(_on_slot_pressed.bind(slot))
		_slot_box.add_child(button)
		_buttons.append(button)
	if do_refresh:
		refresh()


func _on_slot_pressed(slot: int) -> void:
	if _mode == Mode.SAVE:
		GameFlow.save_slot(slot)
		refresh()
	slot_chosen.emit(slot)
