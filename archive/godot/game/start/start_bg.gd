extends TextureRect
## Streams the owner start-screen loop one frame at a time (12 fps, 360 frames).
## Avoids packing all frames into SpriteFrames (~810 MB if resident).

const FRAME_PATH := "res://assets/art/originals/startscreen/frames/startbg_%04d.png"
const FRAME_COUNT := 360
const FPS := 12.0

var _index := 0
var _accum := 0.0
var _image_texture: ImageTexture


func _ready() -> void:
	expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_COVERED
	mouse_filter = Control.MOUSE_FILTER_IGNORE
	_apply_frame(0)


func _process(delta: float) -> void:
	_accum += delta
	var step := 1.0 / FPS
	if _accum < step:
		return
	# Drop leftover time so a hitch does not fast-forward the warp cycle.
	_accum = fmod(_accum, step)
	_index = (_index + 1) % FRAME_COUNT
	_apply_frame(_index)


func _apply_frame(index: int) -> void:
	var path := FRAME_PATH % index
	var loaded := _load_png_bytes(path)
	if loaded != null:
		texture = loaded
		return
	var imported := ResourceLoader.load(path, "Texture2D", ResourceLoader.CACHE_MODE_IGNORE)
	if imported is Texture2D:
		texture = imported


func _load_png_bytes(path: String) -> Texture2D:
	if not FileAccess.file_exists(path):
		return null
	var bytes := FileAccess.get_file_as_bytes(path)
	if bytes.is_empty():
		return null
	var image := Image.new()
	if image.load_png_from_buffer(bytes) != OK:
		return null
	if _image_texture == null:
		_image_texture = ImageTexture.create_from_image(image)
	else:
		_image_texture.set_image(image)
	return _image_texture
