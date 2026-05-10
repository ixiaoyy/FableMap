# brainstorm: Modular Visual Prompt Blocks Editor (Dedicated Page)

## Goal

Create a dedicated, large-scale visual editor for NPC prompt blocks. This page will allow Tavern Owners to "tune" their NPCs with a modular, block-based interface, providing a high-fidelity "AI Debugger/Studio" experience. It moves away from simple form fields to a structured stack of prompt layers.

## What I already know

*   **Current State**: Prompt logic is scattered between `CharacterEditor.jsx` and `promptStyleDials.js`.
*   **Prompt Layers**: The prompt consists of: Platform Boundary, Character Card, Style Dials (managed block), WorldInfo (runtime), and Visitor State (runtime).
*   **Risk Linting**: `characterPromptRiskLinter.js` provides safety checks.
*   **Requirement**: The user wants a **new dedicated large editor page**.

## Requirements (MVP)

### 1. Dedicated Route & Layout
*   New route: `/prompt-editor/:characterId` (or similar).
*   Split-pane layout: **Left (Block Stack)** vs **Right (Live Prompt Preview)**.

### 2. Modular Block Stack
*   **Managed Blocks**: Style Dials (Length, Density, Perspective, Emotion, Genre).
*   **Character Card Blocks**: Name, Personality, Scenario, First Mes (editable directly in blocks).
*   **Dynamic Placeholders**: WorldInfo and Visitor State (simulated for preview).
*   **Toggle/Reorder**: Ability to toggle specific blocks and potentially reorder them (if supported by logic).

### 3. Visual Prompt Debugger
*   Real-time compilation of the final system prompt.
*   Visual markers showing which block contributed which line of text.
*   Integrated risk markers (warnings/blocks) next to the offending text.

### 4. Studio Aesthetics
*   "Studio/Workbench" theme: dark mode, monospaced fonts for prompt text, accent colors for different block types.
*   Micro-animations when blocks are toggled or values changed.

## Acceptance Criteria

*   [ ] New route `/prompt-editor` accessible and functional.
*   [ ] Block stack allows editing of all core character persona fields.
*   [ ] Style Dials are integrated as modular toggleable blocks.
*   [ ] Live Preview correctly compiles the system prompt in real-time.
*   [ ] Integrated risk linter shows feedback within the blocks.

## Technical Notes

*   `frontend/app/routes/prompt-editor.tsx`: Route entry point.
*   `frontend/app/product/PromptBlockEditor.jsx`: Main editor component.
*   `frontend/app/product/promptStyleDials.js`: Reuse the dial definitions and compilation logic.

## Out of Scope
*   Advanced drag-and-drop reordering for MVP (fixed logical stack for now).
*   Directly calling LLM backends for "dry run" chat inside this editor (separate task).
