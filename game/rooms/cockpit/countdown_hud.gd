extends CanvasLayer
## About twenty seconds of story urgency. Not a 20:00 clock. Does not tick.

@onready var _label: Label = %CountdownLabel


func _ready() -> void:
	layer = 20
	_label.text = GameFlow.STORY_COUNTDOWN
