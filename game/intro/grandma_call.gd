extends Control
## Live Grandma Chaya call on the painted bridge. Follows docs/grandma-call-script.md.
## LMB / Space / Enter advances. Esc skips to player control.

const Frames := preload("res://game/intro/png_frames.gd")
const CAST := "res://game/intro/frames"
const SLEEP_DIR := "res://game/intro/frames/alan_sleep"
const DOOR_DIR := "res://game/rooms/cockpit/props/door"
const BG_A := "res://game/rooms/cockpit/props/background/bridge_v5_00.png"
const BG_B := "res://game/rooms/cockpit/props/background/bridge_v5_01.png"
const TYPE_CPS := 48.0
const SLEEP_FPS := 6.0
const WAKE_FPS := 10.0
const DOOR_FPS := 12.0
const CAST_FPS := 8.0
const ALAN_SLEEP := Vector2(462, 70)
const DOOR_POS := Vector2(180, 48)
const WALK_IN := Vector2(209, 225)
const INSIDE := Vector2(229, 259)
const BUTTON := Vector2(860, 368)
const DAV_START := Vector2(400, 305)
const CHAYA_DIR := "res://game/characters/grandma/frames"
const CHAYA_POS := Vector2(599, 40)
const CHAYA_FPS := 8.0

var _skipped := false
var _finished := false
var _typing := false
var _line_ready := false
var _advance := false
var _auto_advance := 0.0
var _advance_lock := 0.0
var _cast_anim: Dictionary = {}
var _sleep_frames: Array[Texture2D] = []
var _wake_frames: Array[Texture2D] = []
var _zzz_frames: Array[Texture2D] = []
var _door_open: Array[Texture2D] = []
var _door_close: Array[Texture2D] = []
var _sleep_i := 0
var _zzz_i := 0
var _sleep_accum := 0.0
var _zzz_accum := 0.0
var _sleeping := true
var _bg_frames: Array[Texture2D] = []
var _bg_i := 0
var _bg_accum := 0.0
var _amber := false
var _incoming := false
var _chaya_talk: Array[Texture2D] = []
var _chaya_idle: Array[Texture2D] = []
var _chaya_judge: Array[Texture2D] = []
var _chaya_frames: Array[Texture2D] = []
var _chaya_i := 0
var _chaya_accum := 0.0
var _mug_sleep: Array = [
	Vector2(534, 133), Vector2(534, 132), Vector2(534, 132), Vector2(534, 132),
	Vector2(534, 133), Vector2(534, 134), Vector2(534, 134), Vector2(534, 134)
]
var _mug_wake: Array = [
	{"p": Vector2(534, 133), "r": 0.0, "s": "mug_wake_00.png"},
	{"p": Vector2(546, 107), "r": -28.0, "s": "mug_wake_01.png"},
	{"p": Vector2(559, 94), "r": -56.0, "s": "mug_wake_02.png"},
	{"p": Vector2(572, 93), "r": -84.0, "s": "mug_wake_03.png"},
	{"p": Vector2(585, 104), "r": -112.0, "s": "mug_wake_04.png"},
	{"p": Vector2(598, 128), "r": -25.0, "s": "mug_wake_05.png"},
]

@onready var _bg: Sprite2D = %Bridge
@onready var _door_hole: Sprite2D = %DoorCorridor
@onready var _door: Sprite2D = %Door
@onready var _alan_sleep: Sprite2D = %AlanSleep
@onready var _mug: Sprite2D = %Mug
@onready var _zzz: Sprite2D = %Zzz
@onready var _cast: Node2D = %CastLayer
@onready var _chaya_face: Sprite2D = %ChayaFace
@onready var _chaya: Control = %ChayaScreen
@onready var _speaker: Label = %Speaker
@onready var _line: Label = %Line
@onready var _dialog: PanelContainer = %DialogueBox
@onready var _continue: Label = %ContinueHint
@onready var _skip_hint: Label = %SkipHint
@onready var _title_card: Control = %TitleCard
@onready var _giant: Label = %GiantCountdown
@onready var _ended: Label = %CallEnded
@onready var _flash: ColorRect = %Flash
@onready var _fade: ColorRect = %Fade
@onready var _placeholder: Label = %PlaceholderTag
@onready var _amber_flash: ColorRect = %AmberFlash
@onready var _incoming_alert: Control = %IncomingAlert


