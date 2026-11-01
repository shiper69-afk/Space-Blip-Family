extends Control
## Skippable New Game intro. Follows docs/intro-script.md.
## LMB / Space / Enter advances dialogue. Esc skips the rest and starts gameplay.

const Frames := preload("res://game/intro/png_frames.gd")
const SHIP_DIR := "res://game/intro/frames/ship"
const CAST := "res://game/intro/frames"
const SHIP_FPS := 10.0
const CAST_FPS := 8.0
const TYPE_CPS := 48.0
const CAST_SCALE := Vector2(2.0, 2.0)
const CAST_FEET := Vector2(512, 400)

var _skipped := false
var _finished := false
var _ship_frames: Array[Texture2D] = []
var _ship_index := 0
var _ship_accum := 0.0
var _cast_anim: Dictionary = {}
var _amber := false
var _typing := false
var _line_ready := false
var _advance := false
var _logical_ship := Vector2(-200, 288)
var _auto_advance := 0.0
var _advance_lock := 0.0

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
@onready var _continue: Label = %ContinueHint
@onready var _fade: ColorRect = %Fade


func _ready() -> void:
	GameFlow.in_intro = true
	GameFlow.in_game = false
	GameFlow.hide_adventure_gui()
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_auto_advance = float(GameFlow.cli_value("auto-advance"))
	_ship.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_ship_frames = Frames.load_seq(SHIP_DIR, "idle", 8)
	if _ship_frames.is_empty():
		_ship_frames = Frames.load_seq(SHIP_DIR, "charge", 8)
	_ship.texture = _ship_frames[0] if not _ship_frames.is_empty() else null
	_logical_ship = Vector2(-200, 288)
	_ship.position = _logical_ship
	_ship.scale = Vector2(1.0, 1.0)
	_hide_decor()
	_title_card.visible = false
	_grandma.visible = false
	_countdown.visible = false
	_interior.visible = false
	_vignette_caption.visible = false
	_dialog.visible = false
	_continue.visible = false
	_flash.modulate.a = 0.0
	_fade.modulate.a = 1.0
	var beat := GameFlow.cli_value("intro-beat")
	if beat == "flyby":
		await _hold_flyby()
		await GameFlow.maybe_capture_and_quit()
		return
	if beat == "title":
		await _hold_title()
		await GameFlow.maybe_capture_and_quit()
		return
	await _play()


func _process(delta: float) -> void:
	if _ship_frames.size() > 1 and _ship.visible:
		_ship_accum += delta
		var step := 1.0 / SHIP_FPS
		if _ship_accum >= step:
			_ship_accum -= step
			_ship_index = (_ship_index + 1) % _ship_frames.size()
			_ship.texture = _ship_frames[_ship_index]
	_ship.position = _logical_ship.round()
	for name: String in _cast_anim.keys():
		var data: Dictionary = _cast_anim[name]
		data.accum += delta
		if data.accum >= 1.0 / CAST_FPS:
			data.accum -= 1.0 / CAST_FPS
			data.index = (data.index + 1) % data.frames.size()
			(data.node as Sprite2D).texture = data.frames[data.index]
	if _amber and _interior.visible:
		var pulse: float = 0.62 + 0.28 * absf(sin(Time.get_ticks_msec() * 0.006))
		_interior.color = Color(0.16 * pulse, 0.07, 0.04, 1)
	if _continue.visible:
		_continue.modulate.a = 0.45 + 0.55 * absf(sin(Time.get_ticks_msec() * 0.005))
	if _advance_lock > 0.0:
		_advance_lock = maxf(0.0, _advance_lock - delta)


func _input(event: InputEvent) -> void:
	if _finished:
		return
	if event.is_action_pressed("ui_cancel") or event.is_action_pressed("popochiu-skip"):
		get_viewport().set_input_as_handled()
		_skip()
		return
	if _is_advance(event):
		get_viewport().set_input_as_handled()
		_on_advance()


