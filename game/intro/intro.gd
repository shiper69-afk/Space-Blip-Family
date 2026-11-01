extends Control
## Skippable New Game intro. Follows docs/intro-script.md.
## Click or Esc skips the rest and starts gameplay as Alan.

const Frames := preload("res://game/intro/png_frames.gd")
const SHIP_DIR := "res://game/intro/frames/ship"
const CAST := "res://game/intro/frames"

var _skipped := false
var _finished := false
var _ship_frames: Array[Texture2D] = []
var _ship_index := 0
var _ship_accum := 0.0
var _ship_cough := false
var _cast_anim: Dictionary = {}
var _amber := false

@onready var _starfield: Node2D = %Starfield
@onready var _ship: Sprite2D = %Ship
@onready var _sticker_a: Label = %StickerA
@onready var _sticker_b: Label = %StickerB
@onready var _dice: Label = %FuzzyDice
@onready var _cast_layer: Node2D = %CastLayer
@onready var _flash: ColorRect = %Flash
@onready var _scratch: Label = %ScratchLabel
@onready var _speaker: Label = %Speaker
@onready var _line: Label = %Line
@onready var _dialog: PanelContainer = %DialogueBox
@onready var _title_card: Control = %TitleCard
@onready var _grandma: Control = %GrandmaCard
@onready var _countdown: Label = %BigCountdown
@onready var _interior: ColorRect = %Interior
@onready var _vignette_caption: Label = %VignetteCaption
@onready var _skip_hint: Label = %SkipHint
@onready var _fade: ColorRect = %Fade


func _ready() -> void:
	GameFlow.in_intro = true
	GameFlow.in_game = false
	GameFlow.hide_adventure_gui()
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	_ship_frames = Frames.load_seq(SHIP_DIR, "idle", 8)
	if _ship_frames.is_empty():
		_ship_frames = Frames.load_seq(SHIP_DIR, "charge", 8)
	_ship.texture = _ship_frames[0] if not _ship_frames.is_empty() else null
	_ship.position = Vector2(-80, 200)
	_hide_decor()
	_title_card.visible = false
	_grandma.visible = false
	_countdown.visible = false
	_interior.visible = false
	_vignette_caption.visible = false
	_flash.modulate.a = 0.0
	_fade.modulate.a = 1.0
	_play()


func _process(delta: float) -> void:
	if _ship_frames.size() > 1 and _ship.visible:
		_ship_accum += delta
		if _ship_accum >= (0.09 if _ship_cough else 0.14):
			_ship_accum = 0.0
			_ship_index = (_ship_index + 1) % _ship_frames.size()
			_ship.texture = _ship_frames[_ship_index]
		if _ship_cough:
			_ship.position.y += sin(Time.get_ticks_msec() * 0.02) * 0.35
	for name: String in _cast_anim.keys():
		var data: Dictionary = _cast_anim[name]
		data.accum += delta
		if data.accum >= 0.16:
			data.accum = 0.0
			data.index = (data.index + 1) % data.frames.size()
			(data.node as Sprite2D).texture = data.frames[data.index]
	if _amber and _interior.visible:
		var pulse: float = 0.55 + 0.45 * absf(sin(Time.get_ticks_msec() * 0.008))
		_interior.color = Color(0.18 * pulse, 0.08, 0.04, 1)


func _input(event: InputEvent) -> void:
	if _finished:
		return
	var click: bool = false
	if event is InputEventMouseButton:
		var mouse := event as InputEventMouseButton
		click = mouse.pressed and mouse.button_index == MOUSE_BUTTON_LEFT
	var skip_key: bool = event.is_action_pressed("ui_cancel") or event.is_action_pressed("popochiu-skip")
	if click or skip_key:
		get_viewport().set_input_as_handled()
		_skip()


func _skip() -> void:
	if _skipped or _finished:
		return
	_skipped = true
	_end_intro()


func _play() -> void:
	await _fade_to(0.0, 0.6)
	if _skipped:
		return
	await _opening()
	if _skipped:
		return
	await _tour()
	if _skipped:
		return
	await _cockpit_beats()
	if _skipped:
		return
	await _title()
	if _skipped:
		return
	_end_intro()


func _opening() -> void:
	_starfield.system = _starfield.SYSTEM_DEEP
	_ship.visible = false
	await _say("NARRATOR", "Space. The final frontier. A vast, silent ocean of stars, where brave explorers boldly go where no one has gone before.", 6.4)
	if _skipped:
		return
	await _say("DAVDAV (muffled)", "Are we there yeeeet?", 2.6)
	if _skipped:
		return
	await _say("NARRATOR", "...Mostly silent.", 2.0)
	if _skipped:
		return
	await _record_scratch()
	if _skipped:
		return
	_show_ship_coughing()
	_starfield.system = _starfield.SYSTEM_BINARY
	_sticker_a.visible = true
	_sticker_b.visible = true
	_dice.visible = true
	await _say("NARRATOR", "These are the voyages of The Millennium Mini Van. Her ongoing mission: to explore strange new worlds, to seek out clean bathrooms, and to boldly go wherever Dad swears is \"a shortcut.\"", 7.2)
	if _skipped:
		return
	_starfield.system = _starfield.SYSTEM_NEBULA
	await _wait(1.4)
	if _skipped:
		return
	_starfield.system = _starfield.SYSTEM_CLUSTER
	await _fly_ship_across()


