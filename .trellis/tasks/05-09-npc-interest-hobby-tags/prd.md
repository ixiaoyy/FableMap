# brainstorm: NPC Interest and Hobby Tags (Visual & Interaction Polish)

## Goal

Enhance NPC personalities and conversation depth by adding a "Visual & Interaction Polish" layer to the Hobby Tags system. The goal is to make the tags not only functional for the AI but also visually stunning and intuitive for the Tavern Owner to configure.

## What I already know

*   **Backend**: `TavernCharacter` already has a `hobbies` field. `runtime.py` already injects these into the LLM system prompt.
*   **Curated List**: Exists in `frontend/app/lib/character-hobbies.js`.
*   **Frontend**: `CharacterEditor.jsx` and `TavernChatRoom.jsx` have basic hobby support.
*   **Styling**: Basic `.hobby-chip` and `.hobby-tag` styles exist in `frontend/app/product/styles.css`.

## Requirements (Visual & Interaction Polish)

### 1. Categorized & Aesthetic Data
*   Group `CURATED_HOBBIES` into 5 meaningful categories (Arts, Tech, Nature, Adventure, Social).
*   Assign a primary color theme (HSL/Gradient) to each category.

### 2. Premium UI Components
*   **Hobby Chips**: Implement glassmorphism styles with category-specific gradients, subtle glows, and micro-animations on hover.
*   **Editor Enhancement**:
    *   Group suggestions by category for easier discovery.
    *   Smooth transitions when adding/removing tags.
*   **Chat Sidebar**:
    *   Show hobby icons with tooltips.
    *   Ensure layout is responsive and doesn't break character info.

### 3. Consistency
*   Ensure `CharacterEditor` preview matches the actual chat sidebar aesthetics.
*   Normalize terminology between `hobby-chip` and `hobby-tag` where possible.

## Acceptance Criteria

*   [ ] Hobbies are grouped into categories in `character-hobbies.js`.
*   [ ] CSS supports category-specific styles (e.g., `.hobby--tech`, `.hobby--nature`).
*   [ ] `CharacterEditor` displays suggestions in a grouped, attractive layout.
*   [ ] `TavernChatRoom` sidebar displays hobbies with improved aesthetics.
*   [ ] Build passes and mobile responsiveness is maintained.

## Technical Notes

*   `frontend/app/lib/character-hobbies.js`: Define categories and export `HOBBY_CATEGORIES`.
*   `frontend/app/product/styles.css`: Revamp hobby styles with variables.
*   `frontend/app/product/CharacterEditor.jsx`: Update `character-hobby-suggestions` to use grouping.

## Out of Scope
*   Adding new backend logic (already done).
*   Adding visitor-to-visitor hobby matching features.