func _is_advance(event: InputEvent) -> bool:
	if event is InputEventMouseButton:
		var mouse := event as InputEventMouseButton
		return mouse.pressed and mouse.button_index == MOUSE_BUTTON_LEFT
	if event.is_action_pressed("ui_accept"):
		return true
	if event is InputEventKey and event.pressed and not event.echo:
		return event.keycode == KEY_SPACE or event.keycode == KEY_ENTER
	return false


func _on_advance() -> void:
	# Space is also ui_accept — one keydown can arrive twice. Latch so the
	# first press only completes a typing line; the next press advances.
	if _advance_lock > 0.0:
		return
	_advance_lock = 0.16
	if _typing:
		_line.visible_characters = -1
		_typing = false
		return
	if _line_ready:
		_advance = true


func _skip() -> void:
	if _skipped or _finished:
		return
	_skipped = true
	_advance = true
	_end_intro()


func _play() -> void:
	await _fade_to(0.0, 0.7)
	if _skipped:
		return
	await _opening()
	if _skipped:
		return
	await _crossfade(_tour)
	if _skipped:
		return
	await _crossfade(_cockpit_beats)
	if _skipped:
		return
	await _crossfade(_title)
	if _skipped:
		return
	_end_intro()


func _opening() -> void:
	_starfield.system = _starfield.SYSTEM_DEEP
	_starfield.warp = 0.0
	_starfield.speed = 18.0
	_ship.visible = false
	await _say("NARRATOR", "Space. The final frontier. A vast, silent ocean of stars, where brave explorers boldly go where no one has gone before.")
	if _skipped:
		return
	await _say("DAVDAV (muffled)", "Are we there yeeeet?")
	if _skipped:
		return
	await _say("NARRATOR", "...Mostly silent.")
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
	await _say("NARRATOR", "These are the voyages of The Millennium Mini Van. Her ongoing mission: to explore strange new worlds, to seek out clean bathrooms, and to boldly go wherever Dad swears is \"a shortcut.\"")
	if _skipped:
		return
	_dialog.visible = false
	_continue.visible = false
	_starfield.system = _starfield.SYSTEM_NEBULA
	await _wait(0.6)
	if _skipped:
		return
	_starfield.system = _starfield.SYSTEM_CLUSTER
	await _fly_ship_across()


func _record_scratch() -> void:
	_scratch.visible = true
	_scratch.text = "SKRRRT—"
	_flash.modulate = Color(1, 1, 1, 0.8)
	var tween := create_tween()
	tween.tween_property(_flash, "modulate:a", 0.0, 0.32)
	await _wait(0.5)
	_scratch.visible = false


func _show_ship_coughing() -> void:
	# Idle/charge stay a full van. Jump frames shrink to a warp speck — that popped.
	var idle := Frames.load_seq(SHIP_DIR, "idle", 8)
	if idle.is_empty():
		idle = Frames.load_seq(SHIP_DIR, "charge", 8)
	if not idle.is_empty():
		_ship_frames = idle
		_ship_index = 0
		_ship.texture = idle[0]
	_ship.visible = true
	# 0.8125 keeps the 480×256 sheet on whole pixels (390×208) and fully on-screen.
	_logical_ship = Vector2(430, 268)
	_ship.scale = Vector2(0.8125, 0.8125)
	_ship.rotation_degrees = 0.0
	_sticker_a.position = Vector2(36, 120)
	_sticker_b.position = Vector2(36, 148)
	_dice.position = Vector2(760, 88)
	var wobble := create_tween()
	wobble.set_trans(Tween.TRANS_SINE)
	wobble.set_loops(3)
	wobble.tween_property(_ship, "rotation_degrees", 3.0, 0.14)
	wobble.tween_property(_ship, "rotation_degrees", -2.5, 0.14)
	wobble.tween_property(_ship, "rotation_degrees", 0.0, 0.12)


