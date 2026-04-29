# Frontend Public Assets

Runtime files in this directory are served by Vite/React Router as stable public URLs.

## Canonical layout

```text
frontend/public/assets/
├── npcs/
│   └── public-welfare/
│       └── <char_id>/
│           ├── neutral.png
│           ├── joy.png
│           ├── anger.png
│           ├── embarrassment.png
│           └── curiosity.png
└── map-snapshots/
    └── <snapshot_id>/
        ├── manifest.json
        └── tile-*.png
```

## Rules

- Public URLs must start with `/assets/...`.
- Default NPC seed assets use `/assets/npcs/public-welfare/<char_id>/<expression>.png`.
- Do not place deliverable runtime images only in `.codex/generated_images`, temp folders, or chat previews.
- Date-based folders belong under `artifacts/assets/<YYYY-MM-DD-task>/`, not inside runtime public assets.
- Keep generated build output out of this directory.
