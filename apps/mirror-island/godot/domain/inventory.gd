class_name FarmInventory
extends RefCounted
## 库存迁移：保持整组交换、半组向上取整、工具原槽固定和原物品堆叠上限。

var items: Dictionary

## 绑定只读物品定义；不持有或修改 GameSession 的库存引用。
func _init(definitions: Dictionary) -> void:
	items = definitions

## 返回一个物品在全部槽位的总数，空槽不计入。
func quantity(slots: Array, item_id: String) -> int:
	var total := 0
	for slot: Dictionary in slots:
		if slot.itemId == item_id:
			total += int(slot.quantity)
	return total

## 检查完整数量是否放得下；数量必须为正整数。
func can_add(slots: Array, item_id: String, amount: int) -> bool:
	if not items.has(item_id) or amount <= 0:
		return false
	var capacity := 0
	var maximum: int = items[item_id].maxStack
	for slot: Dictionary in slots:
		if slot.itemId == item_id:
			capacity += maximum - int(slot.quantity)
		elif slot.itemId == "":
			capacity += maximum
	return capacity >= amount

## 先完整预检，再依次合并已有堆叠和空格；失败不产生部分写入。
func add(slots: Array, item_id: String, amount: int) -> bool:
	if not can_add(slots, item_id, amount):
		return false
	var remaining := amount
	for pass_index in range(2):
		for slot: Dictionary in slots:
			if (pass_index == 0 and slot.itemId != item_id) or (pass_index == 1 and slot.itemId != ""):
				continue
			var count := mini(remaining, int(items[item_id].maxStack) - int(slot.quantity))
			slot.itemId = item_id
			slot.quantity += count
			remaining -= count
			if remaining == 0:
				return true
	return false

## 从所有槽位完整扣除所需数量，余额不足时不修改。
func consume(slots: Array, item_id: String, amount: int) -> bool:
	if amount <= 0 or quantity(slots, item_id) < amount:
		return false
	var remaining := amount
	for slot: Dictionary in slots:
		if slot.itemId != item_id:
			continue
		var count := mini(remaining, int(slot.quantity))
		slot.quantity -= count
		remaining -= count
		if slot.quantity == 0:
			slot.itemId = ""
		if remaining == 0:
			return true
	return false

## 向一个指定槽位添加完整产物；禁止自动换格或覆盖其他物品。
func add_at(slots: Array, index: int, item_id: String, amount: int) -> bool:
	if index < 0 or index >= slots.size() or not items.has(item_id) or amount < 1:
		return false
	var slot: Dictionary = slots[index]
	if slot.itemId not in ["", item_id] or slot.quantity + amount > items[item_id].maxStack:
		return false
	slot.itemId = item_id
	slot.quantity += amount
	return true

## 从指定槽位扣除完整数量，清空时同步清除物品 ID。
func consume_at(slots: Array, index: int, amount: int) -> bool:
	if index < 0 or index >= slots.size() or amount < 1 or slots[index].quantity < amount:
		return false
	slots[index].quantity -= amount
	if slots[index].quantity == 0:
		slots[index].itemId = ""
	return true

## 在明确源/目标格之间转移；只有整组允许交换不同物品。
func transfer(source: Array, from_index: int, target: Array, to_index: int, mode: String) -> bool:
	if from_index < 0 or from_index >= source.size() or to_index < 0 or to_index >= target.size() or mode not in ["stack","one","half"]:
		return false
	if is_same(source, target) and from_index == to_index:
		return false
	var original: Dictionary = source[from_index]
	var destination: Dictionary = target[to_index]
	if not items.has(original.itemId) or original.quantity < 1:
		return false
	var amount := int(original.quantity)
	if mode == "one": amount = 1
	elif mode == "half": amount = ceili(float(amount) / 2.0)
	if destination.itemId != "" and destination.itemId != original.itemId:
		if mode != "stack": return false
		source[from_index] = destination.duplicate(true)
		target[to_index] = original.duplicate(true)
		return true
	if destination.quantity + amount > items[original.itemId].maxStack:
		return false
	destination.itemId = original.itemId
	destination.quantity += amount
	original.quantity -= amount
	if original.quantity == 0: original.itemId = ""
	return true

## 稳定整理可堆叠物；背包保留工具原槽，箱子可一并整理工具。
func sort_slots(slots: Array, preserve_tools: bool = true) -> bool:
	var candidate := slots.duplicate(true)
	var totals := {}
	var available: Array[int] = []
	for index in range(slots.size()):
		var slot: Dictionary = slots[index]
		if preserve_tools and items.get(slot.itemId, {}).get("category") == "tool": continue
		available.append(index)
		candidate[index] = {"itemId":"", "quantity":0}
		if items.has(slot.itemId): totals[slot.itemId] = totals.get(slot.itemId, 0) + slot.quantity
	var ids := totals.keys()
	ids.sort_custom(_sort_items)
	var position := 0
	for item_id: String in ids:
		var remaining := int(totals[item_id])
		while remaining > 0:
			if position >= available.size(): return false
			var amount := mini(remaining, int(items[item_id].maxStack))
			candidate[available[position]] = {"itemId":item_id, "quantity":amount}
			remaining -= amount
			position += 1
	if candidate == slots: return false
	slots.assign(candidate)
	return true

## 使用定义中的排序值，禁止依赖本机语言排序。
func _sort_items(left: String, right: String) -> bool:
	return items[left].inventorySortOrder < items[right].inventorySortOrder

## 轮换整个十二格行，保留第一行为活动快捷栏的存档合同。
func rotate(slots: Array, direction: int) -> bool:
	if slots.size() not in [24,36] or direction not in [-1,1]: return false
	var split := 12 if direction == 1 else slots.size() - 12
	var candidate := slots.slice(split) + slots.slice(0, split)
	slots.assign(candidate)
	return true

## 构造独立空槽列表；每个字典都是不同对象，避免共用引用。
static func empty_slots(count: int) -> Array:
	var slots: Array = []
	for index in range(count): slots.append({"itemId":"", "quantity":0})
	return slots