func _fly_ship_across() -> void:
	_hide_decor()
	var idle := Frames.load_seq(SHIP_DIR, "idle", 8)
	if not idle.is_empty():
		_ship_frames = idle
		_ship_index = 0
		_ship.texture = idle[0]
	_ship.rotation_degrees = 0.0
	# Settle from the cough pose — no teleport pop — then ease across.
	var settle := create_tween()
	settle.set_parallel(true)
	settle.set_trans(Tween.TRANS_SINE)
	settle.set_ease(Tween.EASE_IN_OUT)
	settle.tween_property(self, "_logical_ship", Vector2(300, 288), 0.5)
	settle.tween_property(_ship, "scale", Vector2(1.0, 1.0), 0.5)
	await settle.finished
	if _skipped:
		return
	var tween := create_tween()
	tween.set_parallel(true)
	tween.set_trans(Tween.TRANS_CUBIC)
	tween.set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(self, "_logical_ship", Vector2(1120, 210), 4.4)
	tween.tween_property(_ship, "scale", Vector2(0.75, 0.75), 4.4)
	tween.tween_property(_starfield, "warp", 1.0, 1.4)
	tween.tween_property(_starfield, "speed", 48.0, 1.4)
	await tween.finished
	if _skipped:
		return
	var ease_out := create_tween()
	ease_out.set_parallel(true)
	ease_out.set_trans(Tween.TRANS_SINE)
	ease_out.set_ease(Tween.EASE_OUT)
	ease_out.tween_property(_starfield, "warp", 0.0, 0.55)
	ease_out.tween_property(_starfield, "speed", 20.0, 0.55)
	await ease_out.finished


func _tour() -> void:
	_hide_decor()
	_ship.visible = false
	_starfield.visible = false
	_interior.visible = true
	_interior.color = Color(0.07, 0.06, 0.1, 1)
	_clear_cast()
	await _fade_to(0.0, 0.4)
	if _skipped:
		return
	await _say("NARRATOR", "Stardate: Tuesday. Day 47 of a trip that was supposed to take three days. The crew rests.")
	if _skipped:
		return
	_show_cast("joe", CAST_FEET, "idle_down", "SECURTY", "sleeps standing at attention", true, false)
	await _say("JOE (sleep-talking)", "Halt... state your snack...")
	if _skipped:
		return
	_show_cast("dandan", CAST_FEET, "idle_down", "frying pan (hug)", "sleeps hugging a frying pan", true, false)
	await _say("DANDAN (mumbling)", "A pinch of nebula... no... two pinches...")
	if _skipped:
		return
	_show_cast("eithan", CAST_FEET, "idle_down", "Page 900 of 3,000", "asleep under the ship manual", true, false)
	await _say("NARRATOR", "Eithan sleeps with a ship manual open on his face.")
	if _skipped:
		return
	_show_cast("naomi", CAST_FEET, "idle_down", "warning light: 6 days", "already up. coffee. not today.")
	await _say("NAOMI", "Not today. I am not reading you today.")
	if _skipped:
		return
	_show_cast("alan", CAST_FEET, "idle_down", "mug: balanced", "snores in the captain's chair", true, false)
	await _say("NARRATOR", "Alan snores in the captain's chair, one hand on the steering yoke, a coffee mug balanced on his belly.")
	if _skipped:
		return
	_clear_cast()
	_vignette_caption.text = "Empty bed. Blanket fort. Cookie crumbs leading out the door."
	_vignette_caption.visible = true
	await _say("NARRATOR", "And the youngest crew member, DavDav, is safely tucked in his...")
	if _skipped:
		return
	await _say("NARRATOR", "...Hm.")
	_vignette_caption.visible = false


