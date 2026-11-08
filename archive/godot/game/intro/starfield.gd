extends Node2D
## Parallax stars, planets, nebulae, and warp streaks. The intro director swaps "systems".

const SYSTEM_DEEP := 0
const SYSTEM_BINARY := 1
const SYSTEM_NEBULA := 2
const SYSTEM_CLUSTER := 3
const WIDTH := 1088.0
const HEIGHT := 640.0

var system := SYSTEM_DEEP: set = set_system
var scroll := 0.0
var warp := 0.0
var speed := 22.0
var _stars: Array[Dictionary] = []
var _rng := RandomNumberGenerator.new()
var _sky := Color(0.01, 0.02, 0.06, 1)
var _target_sky := Color(0.01, 0.02, 0.06, 1)


func _ready() -> void:
	_rng.seed = 47
	_stars.clear()
	for i in 260:
		_stars.append({
			"p": Vector2(_rng.randf() * WIDTH, _rng.randf() * HEIGHT),
			"z": _rng.randf_range(0.2, 1.6),
			"s": _rng.randf_range(0.7, 2.2),
			"c": Color(
				_rng.randf_range(0.78, 1.0),
				_rng.randf_range(0.82, 1.0),
				_rng.randf_range(0.88, 1.0),
				_rng.randf_range(0.4, 1.0)
			)
		})
	_sky = _sky_color_for(system)
	_target_sky = _sky


func set_system(value: int) -> void:
	system = value
	_target_sky = _sky_color_for(system)


func _process(delta: float) -> void:
	var travel := speed * (1.0 + warp * 7.0)
	scroll += delta * travel
	_sky = _sky.lerp(_target_sky, clampf(delta * 3.2, 0.0, 1.0))
	queue_redraw()


func _draw() -> void:
	draw_rect(Rect2(0, 0, 1024, 576), _sky)
	_draw_nebula()
	for star in _stars:
		var z: float = star.z
		var x: float = fposmod(star.p.x - scroll * z, WIDTH)
		var y: float = star.p.y
		var pos := Vector2(floor(x), floor(y))
		var radius: float = maxf(1.0, floor(star.s * (0.55 + z * 0.35)))
		if warp > 0.05:
			var streak := 6.0 + warp * z * 42.0
			draw_line(pos, pos + Vector2(-streak, 0), star.c, maxf(1.0, radius * 0.7))
		draw_circle(pos, radius, star.c)
	_draw_planets()


func _sky_color_for(which: int) -> Color:
	match which:
		SYSTEM_BINARY:
			return Color(0.04, 0.03, 0.09, 1)
		SYSTEM_NEBULA:
			return Color(0.07, 0.02, 0.08, 1)
		SYSTEM_CLUSTER:
			return Color(0.02, 0.05, 0.08, 1)
		_:
			return Color(0.01, 0.02, 0.06, 1)


func _draw_nebula() -> void:
	match system:
		SYSTEM_NEBULA:
			_blob(Vector2(680, 220), 240, Color(0.55, 0.12, 0.45, 0.22))
			_blob(Vector2(800, 320), 190, Color(0.2, 0.1, 0.55, 0.18))
			_blob(Vector2(280, 130), 140, Color(0.7, 0.25, 0.35, 0.12))
		SYSTEM_CLUSTER:
			_blob(Vector2(480, 130), 220, Color(0.1, 0.35, 0.4, 0.16))
		SYSTEM_BINARY:
			_blob(Vector2(830, 96), 160, Color(0.45, 0.28, 0.05, 0.12))
		_:
			_blob(Vector2(128, 64), 110, Color(0.1, 0.15, 0.35, 0.08))


func _draw_planets() -> void:
	var drift := Vector2(floor(fposmod(-scroll * 0.12, 8.0) - 4.0), 0)
	match system:
		SYSTEM_BINARY:
			draw_circle(Vector2(830, 144) + drift, 44, Color(0.95, 0.78, 0.25, 0.95))
			draw_circle(Vector2(920, 172) + drift, 26, Color(0.95, 0.45, 0.15, 0.9))
			_ring(Vector2(320, 400) + drift, 54, 80, Color(0.75, 0.7, 0.55, 0.55))
			draw_circle(Vector2(320, 400) + drift, 36, Color(0.35, 0.55, 0.7, 0.95))
		SYSTEM_NEBULA:
			draw_circle(Vector2(190, 416) + drift, 56, Color(0.55, 0.2, 0.45, 0.9))
			draw_circle(Vector2(172, 396) + drift, 16, Color(0.25, 0.08, 0.2, 0.7))
		SYSTEM_CLUSTER:
			draw_circle(Vector2(896, 112) + drift, 16, Color(1, 0.95, 0.7, 1))
			draw_circle(Vector2(144, 320) + drift, 28, Color(0.4, 0.75, 0.7, 0.9))
			draw_circle(Vector2(640, 480) + drift, 12, Color(0.8, 0.9, 1, 0.8))
		_:
			draw_circle(Vector2(864, 128) + drift, 42, Color(0.25, 0.45, 0.85, 0.95))
			draw_circle(Vector2(844, 114) + drift, 11, Color(0.15, 0.3, 0.55, 0.7))
			draw_circle(Vector2(224, 464) + drift, 22, Color(0.7, 0.45, 0.3, 0.85))


func _blob(center: Vector2, radius: float, color: Color) -> void:
	for i in 5:
		var t := float(i) / 5.0
		draw_circle(center + Vector2(i * 7, i * 3), radius * (1.0 - t * 0.25), Color(color, color.a * (1.0 - t * 0.35)))


func _ring(center: Vector2, inner: float, outer: float, color: Color) -> void:
	draw_arc(center, (inner + outer) * 0.5, 0.4, PI - 0.4, 32, color, outer - inner)
