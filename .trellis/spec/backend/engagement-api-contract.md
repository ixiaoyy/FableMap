# Engagement API Contract

> Per-tavern soft currency, gift, and bonus-voucher API/storage contract.

## Scope / Trigger

Use this when changing:

- `backend/src/fablemap_api/api/v1/engagement.py`
- `backend/src/fablemap_api/application/engagement.py`
- `backend/src/fablemap_api/core/engagement.py`
- `backend/src/fablemap_api/infrastructure/engagement_store.py`
- `backend/src/fablemap_api/infrastructure/mysql_store.py`
- `backend/src/fablemap_api/infrastructure/models.py`
- `docs/WORLD_SCHEMA.md` engagement sections

This feature must stay inside FableMap's hard boundaries:

- no充值 / no提现 / no结算 / no平台钱包
- no跨空间流通 / no转让 / no访客间交易
- reward sources must come from owner-published gameplay or safe defaults

## Storage Contract

### Tavern private config

`Tavern.engagement_config` persists owner-configured or default-derived engagement settings.

```python
Tavern.engagement_config: dict[str, Any]
TavernModel.engagement_config = Column(JSON, default=dict)
```

Rules:

- `engagement_config` is included in owner/private tavern persistence.
- `Tavern.to_dict_public()` must not expose `engagement_config`.
- Empty config is allowed; the service derives safe defaults at read time.

### Visitor private progress

Visitor progress lives under `VisitorState.metadata["_engagement_progress"]`.

```python
VisitorState.metadata["_engagement_progress"] = {
  "wallet": {"balance": 40, "lifetime_earned": 80, "lifetime_spent": 40},
  "ledger": [...],
  "daily_counters": {"2026-05-09": {"earned": 20}},
  "gift_history": [...],
  "bonus_draw_vouchers": [...],
  "claimed_session_ids": ["gps_xxx"]
}
```

Persistence contract:

```python
VisitorModel.metadata_ = Column("metadata", JSON, default=dict)
```

`mysql_store.update_visitor_state()` must round-trip `VisitorState.metadata`, or engagement/cultivation private buckets will silently fail to persist.

### Runtime compatibility

For existing local/dev databases, `create_mysql_tables(database)` must:

- call `database.create_tables()`
- then add missing additive columns:
  - `taverns.engagement_config`
  - `visitors.metadata`

This runtime patch is for backward-compatible startup on old SQLite/MySQL dev DBs. Managed schema rollout still records `backend/sql/migrations/003_add_engagement_columns.sql`.

## Domain Signatures

```python
EngagementConfig.default_template() -> EngagementConfig
build_default_reward_rules(gameplay_definitions) -> list[RewardRule]

earn_coins(progress, config, amount, source_type, source_id) -> EarnCoinsResult
send_gift(progress, config, gift_id, character_id) -> SendGiftResult
redeem_voucher(progress, config) -> RedeemVoucherResult

EngagementStore.load_config(tavern_id) -> dict[str, Any]
EngagementStore.save_config(tavern_id, config) -> None
EngagementStore.load_progress(tavern_id, visitor_id) -> dict[str, Any]
EngagementStore.save_progress(tavern_id, visitor_id, progress) -> None
EngagementStore.get_gameplay_session(tavern_id, session_id) -> GameplaySession | None
```

## API Endpoints

All routes are under:

```text
/api/v1/taverns/{tavern_id}/engagement
```

### `GET /me`

Visitor-only progress snapshot.

Response:

```json
{
  "coin_label": "纪念币",
  "wallet": { "balance": 40, "lifetime_earned": 80, "lifetime_spent": 40 },
  "vouchers_available": 1,
  "daily_earned": 20
}
```

Rules:

- require visitor identity; missing identity => `401`
- only return the current visitor's own progress

### `GET /config`

Shared read surface with owner-safe branching.

Visitor/public response must omit `reward_rules`.
Owner response may include full config, including `reward_rules`.

Rules:

- respect tavern visibility via tavern application service
- if stored config is empty, derive defaults from `EngagementConfig.default_template()`
- if no explicit reward rules exist, derive them from published `gameplay_definitions`

### `PUT /config`

Owner-only config save.

Request body example:

