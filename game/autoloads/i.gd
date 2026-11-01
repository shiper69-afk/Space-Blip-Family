@tool
extends "res://addons/popochiu/engine/interfaces/i_inventory.gd"

# classes ----
const PIIAlertPrintout := preload("res://game/inventory_items/alert_printout/inventory_item_alert_printout.gd")
# ---- classes

# nodes ----
var AlertPrintout: PIIAlertPrintout : get = get_AlertPrintout
# ---- nodes

# functions ----
func get_AlertPrintout() -> PIIAlertPrintout: return get_item_instance("AlertPrintout")
# ---- functions