func _ready() -> void:
	GameFlow.in_intro = true
	GameFlow.in_game = false
	GameFlow.hide_adventure_gui()
	Input.set_mouse_mode(Input.MOUSE_MODE_VISIBLE)
	texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	_auto_advance = float(GameFlow.cli_value("auto-advance"))
	_bg_frames = [Frames.load_png(BG_A), Frames.load_png(BG_B)]
	_bg.texture = _bg_frames[0]
	_bg.centered = false
	_bg.position = Vector2.ZERO
	_sleep_frames = Frames.load_seq(SLEEP_DIR, "alan_frames_sleep_chair", 8)
	_wake_frames = Frames.load_seq(SLEEP_DIR, "alan_frames_wake_jolt", 6)
	_zzz_frames = Frames.load_seq(SLEEP_DIR, "zzz", 8)
	_door_open = Frames.load_seq(DOOR_DIR, "door_open", 8)
	_door_close = Frames.load_seq(DOOR_DIR, "door_close", 8)
	_chaya_talk = Frames.load_seq(CHAYA_DIR, "talk_down", 8)
	_chaya_idle = Frames.load_seq(CHAYA_DIR, "idle", 2)
	_chaya_judge = Frames.load_seq(CHAYA_DIR, "judge", 4)
	_chaya_face.centered = false
	_chaya_face.position = CHAYA_POS
	_chaya_face.visible = false
	_door_hole.texture = Frames.load_png("%s/door_corridor_bg.png" % DOOR_DIR)
	_door_hole.centered = false
	_door_hole.position = DOOR_POS
	_door.centered = false
	_door.position = DOOR_POS
	_door.texture = _door_open[0] if not _door_open.is_empty() else null
	_alan_sleep.centered = false
	_alan_sleep.position = ALAN_SLEEP
	_alan_sleep.texture = _sleep_frames[0] if not _sleep_frames.is_empty() else null
	_mug.centered = false
	_mug.texture = Frames.load_png("%s/mug_prop.png" % SLEEP_DIR)
	_mug.position = _mug_sleep[0]
	_zzz.centered = false
	_zzz.position = Vector2(540, 66)
	_zzz.texture = _zzz_frames[0] if not _zzz_frames.is_empty() else null
	_chaya.visible = false
	_title_card.visible = false
	_giant.visible = false
	_ended.visible = false
	_dialog.visible = false
	_continue.visible = false
	_placeholder.visible = false
	_incoming_alert.visible = false
	_flash.modulate.a = 0.0
	_amber_flash.modulate.a = 0.0
	_fade.modulate.a = 1.0
	%TitleMain.text = GameFlow.TITLE
	%TitleEpisode.text = GameFlow.EPISODE
	_spawn("davdav", DAV_START, "idle_down")
	await _fade_to(0.0, 0.45)
	await _play()


func _process(delta: float) -> void:
	if _advance_lock > 0.0:
		_advance_lock = maxf(0.0, _advance_lock - delta)
	if _continue.visible:
		_continue.modulate.a = 0.45 + 0.55 * absf(sin(Time.get_ticks_msec() * 0.005))
	if _amber:
		_amber_flash.modulate.a = 0.08 + 0.16 * absf(sin(Time.get_ticks_msec() * 0.008))
	if _incoming:
		_incoming_alert.modulate.a = 0.55 + 0.45 * absf(sin(Time.get_ticks_msec() * 0.007))
	if _bg_frames.size() >= 2:
		_bg_accum += delta
		if _bg_accum >= 0.48:
			_bg_accum = 0.0
			_bg_i = 1 - _bg_i
			_bg.texture = _bg_frames[_bg_i]
	if _chaya_face.visible and _chaya_frames.size() > 1:
		_chaya_accum += delta
		if _chaya_accum >= 1.0 / CHAYA_FPS:
			_chaya_accum -= 1.0 / CHAYA_FPS
			_chaya_i = (_chaya_i + 1) % _chaya_frames.size()
			_chaya_face.texture = _chaya_frames[_chaya_i]
	if _sleeping and _sleep_frames.size() > 1:
		_sleep_accum += delta
		if _sleep_accum >= 1.0 / SLEEP_FPS:
			_sleep_accum -= 1.0 / SLEEP_FPS
			_sleep_i = (_sleep_i + 1) % _sleep_frames.size()
			_alan_sleep.texture = _sleep_frames[_sleep_i]
			_mug.position = _mug_sleep[_sleep_i % _mug_sleep.size()]
		_zzz_accum += delta
		if _zzz_accum >= 1.0 / SLEEP_FPS and _zzz_frames.size() > 1:
			_zzz_accum -= 1.0 / SLEEP_FPS
			_zzz_i = (_zzz_i + 1) % _zzz_frames.size()
			_zzz.texture = _zzz_frames[_zzz_i]
	for name: String in _cast_anim.keys():
		var data: Dictionary = _cast_anim[name]
		data.accum += delta
		if data.accum >= 1.0 / CAST_FPS:
			data.accum -= 1.0 / CAST_FPS
			data.index = (data.index + 1) % data.frames.size()
			(data.node as Sprite2D).texture = data.frames[data.index]
			_depth(data.node)


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
	_finish()