func _record_scratch() -> void:
	_scratch.visible = true
	_scratch.text = "SKRRRT—"
	_flash.modulate = Color(1, 1, 1, 0.85)
	var tween := create_tween()
	tween.tween_property(_flash, "modulate:a", 0.0, 0.28)
	# Visual stand-in for the music stopping. No voice / music audio in this slice.
	await _wait(0.55)
	_scratch.visible = false


func _show_ship_coughing() -> void:
	var jump := Frames.load_seq(SHIP_DIR, "jump", 8)
	if not jump.is_empty():
		_ship_frames = jump
	_ship_cough = true
	_ship.visible = true
	_ship.position = Vector2(70, 190)
	_ship.scale = Vector2(2.4, 2.4)
	var wobble := create_tween()
	wobble.set_loops(4)
	wobble.tween_property(_ship, "rotation_degrees", 6.0, 0.12)
	wobble.tween_property(_ship, "rotation_degrees", -5.0, 0.12)
	wobble.tween_property(_ship, "rotation_degrees", 0.0, 0.1)


func _fly_ship_across() -> void:
	_ship_cough = false
	var idle := Frames.load_seq(SHIP_DIR, "idle", 8)
	if not idle.is_empty():
		_ship_frames = idle
	_ship.rotation_degrees = 0.0
	var tween := create_tween()
	tween.tween_property(_ship, "position", Vector2(720, 130), 3.4)
	tween.parallel().tween_property(_ship, "scale", Vector2(1.4, 1.4), 3.4)
	await tween.finished


func _tour() -> void:
	_hide_decor()
	_ship.visible = false
	_interior.visible = true
	_interior.color = Color(0.07, 0.06, 0.1, 1)
	await _say("NARRATOR", "Stardate: Tuesday. Day 47 of a trip that was supposed to take three days. The crew rests.", 4.0)
	if _skipped:
		return
	_show_cast("joe", Vector2(320, 200), "idle_down", "SECURTY", "sleeps standing at attention")
	await _say("JOE (sleep-talking)", "Halt... state your snack...", 3.2)
	if _skipped:
		return
	_clear_cast()
	_show_cast("dandan", Vector2(320, 200), "idle_down", "frying pan (hug)", "sleeps hugging a frying pan")
	await _say("DANDAN (mumbling)", "A pinch of nebula... no... two pinches...", 3.4)
	if _skipped:
		return
	_clear_cast()
	_show_cast("eithan", Vector2(320, 200), "idle_down", "Page 900 of 3,000", "asleep under the ship manual")
	await _say("NARRATOR", "Eithan sleeps with a ship manual open on his face.", 3.0)
	if _skipped:
		return
	_clear_cast()
	_show_cast("naomi", Vector2(320, 200), "idle_down", "warning light: 6 days", "already up. coffee. not today.")
	await _say("NAOMI", "Not today. I am not reading you today.", 3.2)
	if _skipped:
		return
	_clear_cast()
	_show_cast("alan", Vector2(320, 200), "idle_right", "mug: balanced", "snores in the captain's chair")
	await _say("NARRATOR", "Alan snores in the captain's chair, one hand on the steering yoke, a coffee mug balanced on his belly.", 4.0)
	if _skipped:
		return
	_clear_cast()
	_vignette_caption.text = "Empty bed. Blanket fort. Cookie crumbs leading out the door."
	_vignette_caption.visible = true
	await _say("NARRATOR", "And the youngest crew member, DavDav, is safely tucked in his...", 3.2)
	if _skipped:
		return
	await _say("NARRATOR", "...Hm.", 1.6)
	_vignette_caption.visible = false


