# Discover Board Height Playwright Self Acceptance

Date: 2026-05-09
Base URL: http://127.0.0.1:4177

## Assertions

- Desktop radar board stays within the viewport instead of stretching the page indefinitely.
- Desktop radar/card result lists scroll inside dedicated containers when the mocked tavern list is long.
- Mobile discover route still renders without horizontal overflow.

## Desktop radar metrics

`{"top":51,"bottom":1011,"height":960,"viewportHeight":1100}`

`{"clientHeight":642,"scrollHeight":1028,"overflowY":"auto"}`

## Desktop cards metrics

`{"top":51,"bottom":1011,"height":960,"viewportHeight":1100}`

`{"clientHeight":772,"scrollHeight":772,"overflowY":"auto"}`

## Screenshots

- `D:\work\ai-\.trellis\tasks\05-05-05-05-discover-radar-density\artifacts\playwright-board-height\discover-radar-desktop-height.png`
- `D:\work\ai-\.trellis\tasks\05-05-05-05-discover-radar-density\artifacts\playwright-board-height\discover-cards-desktop-height.png`
- `D:\work\ai-\.trellis\tasks\05-05-05-05-discover-radar-density\artifacts\playwright-board-height\discover-mobile-height.png`
