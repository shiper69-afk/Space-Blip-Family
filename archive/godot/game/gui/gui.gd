extends SierraHighResGUI
## Sierra High-Res icons are 96px in a 120px bar. At 1024×576 that still eats
## too much of the painted bridge, so shrink the hover verb bar in-game.

const VERB_ICON_SIZE := Vector2(40, 48)
const VERB_BAR_HEIGHT := 64


func _ready() -> void:
	super._ready()
	_shrink_verb_bar()


func _shrink_verb_bar() -> void:
	var menu := get_node_or_null("SierraMenu") as Control
	if menu == null:
		return
	var panel := menu.get_node_or_null("PanelContainer") as PanelContainer
	if panel:
		panel.offset_bottom = float(VERB_BAR_HEIGHT)
	var margin := menu.get_node_or_null("PanelContainer/MarginContainer") as MarginContainer
	if margin:
		margin.add_theme_constant_override("margin_top", 4)
		margin.add_theme_constant_override("margin_bottom", 4)
		margin.add_theme_constant_override("margin_left", 8)
		margin.add_theme_constant_override("margin_right", 8)
	for node in menu.find_children("*", "TextureButton", true, false):
		var button := node as TextureButton
		if button == null:
			continue
		button.ignore_texture_size = true
		button.custom_minimum_size = VERB_ICON_SIZE
		button.stretch_mode = TextureButton.STRETCH_KEEP_ASPECT_CENTERED
	if "input_zone_height" in menu:
		menu.input_zone_height = VERB_BAR_HEIGHT
