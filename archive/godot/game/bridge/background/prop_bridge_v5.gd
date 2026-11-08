@tool
extends PopochiuProp
## Painted bridge background, 1024×576, armrest mug painted out.
##
## Use [code]bridge_v5_00_nomug.png[/code] (blink frame [code]bridge_v5_01_nomug.png[/code])
## from here on. The older [code]bridge_v5_00.png[/code] still has the mug baked into the armrest.
## Indexed twins sit beside them: [code]bridge_v5_00_nomug_256.png[/code] and
## [code]bridge_v5_01_nomug_256.png[/code]. [method use_indexed_palette] points the sprite
## at the 256-colour still. [method play_blink] plays [code]blink[/code] (full colour) or
## [code]blink_256[/code].
##
## [code]bridge_v5_mugpatch.png[/code] restores that mug at room (500, 135). It stays
## hidden because the intro mug is its own sprite. Call [method show_mug_patch] to paint
## it back in.
##
## Instance under Props in a 1024×576 room. Root position is the image centre (512, 288),
## baseline -400 so the art sorts behind characters the same way the placeholder does.
## The live cockpit is still the 640×360 placeholder and does not use this prop.
## Blink timing is 2 fps. That number is not from a sheet.

const FRAME_00 := preload("res://game/bridge/background/bridge_v5_00_nomug.png")
const FRAME_01 := preload("res://game/bridge/background/bridge_v5_01_nomug.png")
const FRAME_00_256 := preload("res://game/bridge/background/bridge_v5_00_nomug_256.png")
const FRAME_01_256 := preload("res://game/bridge/background/bridge_v5_01_nomug_256.png")
const MUG_PATCH_TOP_LEFT := Vector2(500, 135)

var _indexed := false


func play_blink() -> void:
	if _indexed:
		$AnimationPlayer.play(&"blink_256")
	else:
		$AnimationPlayer.play(&"blink")


func stop_blink() -> void:
	$AnimationPlayer.stop()
	$Sprite2D.texture = FRAME_00_256 if _indexed else FRAME_00


## Still frame only. The next [method play_blink] uses the matching pair.
func use_indexed_palette(indexed: bool) -> void:
	_indexed = indexed
	stop_blink()


func frame_pair(indexed: bool = false) -> Array[Texture2D]:
	if indexed:
		return [FRAME_00_256, FRAME_01_256]
	return [FRAME_00, FRAME_01]


func show_mug_patch(enabled: bool) -> void:
	var patch := get_node_or_null("MugPatch")
	if patch is CanvasItem:
		(patch as CanvasItem).visible = enabled
