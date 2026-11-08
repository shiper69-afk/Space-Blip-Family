class_name BridgeDepthScale
extends Node
## Scales Popochiu characters with feet [code]y[/code] on the painted bridge.
##
## Published curve (native sprite height 104px, feet at the node origin):
## [code]scale = clamp(0.0011538 * y + 1.0, 1.10, 1.70)[/code]
## The precise slope in [code]bridge_v5_depth.json[/code] is [code]0.12 / 104[/code]
## ([code]0.0011538461538461537[/code]), which is the value this node applies:
## [code]scale = clamp(a * feet_y + b, 1.10, 1.70)[/code].
##
## Anchors from that file: door threshold y219 = 1.253, captain chair y190 = 1.219,
## mid-room y330 = 1.381, front y560 = 1.646.
##
## Drop [code]bridge_depth_scale.tscn[/code] under the painted 1024×576 bridge room.
## Do not add it to the 640×360 placeholder cockpit — the curve is in bridge pixels.
## It writes Popochiu's [code]scaling_region[/code] so the engine's own [code]update_scale()[/code]
## keeps doing the work (including walk-speed). Remove it and the scale resets.
## Do not also enable [code]bridge_depth_region.tscn[/code]; both would fight.
##
## [code]bridge_depth_region.tscn[/code] is the same line as a Popochiu scaling region
## (1.10 at y = 86.6667, 1.70 at y = 606.6667). Characters only pick that up when their
## ScalingPolygon has area. Alan and Joe currently use a point polygon, so this node
## is the one that actually scales them.

const DEPTH_JSON := "res://game/bridge/bridge_v5_depth.json"
const REGION_TAG := "bridge_v5_depth"
const NATIVE_SPRITE_HEIGHT := 104.0

## Multiply the curve by this. Leave at 1 to apply the published scale to a 104px-tall
## puppet with feet on the origin. The walk sprites under [code]game/characters/[/code]
## are 128px tall with feet at the origin; set this to [code]104.0 / 128.0[/code] if
## those puppets should match the pixel heights on [code]bridge_depth_check.png[/code].
@export var height_ratio := 1.0

static var _formula_cache: Dictionary = {}

var _applied: Array[PopochiuCharacter] = []


static func scale_for_feet_y(feet_y: float, ratio: float = 1.0) -> float:
	var params := _formula()
	var raw: float = float(params["a"]) * feet_y + float(params["b"])
	return clampf(raw, float(params["min_s"]), float(params["max_s"])) * ratio


static func _formula() -> Dictionary:
	if not _formula_cache.is_empty():
		return _formula_cache
	var fallback := {
		"a": 0.12 / NATIVE_SPRITE_HEIGHT,
		"b": 1.0,
		"min_s": 1.10,
		"max_s": 1.70,
	}
	if not FileAccess.file_exists(DEPTH_JSON):
		_formula_cache = fallback
		return _formula_cache
	var file := FileAccess.open(DEPTH_JSON, FileAccess.READ)
	if file == null:
		_formula_cache = fallback
		return _formula_cache
	var parsed: Variant = JSON.parse_string(file.get_as_text())
	if parsed is Dictionary and (parsed as Dictionary).has("scale_formula"):
		var formula: Dictionary = (parsed as Dictionary)["scale_formula"]
		_formula_cache = {
			"a": float(formula["a"]),
			"b": float(formula["b"]),
			"min_s": float(formula["min"]),
			"max_s": float(formula["max"]),
		}
	else:
		_formula_cache = fallback
	return _formula_cache


func _ready() -> void:
	# Lower priority runs first, so characters see this region during their own move.
	process_priority = -100


func _process(_delta: float) -> void:
	var room := _find_room()
	if room == null:
		return
	var live: Array[PopochiuCharacter] = []
	var chars := room.get_node_or_null("Characters")
	if chars != null:
		for child in chars.get_children():
			if child is PopochiuCharacter:
				live.append(child)
				_apply(child)
	for chr in _applied:
		if not live.has(chr):
			_release(chr)
	_applied = live


func _exit_tree() -> void:
	for chr in _applied:
		_release(chr)
	_applied.clear()


func _apply(chr: PopochiuCharacter) -> void:
	var params := _formula()
	var ratio := height_ratio
	# Span the linear term exactly: scale = (a * y + b) * ratio, then clamp.
	var bottom := 1000.0
	var slope := float(params["a"])
	var intercept := float(params["b"])
	chr.scaling_region = {
		"region_description": REGION_TAG,
		"scale_top": intercept * ratio,
		"scale_bottom": (slope * bottom + intercept) * ratio,
		"scale_min": float(params["min_s"]) * ratio,
		"scale_max": float(params["max_s"]) * ratio,
		"polygon_top_y": 0.0,
		"polygon_bottom_y": bottom,
	}
	chr.update_scale()


func _release(chr: PopochiuCharacter) -> void:
	if not is_instance_valid(chr):
		return
	var tag := ""
	if chr.scaling_region is Dictionary:
		tag = str(chr.scaling_region.get("region_description", ""))
	if tag != REGION_TAG:
		return
	chr.scaling_region = {}
	chr.update_scale()


func _find_room() -> Node:
	var node := get_parent()
	while node != null:
		if node.get_node_or_null("Characters") != null and node.get("script_name") != null:
			return node
		node = node.get_parent()
	return null