func _cockpit_beats() -> void:
	_interior.visible = true
	_interior.color = Color(0.08, 0.07, 0.12, 1)
	_starfield.visible = false
	_ship.visible = false
	_clear_cast()
	_grandma.visible = true
	_countdown.visible = false
	_vignette_caption.text = "A message was left. The crew sees it."
	_vignette_caption.visible = true
	await _fade_to(0.0, 0.4)
	if _skipped:
		return
	await _say("GRANDMA (recorded)", "Hello, my darlings! I want to see a clean ship, a hot breakfast, and everyone dressed and SMILING. Especially you, Alan. Grandma always knows.")
	if _skipped:
		return
	await _say("SHIP COMPUTER", "Incoming live call. Grandma will be with you in about twenty seconds. There is no countdown clock. Please use this time to \"get presentable.\"")
	if _skipped:
		return
	_vignette_caption.visible = false
	_show_cast("alan", Vector2(380, 400), "surprised", "", "jolts awake. mug sticks to the console.")
	await _say("ALAN", "I'M AWAKE! I'M DRIVING! Who's driving?!")
	if _skipped:
		return
	await _say("ALAN", "Oh no. Oh no no no. Not your mother. Not the GRANDMA CALL.")
	if _skipped:
		return
	await _say("NAOMI (intercom)", "Alan. My mother left a message. She is calling in about twenty seconds. The ship is a disaster, nobody's dressed, and the breakfast synthesizer is making that noise again.")
	if _skipped:
		return
	await _say("NARRATOR", "A sad bloop... bloop... ploink from the galley.")
	if _skipped:
		return
	await _say("NAOMI", "You're the Captain. Captain something.")
	if _skipped:
		return
	_swap_cast("alan", "thumbs_up")
	await _say("ALAN", "Fear not, crew! Your Captain has everything under control!")
	if _skipped:
		return
	_swap_cast("alan", "fall_right")
	await _say("NARRATOR", "He does not have everything under control.")
	if _skipped:
		return
	_amber = true
	await _say("SHIP COMPUTER", "Incoming. Grandma is calling.")
	if _skipped:
		return
	var dav := _show_cast("davdav", Vector2(140, 400), "walk_right", "DO NOT PRESS. SERIOUSLY. — MOM.", "sprints to the big red button", false)
	var run := create_tween()
	run.set_trans(Tween.TRANS_SINE)
	run.set_ease(Tween.EASE_IN_OUT)
	run.tween_property(dav, "position", Vector2(700, 400), 1.5)
	await run.finished
	if _skipped:
		return
	dav.position = Vector2(700, 400)
	_swap_cast("davdav", "reach_up_right")
	await _say("DAVDAV", "Hi Grandma!")
	if _skipped:
		return
	_flash.color = Color(1, 0.3, 0.25, 1)
	_flash.modulate.a = 0.65
	var boop := create_tween()
	boop.tween_property(_flash, "modulate:a", 0.0, 0.22)
	await _say("NARRATOR", "BOOP. He slaps the button.")


func _title() -> void:
	_show_title_card()
	_dialog.visible = false
	_continue.visible = false
	await _fade_to(0.0, 0.45)
	if _skipped:
		return
	await _wait(2.2)
	await _wait_for_advance()


func _hold_flyby() -> void:
	_starfield.system = _starfield.SYSTEM_CLUSTER
	_starfield.warp = 0.55
	_show_ship_coughing()
	var idle := Frames.load_seq(SHIP_DIR, "idle", 8)
	if not idle.is_empty():
		_ship_frames = idle
		_ship.texture = idle[0]
	_ship.rotation_degrees = 0.0
	_logical_ship = Vector2(430, 268)
	_ship.scale = Vector2(0.8125, 0.8125)
	_sticker_a.visible = true
	_sticker_b.visible = true
	_dice.visible = true
	_dialog.visible = true
	_speaker.text = "NARRATOR"
	_line.visible_characters = -1
	_line.text = "These are the voyages of The Millennium Mini Van."
	_continue.visible = true
	await _fade_to(0.0, 0.2)


func _hold_title() -> void:
	_show_title_card()
	await _fade_to(0.0, 0.2)


