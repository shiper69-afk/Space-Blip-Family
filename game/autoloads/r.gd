@tool
extends "res://addons/popochiu/engine/interfaces/i_room.gd"

# classes ----
const PRCockpit := preload("res://game/rooms/cockpit/room_cockpit.gd")
const PRCorridor := preload("res://game/rooms/corridor/room_corridor.gd")
# ---- classes

# nodes ----
var Cockpit: PRCockpit : get = get_Cockpit
var Corridor: PRCorridor : get = get_Corridor
# ---- nodes

# functions ----
func get_Cockpit() -> PRCockpit: return get_runtime_room("Cockpit")
func get_Corridor() -> PRCorridor: return get_runtime_room("Corridor")
# ---- functions
