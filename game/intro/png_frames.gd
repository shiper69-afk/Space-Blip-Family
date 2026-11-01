class_name IntroFrames
extends RefCounted
## Loads intro PNGs from bytes so they play even before the editor imports them.

static var _cache: Dictionary = {}


static func load_png(path: String) -> Texture2D:
	if _cache.has(path):
		return _cache[path]
	if not FileAccess.file_exists(path):
		return null
	var bytes := FileAccess.get_file_as_bytes(path)
	if bytes.is_empty():
		return null
	var image := Image.new()
	if image.load_png_from_buffer(bytes) != OK:
		return null
	var tex := ImageTexture.create_from_image(image)
	_cache[path] = tex
	return tex


static func load_seq(dir: String, prefix: String, count: int) -> Array[Texture2D]:
	var out: Array[Texture2D] = []
	for i in count:
		var tex := load_png("%s/%s_%02d.png" % [dir, prefix, i])
		if tex:
			out.append(tex)
	return out
