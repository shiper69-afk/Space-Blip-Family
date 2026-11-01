extends PopochiuInventoryItem

const Data := preload("inventory_item_alert_printout_state.gd")

var state: Data = load("res://game/inventory_items/alert_printout/inventory_item_alert_printout.tres")


func _on_click() -> void:
	E.command_fallback()


func on_look() -> void:
	await C.player.say("Family-systems alert, printed on paper that still smells like the console.")


func on_interact() -> void:
	await C.player.say("I should show this to Joe. He collects stamps. And protocols.")


func _on_item_used(_item: PopochiuInventoryItem) -> void:
	await C.player.say("Two pieces of paper won't cancel the amber light.")