func _show_title_card() -> void:
	_dialog.visible = false
	_grandma.visible = false
	_countdown.visible = false
	_interior.visible = false
	_clear_cast()
	_starfield.visible = false
	_ship.visible = false
	_hide_decor()
	_title_card.visible = true
	%TitleMain.text = GameFlow.TITLE
	%TitleEpisode.text = GameFlow.EPISODE


func _end_intro() -> void:
	if _finished:
		return
	_finished = true
	_skip_hint.visible = false
	_continue.visible = false
	await _fade_to(1.0, 0.4)
	GameFlow.begin_gameplay()


func _say(speaker: String, text: String) -> void:
	if _skipped:
		return
	_dialog.visible = true
	_continue.visible = false
	_speaker.text = speaker
	_line.text = text
	_line.visible_characters = 0
	_typing = true
	_line_ready = false
	_advance = false
	var shown := 0
	var accum := 0.0
	var total := text.length()
	while shown < total and not _skipped and is_inside_tree() and _typing:
		await get_tree().process_frame
		accum += get_process_delta_time()
		var take := int(accum * TYPE_CPS)
		if take > 0:
			accum -= float(take) / TYPE_CPS
			shown = mini(total, shown + take)
			_line.visible_characters = shown
	_line.visible_characters = -1
	_typing = false
	_line_ready = true
	_continue.visible = true
	await _wait_for_advance()
	_line_ready = false
	_continue.visible = false


func _wait_for_advance() -> void:
	_advance = false
	_line_ready = true
	var waited := 0.0
	while not _advance and not _skipped and is_inside_tree():
		await get_tree().process_frame
		waited += get_process_delta_time()
		if _auto_advance > 0.0 and waited >= _auto_advance:
			_advance = true
	_advance = false
	_line_ready = false


func _wait(seconds: float) -> void:
	var elapsed := 0.0
	while elapsed < seconds and not _skipped and is_inside_tree():
		await get_tree().process_frame
		elapsed += get_process_delta_time()


func _fade_to(alpha: float, time: float) -> void:
	var tween := create_tween()
	tween.set_trans(Tween.TRANS_SINE)
	tween.set_ease(Tween.EASE_IN_OUT)
	tween.tween_property(_fade, "modulate:a", alpha, time)
	await tween.finished


func _crossfade(next: Callable) -> void:
	await _fade_to(1.0, 0.35)
	if _skipped:
		return
	_dialog.visible = false
	_continue.visible = false
	await next.call()


func _hide_decor() -> void:
	_sticker_a.visible = false
	_sticker_b.visible = false
	_dice.visible = false
	_scratch.visible = false


func _show_cast(who: String, at: Vector2, anim: String, badge: String, caption: String, clear: bool = true, animate: bool = true) -> Sprite2D:
	if clear:
		_clear_cast()
	var sprite := Sprite2D.new()
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.centered = false
	sprite.offset = Vector2(-56, -124)
	sprite.position = at.round()
	sprite.scale = CAST_SCALE
	sprite.name = who
	_cast_layer.add_child(sprite)
	var frames := _frames_for(who, anim)
	if frames.is_empty():
		frames = _frames_for(who, "idle_down")
	if not frames.is_empty():
		sprite.texture = frames[0]
		if animate and frames.size() > 1:
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
	var single: Array[Texture2D] = []
	if anim in ["surprised", "laugh", "thumbs_up"]:
		var one := Frames.load_png("%s/%s_00.png" % [dir, anim])
		if one:
			single.append(one)
		return single
	if anim == "reach_up_right":
		var reach := Frames.load_png("%s/reach_up_right_00.png" % dir)
		if reach:
			single.append(reach)
		return single
	if anim == "fall_right":
		return Frames.load_seq(dir, anim, 6)
	if anim.begins_with("walk") or anim.begins_with("idle") or anim.begins_with("talk"):
		return Frames.load_seq(dir, anim, 8)
	return Frames.load_seq(dir, anim, 4)
