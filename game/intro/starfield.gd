extends Node2D
## Parallax stars, planets, and nebulae. The intro director swaps "systems".

const SYSTEM_DEEP := 0
const SYSTEM_BINARY := 1
const SYSTEM_NEBULA := 2
const SYSTEM_CLUSTER := 3

var system := SYSTEM_DEEP
var scroll := 0.0
var _stars: Array[Dictionary] = []
var _rng := RandomNumberGenerator.new()


func _ready() -> void:
	_rng.seed = 47
	_stars.clear()
	for i in 160:
		_stars.append({
			"p": Vector2(_rng.randf() * 720.0, _rng.randf() * 400.0),
			"z": _rng.randf_range(0.15, 1.4),
			"s": _rng.randf_range(0.6, 2.2),
			"c": Color(
				_rng.randf_range(0.75, 1.0),
				_rng.randf_range(0.8, 1.0),
				_rng.randf_range(0.85, 1.0),
				_rng.randf_range(0.35, 1.0)
			)
		})


func _process(delta: float) -> void:
	scroll += delta * 18.0
	queue_redraw()


func _draw() -> void:
	draw_rect(Rect2(-20, -20, 680, 400), _sky_color())
	_draw_nebula()
	for star in _stars:
		var z: float = star.z
		var x: float = fposmod(star.p.x - scroll * z, 720.0) - 40.0
		var y: float = star.p.y - 20.0
		draw_circle(Vector2(x, y), star.s * (0.6 + z * 0.4), star.c)
	_draw_planets()


func _sky_color() -> Color:
	match system:
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
			_blob(Vector2(420, 140), 160, Color(0.55, 0.12, 0.45, 0.22))
			_blob(Vector2(500, 200), 120, Color(0.2, 0.1, 0.55, 0.18))
			_blob(Vector2(180, 80), 90, Color(0.7, 0.25, 0.35, 0.12))
		SYSTEM_CLUSTER:
			_blob(Vector2(300, 80), 140, Color(0.1, 0.35, 0.4, 0.16))
		SYSTEM_BINARY:
			_blob(Vector2(520, 60), 100, Color(0.45, 0.28, 0.05, 0.12))
		_:
			_blob(Vector2(80, 40), 70, Color(0.1, 0.15, 0.35, 0.08))


func _draw_planets() -> void:
	match system:
		SYSTEM_BINARY:
			draw_circle(Vector2(520, 90), 28, Color(0.95, 0.78, 0.25, 0.95))
			draw_circle(Vector2(575, 108), 16, Color(0.95, 0.45, 0.15, 0.9))
			_ring(Vector2(200, 250), 34, 50, Color(0.75, 0.7, 0.55, 0.55))
			draw_circle(Vector2(200, 250), 22, Color(0.35, 0.55, 0.7, 0.95))
		SYSTEM_NEBULA:
			draw_circle(Vector2(120, 260), 36, Color(0.55, 0.2, 0.45, 0.9))
			draw_circle(Vector2(108, 248), 10, Color(0.25, 0.08, 0.2, 0.7))
		SYSTEM_CLUSTER:
			draw_circle(Vector2(560, 70), 10, Color(1, 0.95, 0.7, 1))
			draw_circle(Vector2(90, 200), 18, Color(0.4, 0.75, 0.7, 0.9))
			draw_circle(Vector2(400, 300), 8, Color(0.8, 0.9, 1, 0.8))
		_:
			draw_circle(Vector2(540, 80), 26, Color(0.25, 0.45, 0.85, 0.95))
			draw_circle(Vector2(528, 72), 7, Color(0.15, 0.3, 0.55, 0.7))
			draw_circle(Vector2(140, 290), 14, Color(0.7, 0.45, 0.3, 0.85))


func _blob(center: Vector2, radius: float, color: Color) -> void:
	for i in 5:
		var t := float(i) / 5.0
		draw_circle(center + Vector2(i * 7, i * 3), radius * (1.0 - t * 0.25), Color(color, color.a * (1.0 - t * 0.35)))


func _ring(center: Vector2, inner: float, outer: float, color: Color) -> void:
	draw_arc(center, (inner + outer) * 0.5, 0.4, PI - 0.4, 32, color, outer - inner)
