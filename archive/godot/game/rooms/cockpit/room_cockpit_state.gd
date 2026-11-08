extends PopochiuRoomData

var printout_taken := false


func _on_save() -> Dictionary:
	return {"printout_taken": printout_taken}


func _on_load(data: Dictionary) -> void:
	printout_taken = data.get("printout_taken", false)