func _play() -> void:
	var wait_s := float(GameFlow.cli_value("call-wait"))
	if wait_s <= 0.0:
		wait_s = 10.0
	_show_incoming()
	await _wait(wait_s)
	if _skipped:
		return
	await _davdav_hits_button()
	if _skipped:
		return
	_hide_incoming()
	_show_chaya()
	await _say("CHAYA", "Hello? HELLO? Is this thing on? Naomi, your father set this up, and I don't trust it.")
	if _skipped:
		return
	await _wait(0.45)
	if _skipped:
		return
	_wave_davdav()
	await _say("DAVDAV", "Hi Grandma!")
	if _skipped:
		return
	await _say("CHAYA", "DavDav! My baby! Is that jam on your face?")
	if _skipped:
		return
	await _say("DAVDAV", "It's space jam.")
	if _skipped:
		return
	await _say("CHAYA", "Of course it is. Where is everybody? I haven't seen you children in... forever.")
	if _skipped:
		return
	await _say("CHAYA", "Is that the Captain? ASLEEP at the wheel?")
	if _skipped:
		return
	await _say("DAVDAV", "He's resting his eyes.")
	if _skipped:
		return
	await _say("CHAYA", "He's been resting his eyes since the wedding. ALAN!")
	if _skipped:
		return
	await _wake_alan()
	if _skipped:
		return
	await _say("ALAN", "I'M AWAKE! I'M DRIVING! ...Chaya. What a wonderful surprise.")
	if _skipped:
		return
	await _say("CHAYA", "Is it, Alan?")
	if _skipped:
		return
	await _say("ALAN", "Every call is a gift.")
	if _skipped:
		return
	await _enter("naomi", Vector2(360, 340), "coffee  [placeholder]")
	if _skipped:
		return
	await _say("NAOMI", "Hi, Mom.")
	if _skipped:
		return
	await _say("CHAYA", "Naomi, sweetheart. You look tired.")
	if _skipped:
		return
	await _say("NAOMI", "It's six in the morning.")
	if _skipped:
		return
	await _say("CHAYA", "I was up at four. I've cleaned the whole house twice. Where are my other grandchildren? Or have they forgotten they have a grandmother?")
	if _skipped:
		return
	await _say("ALAN", "Kids! Bridge! Grandma's on the line!")
	if _skipped:
		return
	await _enter("joe", Vector2(300, 380), "", 0.55)
	if _skipped:
		return
	await _say("JOE", "Who authorized an outside call? This is a breach of protocol!")
	if _skipped:
		return
	await _say("CHAYA", "Joseph. \"Protocol.\" You used to cry when the toaster popped.")
	if _skipped:
		return
	await _say("JOE", "...That toaster was a threat.")
	if _skipped:
		return
	await _enter("dandan", Vector2(430, 400), "frying pan  [placeholder]")
	if _skipped:
		return
	await _say("DANDAN", "Hi, Grandma. Did you eat? I'm working on a nebula omelet.")
	if _skipped:
		return
	await _say("CHAYA", "DanDan, you're too thin. Are they feeding you?")
	if _skipped:
		return
	await _say("DANDAN", "I'm the one who feeds THEM.")
	if _skipped:
		return
	await _say("CHAYA", "The thirteen-year-old does the cooking.")
	if _skipped:
		return
	await _say("NAOMI", "He likes cooking.")
	if _skipped:
		return
	await _say("CHAYA", "I didn't say anything.")
	if _skipped:
		return
	await _say("NAOMI", "You said it with your eyebrow.")
	if _skipped:
		return
	await _enter("eithan", Vector2(250, 310), "manual  [placeholder]")
	if _skipped:
		return
	await _say("EITHAN", "Status update. Call quality is sixty-two percent. Grandma's camera is pointed at the ceiling.")
	if _skipped:
		return
	await _say("CHAYA", "It is not. Eithan, put that book down and look at your grandmother.")
	if _skipped:
		return
	await _say("EITHAN", "Hi, Grandma.")
	if _skipped:
		return
	await _say("CHAYA", "Look at all of you. Pale. Skinny. Half asleep at six in the morning.")
	if _skipped:
		return
	await _say("ALAN", "That's... a normal time to be asleep.")
	if _skipped:
		return
	await _say("CHAYA", "Alan. Is that a SOCK on the navigation screen?")
	if _skipped:
		return
	await _say("ALAN", "It cuts the glare.")
	if _skipped:
		return
	await _say("CHAYA", "And the sandwich on the ceiling?")
	if _skipped:
		return
	await _say("DAVDAV", "That's from Thursday!")
	if _skipped:
		return
	await _say("JOE", "It's evidence. Nobody touch it.")
	if _skipped:
		return
	await _say("CHAYA", "Your grandfather flew a cargo hauler for forty years. You could eat off his dashboard. You could do surgery on his floor.")
	if _skipped:
		return
	await _say("DANDAN", "You can eat off our ceiling.")
	if _skipped:
		return
	await _say("CHAYA", "Now you listen to me, all of you. Grandma is going to hang up. Grandma is going to make herself a nice cup of tea. And in twenty minutes, Grandma is calling back. When I do, I want to see a clean ship, a hot breakfast, and every one of you awake, combed, and SMILING.")
	if _skipped:
		return
	await _say("ALAN", "Twenty minutes. No problem. Easy. Piece of cake.")
	if _skipped:
		return
	await _say("DANDAN", "We don't have cake.")
	if _skipped:
		return
	await _say("CHAYA", "And Alan.")
	if _skipped:
		return
	await _say("ALAN", "Yes, Chaya?")
	if _skipped:
		return
	await _say("CHAYA", "Comb your hair. What's left of it.")
	if _skipped:
		return
	await _say("CHAYA", "How do I hang up? Where's the... Frank! How do I hang up this thing? FRAAANK?")
	if _skipped:
		return
	_end_call_screen()
	await _say("SHIP COMPUTER", "Grandma will call back in twenty minutes! Have a wonderful day!")
	if _skipped:
		return
	_amber = true
	_look_at_davdav()
	await _say("DAVDAV", "...Red means yes.")
	if _skipped:
		return
	await _say("NAOMI", "Okay. Joe, lock down the laundry. DanDan, breakfast. Eithan, figure out why the synthesizer sounds like it's dying. Alan—")
	if _skipped:
		return
	_swap("alan", "thumbs_up")
	await _say("ALAN", "Fear not, crew! Your Captain has everything under control!")
	if _skipped:
		return
	await _trip()
	if _skipped:
		return
	await _say("NARRATOR", "He does not have everything under control.")
	if _skipped:
		return
	await _title_and_handoff()


