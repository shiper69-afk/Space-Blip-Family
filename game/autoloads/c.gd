@tool
extends "res://addons/popochiu/engine/interfaces/i_character.gd"

# classes ----
const PCAlan := preload("res://game/characters/alan/character_alan.gd")
const PCJoe := preload("res://game/characters/joe/character_joe.gd")
const PCNaomi := preload("res://game/characters/naomi/character_naomi.gd")
const PCDanDan := preload("res://game/characters/dandan/character_dandan.gd")
const PCEithan := preload("res://game/characters/eithan/character_eithan.gd")
const PCDavDav := preload("res://game/characters/davdav/character_davdav.gd")
# ---- classes

# nodes ----
var Alan: PCAlan : get = get_Alan
var Joe: PCJoe : get = get_Joe
var Naomi: PCNaomi : get = get_Naomi
var DanDan: PCDanDan : get = get_DanDan
var Eithan: PCEithan : get = get_Eithan
var DavDav: PCDavDav : get = get_DavDav
# ---- nodes

# functions ----
func get_Alan() -> PCAlan: return get_runtime_character("Alan")
func get_Joe() -> PCJoe: return get_runtime_character("Joe")
func get_Naomi() -> PCNaomi: return get_runtime_character("Naomi")
func get_DanDan() -> PCDanDan: return get_runtime_character("DanDan")
func get_Eithan() -> PCEithan: return get_runtime_character("Eithan")
func get_DavDav() -> PCDavDav: return get_runtime_character("DavDav")
# ---- functions
