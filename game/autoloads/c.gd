@tool
extends "res://addons/popochiu/engine/interfaces/i_character.gd"

# classes ----
const PCAlan := preload("res://game/characters/alan/character_alan.gd")
const PCJoe := preload("res://game/characters/joe/character_joe.gd")
# ---- classes

# nodes ----
var Alan: PCAlan : get = get_Alan
var Joe: PCJoe : get = get_Joe
# ---- nodes

# functions ----
func get_Alan() -> PCAlan: return get_runtime_character("Alan")
func get_Joe() -> PCJoe: return get_runtime_character("Joe")
# ---- functions