```json
{
  "coin_label": "心意点",
  "reward_rules": [
    {
      "source_type": "gameplay_completion",
      "source_id": "gp_coin_intro",
      "amount": 40,
      "daily_claim_limit": 1
    }
  ],
  "bonus_draw": {
    "enabled": true,
    "voucher_price": 30,
    "daily_limit": 1,
    "weekly_limit": 3,
    "hidden_unlock_allowed": false
  }
}
```

Rules:

- visible tavern + owner check required
- persists to `tavern.engagement_config`

### `POST /claim-reward`

Request:

```json
{ "session_id": "gps_xxx" }
```

Rules:

- require visitor identity
- load real `GameplaySession` by `session_id`
- session must belong to the same tavern
- only the session owner (or tavern owner for inspection) can reference it
- reward lookup key is `session.gameplay_id`, not `session.id`
- earn idempotency key is the completed session id (`source_id=session.id`)
- incomplete session => `400`
- missing session => `404`
- other visitor's session => `403`

Success response:

```json
{
  "success": true,
  "amount": 40,
  "reason": "",
  "balance": 40
}
```

### `POST /gifts/send`

Request:

```json
{ "gift_id": "warm_tea", "character_id": "npc_keeper" }
```

Rules:

- require visitor identity
- gift must come from config/default gift catalog
- spend balance first, then persist updated `_engagement_progress`

Response:

```json
{
  "success": true,
  "gift_id": "warm_tea",
  "character_id": "npc_keeper",
  "amount": 10,
  "affinity_delta": 2,
  "cap_applied": false,
  "reason": "",
  "narration": "茶博士收下了礼物。",
  "balance": 30
}
```

### `POST /vouchers/redeem`

No body required.

Rules:

- require visitor identity
- respect `bonus_draw.enabled`
- deduct from the same tavern-local balance
- create one new unredeemed voucher entry in the visitor private bucket

## Validation & Error Matrix

| Case | Expected |
| --- | --- |
| Missing `X-User-Id` on `/engagement/me` | `401` |
| Visitor reads `/config` | 200 + no `reward_rules` field |
| Owner reads `/config` | 200 + full config |
| Owner updates config | 200 + persisted `engagement_config` |
| Claim reward for missing session | `404` |
| Claim reward for incomplete session | `400` |
| Claim reward for another visitor session | `403` |
| Claim same completed session twice | 200 + `success=false` + duplicate reason |
| Send gift without enough balance | 200 + `success=false` + insufficient balance reason |
| Redeem voucher when disabled or insufficient balance | 200 + `success=false` |
| Old dev DB missing new columns | startup survives and additive columns are patched |

## Good / Base / Bad Cases

Good:

- Owner publishes a gameplay; visitor completes one session; reward is claimable exactly once.
- Visitor balance is only visible on `/engagement/me`, never leaked into public tavern payload.
- Gift send and voucher redeem both persist through `VisitorState.metadata`.

Base:

- Default config works even before the owner saves any custom engagement config.

Bad:

- Matching reward rule by `session_id` instead of `gameplay_id`.
- Storing wallet/ledger as public tavern fields.
- Frontend or API allowing empty visitor identity for reward/gift/voucher actions.
- Treating `tavern_service.store` like a dict instead of the real store interface.

## Tests Required

```powershell
py -3 -m compileall -q backend/src
py -3 -m pytest -q backend/tests/test_engagement.py backend/tests/test_v1_engagement.py --tb=short
```

Optional broader regression when touching tavern/session persistence:

```powershell
py -3 -m pytest -q backend/tests/test_territory.py --tb=short
```

## Wrong vs Correct

### Wrong

```python
reward_rule = next(rule for rule in config.reward_rules if rule.source_id == session.id)
store[tavern_id] = config
progress = visitor_state["engagement"]
```

This uses the wrong reward key, bypasses the real store abstraction, and assumes dict-like tavern storage.

### Correct

```python
reward_rule = next((rule for rule in config.reward_rules if rule.source_id == session.gameplay_id), None)
stored = engagement_store.load_progress(tavern_id, visitor_id)
result = earn_coins(progress, config, amount=reward_rule.amount, source_type="gameplay_completion", source_id=session.id)
engagement_store.save_progress(tavern_id, visitor_id, progress.to_dict())
```

The correct flow uses the real gameplay definition id for rule lookup and the completed session id for idempotent awarding.