func _davdav_hits_button() -> void:
	var dav := _cast.get_node_or_null("davdav") as Sprite2D
	if dav == null:
		dav = _spawn("davdav", DAV_START, "walk_right")
	_swap("davdav", "walk_right")
	var run := create_tween()
	run.set_trans(Tween.TRANS_SINE)
	run.set_ease(Tween.EASE_IN_OUT)
	run.tween_property(dav, "position", BUTTON, 1.35)
	await run.finished
	if _skipped:
		return
	dav.position = BUTTON
	_swap("davdav", "reach_up_right")
	_flash.color = Color(1, 0.28, 0.22, 1)
	_flash.modulate.a = 0.7
	var hit := create_tween()
	hit.tween_property(_flash, "modulate:a", 0.0, 0.25)
	await _wait(0.28)
	_swap("davdav", "idle_down")


func _show_incoming() -> void:
	_incoming = true
	_incoming_alert.visible = true
	_incoming_alert.modulate.a = 1.0


func _hide_incoming() -> void:
	_incoming = false
	_incoming_alert.visible = false
	_incoming_alert.modulate.a = 1.0


func _show_chaya() -> void:
	if not _chaya_talk.is_empty() or not _chaya_idle.is_empty():
		_chaya.visible = false
		_chaya_face.visible = true
		_play_chaya("talk")
	else:
		_chaya.visible = true
		%ChayaCaption.text = "CHAYA\n(too close to camera) [placeholder]"


