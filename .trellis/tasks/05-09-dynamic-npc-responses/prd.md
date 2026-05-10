# brainstorm: Dynamic NPC responses based on hobbies and states

## Goal

Make NPC chat responses dynamically influenced by their hobby tags and the current active StateCards in the tavern. This ensures that the conversation feels context-aware and reflects the character's personality and the ongoing narrative state.

## What I already know

* Hobbies are recently implemented as a list of strings on the `TavernCharacter` model.
* StateCards represent persistent narrative states (e.g., "It's raining", "Tavern is busy") and are stored in the `Tavern` object.
* The chat pipeline in `runtime.py` currently builds a system prompt for LLM backends but uses a very basic fallback for the `rules` backend.
* `_chat_response_text` in `runtime.py` is the main orchestration point for response generation.

## Assumptions (temporary)

* We want to support both LLM-based and rules-based dynamic responses (though LLM is higher priority).
* StateCards that are "active" should be prioritized in the prompt.
* Hobbies should influence the tone or mentioned topics.

## Open Questions

* How should we select which StateCards to include in the prompt if there are many? (Current plan: Only confirmed ones, maybe limited to the most recent 10-15 if necessary).
* For the `rules` backend, do we want full conditional logic or just placeholder injection? (Proposed: Inject a random hobby into the fallback template).

## Requirements (evolving)

* [ ] Fetch NPC hobby tags from `TavernCharacter` and include them in the LLM system prompt.
* [ ] Fetch confirmed StateCards for the tavern/visitor and include them in the LLM system prompt using `format_state_cards_for_prompt`.
* [ ] Update the `rules` backend fallback in `runtime.py` to mention a random hobby from the character's list if available.
* [ ] Ensure the prompt remains within token limits when adding these context blocks.

## Acceptance Criteria (evolving)

* [ ] In an LLM-backed tavern, the NPC mentions or acknowledges their hobbies when relevant (verified via prompt inspection or testing).
* [ ] In an LLM-backed tavern, the NPC reflects active/confirmed StateCards in their response (verified via prompt inspection or testing).
* [ ] In a rules-backed tavern, the generic fallback response varies by mentioning a random hobby.
* [ ] Smoke tests pass with the new context injection logic.

## Technical Notes

* `backend/src/fablemap_api/application/services/runtime.py`: `_chat_response_text` needs to:
    * Access `character.hobbies`.
    * Fetch confirmed state cards via `store.list_state_cards(tavern_id=tavern_id, status="confirmed")`.
    * Call `format_state_cards_for_prompt(cards)`.
    * Inject into `system_content`.
* `backend/src/fablemap_api/core/state_cards.py`: `format_state_cards_for_prompt` is already implemented but needs to be imported and used.
* `backend/src/fablemap_api/core/public_welfare_rules.py`: Could be updated to support more dynamic templates, but for now, simple injection in `runtime.py` fallback is sufficient.
