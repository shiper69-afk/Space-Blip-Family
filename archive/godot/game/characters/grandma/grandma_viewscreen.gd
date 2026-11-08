@tool
extends AnimatedSprite2D
## Grandma on the bridge viewscreen during a video call.
## Authored for bridge_v5 (1024×576). With centered off, position (599, 40)
## is the top-left of the masked 145×89 frame. Animations loop at 8 fps:
## talk_down, idle, judge.
## Instance this on a room that uses bridge_v5, with the background's top-left at the room origin.


func show_call(anim: StringName = &"idle") -> void:
	visible = true
	play(anim)


func hide_call() -> void:
	stop()
	visible = false
