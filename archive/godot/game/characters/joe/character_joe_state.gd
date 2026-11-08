extends PopochiuCharacterData

var accepted_printout := false


func _on_save() -> Dictionary:
	return {"accepted_printout": accepted_printout}


func _on_load(data: Dictionary) -> void:
	accepted_printout = data.get("accepted_printout", false)