func _play_chaya(kind: String) -> void:
	match kind:
		"judge":
			_chaya_frames = _chaya_judge if not _chaya_judge.is_empty() else _chaya_talk
		"idle":
			_chaya_frames = _chaya_idle if not _chaya_idle.is_empty() else _chaya_talk
		_:
			_chaya_frames = _chaya_talk if not _chaya_talk.is_empty() else _chaya_idle
	_chaya_i = 0
	_chaya_accum = 0.0
	if not _chaya_frames.is_empty():
		_chaya_face.texture = _chaya_frames[0]
		_chaya_face.visible = true


func _end_call_screen() -> void:
	_ended.visible = true
	_ended.text = "CALL ENDED"
	_giant.visible = true
	_giant.text = "20:00"
	_chaya.visible = false
	_chaya_face.visible = false
	GameFlow.story_countdown = "20:00"


func _wave_davdav() -> void:
	_swap("davdav", "idle_down")


func _wake_alan() -> void:
	_sleeping = false
	_zzz.visible = false
	_alan_sleep.visible = true
	for i in _wake_frames.size():
		_alan_sleep.texture = _wake_frames[i]
		var mug_info: Dictionary = _mug_wake[i]
		_mug.texture = Frames.load_png("%s/%s" % [SLEEP_DIR, mug_info.s])
		_mug.position = mug_info.p
		_mug.rotation_degrees = mug_info.r
		await _wait(1.0 / WAKE_FPS)
		if _skipped:
			return
	_mug.texture = Frames.load_png("%s/mug_stuck_console.png" % SLEEP_DIR)
	_mug.position = Vector2(598, 128)
	_mug.rotation_degrees = 0.0
	_alan_sleep.visible = false
	_spawn("alan", Vector2(512, 268), "surprised")


func _enter(who: String, dest: Vector2, extra: String, speed := 0.85) -> void:
	await _open_door()
	if _skipped:
		return
	var sprite := _spawn(who, WALK_IN, "walk_right")
	if extra != "":
		_badge(sprite, extra)
	var walk := create_tween()
	walk.set_trans(Tween.TRANS_SINE)
	walk.set_ease(Tween.EASE_IN_OUT)
	walk.tween_property(sprite, "position", dest, speed)
	await walk.finished
	if _skipped:
		return
	sprite.position = dest
	_swap(who, "idle_down")
	await _close_door()


func _open_door() -> void:
	for tex in _door_open:
		_door.texture = tex
		await _wait(1.0 / DOOR_FPS)
		if _skipped:
			return
	var hold := Frames.load_png("%s/door_open_hold.png" % DOOR_DIR)
	if hold:
		_door.texture = hold


func _close_door() -> void:
	for tex in _door_close:
		_door.texture = tex
		await _wait(1.0 / DOOR_FPS)
		if _skipped:
			return
	if not _door_open.is_empty():
		_door.texture = _door_open[0]


func _look_at_davdav() -> void:
	for name in ["naomi", "joe", "dandan", "eithan", "alan"]:
		var n := _cast.get_node_or_null(name) as Sprite2D
		if n:
			_swap(name, "idle_down")


func _trip() -> void:
	var alan := _cast.get_node_or_null("alan") as Sprite2D
	if alan == null:
		return
	_placeholder.visible = true
	_placeholder.text = "[PLACEHOLDER — toy rocket / trip]"
	var rocket := Label.new()
	rocket.text = "🚀"
	rocket.position = Vector2(760, 390)
	rocket.add_theme_font_size_override("font_size", 22)
	_cast.add_child(rocket)
	var step := create_tween()
	step.tween_property(alan, "position", Vector2(740, 390), 0.55)
	await step.finished
	if _skipped:
		return
	_swap("alan", "fall_right")
	await _wait(0.45)
	_placeholder.visible = false


