extends CanvasLayer
## After the live Chaya call: 19:59 story device. Does not tick.

@onready var _label: Label = %CountdownLabel


func _ready() -> void:
	layer = 20
	_label.text = GameFlow.story_countdown