func _cockpit_beats() -> void:
	_interior.color = Color(0.08, 0.07, 0.12, 1)
	_clear_cast()
	# Leftover message is already on the screens. No 20:00 clock.
	_grandma.visible = true
	_countdown.visible = false
	_vignette_caption.text = "A message was left. The crew sees it."
	_vignette_caption.visible = true
	await _say("GRANDMA (recorded)", "Hello, my darlings! I want to see a clean ship, a hot breakfast, and everyone dressed and SMILING. Especially you, Alan. Grandma always knows.", 6.4)
	if _skipped:
		return
	await _say("SHIP COMPUTER", "Incoming live call. Grandma will be with you in about twenty seconds. There is no countdown clock. Please use this time to \"get presentable.\"", 5.6)
	if _skipped:
		return
	_clear_cast()
	_show_cast("alan", Vector2(260, 210), "surprised", "", "jolts awake. mug sticks to the console.")
	await _say("ALAN", "I'M AWAKE! I'M DRIVING! Who's driving?!", 2.6)
	if _skipped:
		return
	await _say("ALAN", "Oh no. Oh no no no. Not your mother. Not the GRANDMA CALL.", 3.2)
	if _skipped:
		return
	await _say("NAOMI (intercom)", "Alan. My mother left a message. She is calling in about twenty seconds. The ship is a disaster, nobody's dressed, and the breakfast synthesizer is making that noise again.", 5.6)
	if _skipped:
		return
	await _say("NARRATOR", "A sad bloop... bloop... ploink from the galley.", 2.2)
	if _skipped:
		return
	await _say("NAOMI", "You're the Captain. Captain something.", 2.6)
	if _skipped:
		return
	_swap_cast("alan", "thumbs_up")
	await _say("ALAN", "Fear not, crew! Your Captain has everything under control!", 3.0)
	if _skipped:
		return
	_swap_cast("alan", "fall_right")
	await _say("NARRATOR", "He does not have everything under control.", 2.2)
	if _skipped:
		return
	_amber = true
	await _say("SHIP COMPUTER", "Incoming. Grandma is calling.", 1.8)
	if _skipped:
		return
	var dav := _show_cast("davdav", Vector2(40, 230), "walk_right", "DO NOT PRESS. SERIOUSLY. — MOM.", "sprints to the big red button", false)
	var run := create_tween()
	run.tween_property(dav, "position", Vector2(430, 205), 1.3)
	await run.finished
	if _skipped:
		return
	_swap_cast("davdav", "reach_up_right")
	await _say("DAVDAV", "Hi Grandma!", 1.6)
	if _skipped:
		return
	_flash.color = Color(1, 0.3, 0.25, 1)
	_flash.modulate.a = 0.7
	var boop := create_tween()
	boop.tween_property(_flash, "modulate:a", 0.0, 0.2)
	await _say("NARRATOR", "BOOP. He slaps the button.", 1.8)


func _title() -> void:
	_dialog.visible = false
	_grandma.visible = false
	_countdown.visible = false
	_interior.visible = false
	_clear_cast()
	_starfield.visible = false
	_title_card.visible = true
	%TitleMain.text = GameFlow.TITLE
	%TitleEpisode.text = GameFlow.EPISODE
	await _wait(3.2)


func _end_intro() -> void:
	if _finished:
		return
	_finished = true
	_skip_hint.visible = false
	await _fade_to(1.0, 0.35)
	GameFlow.begin_gameplay()


func _say(speaker: String, text: String, duration: float) -> void:
	if _skipped:
		return
	_dialog.visible = true
	_speaker.text = speaker
	_line.text = text
	await _wait(duration)


func _wait(seconds: float) -> void:
	var elapsed := 0.0
	while elapsed < seconds and not _skipped and is_inside_tree():
		await get_tree().process_frame
		elapsed += get_process_delta_time()


func _fade_to(alpha: float, time: float) -> void:
	var tween := create_tween()
	tween.tween_property(_fade, "modulate:a", alpha, time)
	await tween.finished


func _hide_decor() -> void:
	_sticker_a.visible = false
	_sticker_b.visible = false
	_dice.visible = false
	_scratch.visible = false


func _show_cast(who: String, at: Vector2, anim: String, badge: String, caption: String, clear: bool = true) -> Sprite2D:
	if clear:
		_clear_cast()
	var sprite := Sprite2D.new()
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.position = at
	sprite.scale = Vector2(2.2, 2.2)
	sprite.name = who
	_cast_layer.add_child(sprite)
	var frames := _frames_for(who, anim)
	if frames.is_empty():
		frames = _frames_for(who, "idle_down")
	if not frames.is_empty():
		sprite.texture = frames[0]
		if frames.size() > 1:
			_cast_anim[who] = {"node": sprite, "frames": frames, "index": 0, "accum": 0.0}
	_vignette_caption.text = caption if badge.is_empty() else "%s\n%s" % [caption, badge]
	_vignette_caption.visible = true
	return sprite


func _swap_cast(who: String, anim: String) -> void:
	var sprite := _cast_layer.get_node_or_null(who) as Sprite2D
	if sprite == null:
		return
	var frames := _frames_for(who, anim)
	if frames.is_empty():
		return
	sprite.texture = frames[0]
	if frames.size() > 1:
		_cast_anim[who] = {"node": sprite, "frames": frames, "index": 0, "accum": 0.0}
	else:
		_cast_anim.erase(who)


func _clear_cast() -> void:
	_cast_anim.clear()
	for child in _cast_layer.get_children():
		child.queue_free()
	_vignette_caption.visible = false


func _frames_for(who: String, anim: String) -> Array[Texture2D]:
	var dir := "%s/%s" % [CAST, who]
	if anim in ["surprised", "laugh", "thumbs_up"]:
		var one := Frames.load_png("%s/%s_00.png" % [dir, anim])
		return [one] if one else []
	if anim == "reach_up_right":
		var reach := Frames.load_png("%s/reach_up_right_00.png" % dir)
		return [reach] if reach else []
	return Frames.load_seq(dir, anim, 4)