func _title_and_handoff() -> void:
	_dialog.visible = false
	_continue.visible = false
	_cast.visible = false
	_alan_sleep.visible = false
	_mug.visible = false
	_zzz.visible = false
	_chaya.visible = false
	_chaya_face.visible = false
	_hide_incoming()
	_amber = false
	_amber_flash.modulate.a = 0.0
	_placeholder.visible = false
	_giant.visible = false
	_ended.visible = false
	await _fade_to(1.0, 0.35)
	if _skipped:
		return
	_title_card.visible = true
	await _fade_to(0.0, 0.35)
	await _wait(1.6)
	await _wait_for_advance()
	GameFlow.story_countdown = "19:59"
	_giant.text = "19:59"
	_giant.visible = true
	await _fade_to(1.0, 0.4)
	_finish()


func _finish() -> void:
	if _finished:
		return
	_finished = true
	_skipped = true
	GameFlow.mug_stuck = true
	if GameFlow.story_countdown == "any second now":
		GameFlow.story_countdown = "19:59"
	await _fade_to(1.0, 0.25)
	GameFlow.begin_gameplay()


func _spawn(who: String, at: Vector2, anim: String) -> Sprite2D:
	var existing := _cast.get_node_or_null(who) as Sprite2D
	if existing:
		existing.position = at.round()
		_swap(who, anim)
		_depth(existing)
		return existing
	var sprite := Sprite2D.new()
	sprite.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	sprite.centered = false
	sprite.offset = Vector2(-56, -124)
	sprite.position = at.round()
	sprite.name = who
	_cast.add_child(sprite)
	var frames := _frames_for(who, anim)
	if frames.is_empty():
		frames = _frames_for(who, "idle_down")
	if not frames.is_empty():
		sprite.texture = frames[0]
		if frames.size() > 1:
			_cast_anim[who] = {"node": sprite, "frames": frames, "index": 0, "accum": 0.0}
	_depth(sprite)
	return sprite


func _swap(who: String, anim: String) -> void:
	var sprite := _cast.get_node_or_null(who) as Sprite2D
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
	_depth(sprite)


func _depth(sprite: Sprite2D) -> void:
	var feet_y: float = sprite.position.y
	var s := clampf(0.0011538 * feet_y + 1.0, 1.10, 1.70) * (104.0 / 128.0)
	sprite.scale = Vector2(s, s)
	sprite.z_index = clampi(int(feet_y / 24.0), 1, 22)


func _badge(sprite: Sprite2D, text: String) -> void:
	var tag := Label.new()
	tag.text = text
	tag.position = Vector2(-40, -150)
	tag.add_theme_font_size_override("font_size", 11)
	tag.add_theme_color_override("font_color", Color(1, 0.92, 0.55, 0.95))
	sprite.add_child(tag)


func _frames_for(who: String, anim: String) -> Array[Texture2D]:
	var dir := "%s/%s" % [CAST, who]
	var single: Array[Texture2D] = []
	if anim in ["surprised", "laugh", "thumbs_up"]:
		var one := Frames.load_png("%s/%s_00.png" % [dir, anim])
		if one:
			single.append(one)
		return single
	if anim == "reach_up_right":
		var reach := Frames.load_seq(dir, anim, 2)
		if reach.is_empty():
			var one := Frames.load_png("%s/reach_up_right_00.png" % dir)
			if one:
				single.append(one)
			return single
		return reach
	if anim == "fall_right":
		return Frames.load_seq(dir, anim, 6)
	if anim.begins_with("walk") or anim.begins_with("idle") or anim.begins_with("talk"):
		return Frames.load_seq(dir, anim, 8)
	return Frames.load_seq(dir, anim, 4)


func _say(speaker: String, text: String) -> void:
	if _skipped:
		return
	if _chaya_face.visible:
		if speaker.begins_with("CHAYA"):
			if "Comb your hair" in text or "clean ship" in text or "grandfather" in text:
				_play_chaya("judge")
			else:
				_play_chaya("talk")
		else:
			_play_chaya("idle")
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
