# Special Tavern Types API Contract

> Contract for the `special_type` field in Tavern entity, providing a thin layer for specialized gameplay (e.g., cultivation) without polluting `place_type`.

### Supported Types
| Type | Description |
|------|-------------|
| `""` | Standard tavern without specific gameplay logic. |
| `"cultivation"` | Cultivation (修行) gameplay enabled (offline receipts, realms). |
| `"divination"` | Divination (占卜) gameplay enabled (tarot, astrology, oracle). |

---

## 1. Scope / Trigger

- **Trigger**: Introducing a new structured category for taverns that enables specific gameplay logic (like offline progression or cultivation stages) but does not map 1:1 to a real-world building type (`place_type`).
- **Standard**: All special-type logic must fallback to standard tavern behavior if the type is unknown or empty.

---

## 2. Signatures

### Tavern Dataclass (`backend/src/fablemap_api/core/tavern.py`)

```python
@dataclass
class Tavern:
    # ... existing fields
    special_type: str = ""  # '' | 'cultivation' | 'divination'
```

### TavernModel (`backend/src/fablemap_api/infrastructure/models.py`)

```python
class TavernModel(Base):
    # ...
    special_type = Column(String(32), nullable=False, default="")
```

---

## 3. Contracts

### Request Payload (Create/Update Tavern)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `special_type` | `string` | No | One of `['', 'cultivation', 'divination']`. Defaults to `''`. |

### Response Payload (Tavern Detail)

| Field | Type | Description |
|-------|------|-------------|
| `special_type` | `string` | The normalized special type of the tavern. |

---

## 4. Validation & Error Matrix

| Input | Behavior | Response Code |
|-------|----------|---------------|
| `null` | Normalized to `""` | `200 OK` |
| `"CULTIVATION"` | Normalized to `"cultivation"` (lower case) | `200 OK` |
| `"invalid-type"` | Normalized to `""` (fallback to none) | `200 OK` |
| Missing field | Remains as existing value (Update) or `""` (Create) | `200 OK` |

---

## 5. Good/Base/Bad Cases

### Good (Cultivation Tavern)
- `special_type = "cultivation"`
- `is_cultivation_tavern(tavern)` returns `True`.
- Offline progress and cultivation receipt logic are triggered on `enter_tavern`.

### Base (Generic Tavern)
- `special_type = ""`
- Standard tavern behavior.

### Backward Compatibility (Legacy Cultivation)
- `special_type = ""` but `layout_style = "quest-play"`.
- `is_cultivation_tavern(tavern)` returns `True` via fallback check.

---

## 6. Tests Required

### Unit Tests (`backend/tests/`)
- [ ] Test `_normalize_special_type` with various inputs (caps, whitespace, invalid).
- [ ] Test `is_cultivation_tavern` logic priority (`special_type` > `layout_style` > `skill_packs`).

### Integration Tests
- [ ] Verify `special_type` persists correctly in MySQL.
- [ ] Verify `create_tavern` / `update_tavern` APIs correctly handle the field.

---

## 7. Wrong vs Correct

### Wrong
Overloading `place_type` for gameplay mechanics.
```python
# WRONG: Using place_type to trigger cultivation logic
if tavern.place_type == "cultivation":
    do_progression()
```

### Correct
Using the dedicated `special_type` field.
```python
# CORRECT: Keeping place_type as 'tavern' or 'cafe', while special_type is 'cultivation'
if tavern.special_type == "cultivation":
    do_progression()
```
