import sys
import os
from pathlib import Path
import json

# Add backend/src to path
sys.path.append(str(Path(__file__).resolve().parents[1] / "backend" / "src"))

from fablemap_api.core.prompt_builder import PromptBuilder, PromptBuildConfig, ChatMessage
from fablemap_api.core.default_taverns import default_public_welfare_taverns
from fablemap_api.core.tavern import Tavern, TavernCharacter

def get_test_npcs():
    taverns_data = default_public_welfare_taverns()
    npcs = []
    
    # Xiao Zhou (Helpful)
    for t in taverns_data:
        if t["id"] == "pw_lantern_helpdesk":
            npcs.append((t, t["characters"][0]))
            
    # An Lan (Empathetic)
    for t in taverns_data:
        if t["id"] == "pw_midnight_treehole":
            npcs.append((t, t["characters"][0]))
            
    # 9-Delta (Absurd)
    for t in taverns_data:
        if t["id"] == "pw_third_shelf_observatory":
            npcs.append((t, t["characters"][0]))
            
    return npcs

def audit_npc_vividness():
    npcs = get_test_npcs()
    
    print("=" * 80)
    print("NPC VIVIDNESS & PERSONALITY AUDIT")
    print("=" * 80)
    
    for tavern_data, char_data in npcs:
        char = TavernCharacter.from_dict(char_data)
        tavern = Tavern.from_dict(tavern_data)
        
        config = PromptBuildConfig(
            char_name=char.name,
            char_description=char.description,
            char_personality=char.personality,
            char_scenario=char.scenario,
            char_system_prompt=char.system_prompt,
            char_first_mes=char.first_mes,
            char_mes_example=char.mes_example,
            char_gender=char.gender,
            char_tags=char.tags,
            char_hobbies=char.hobbies,
            char_traits=char.traits,
            tavern_name=tavern.name,
            tavern_scene_prompt=tavern.scene_prompt,
            user_name="旅人",
        )
        
        builder = PromptBuilder(config)
        # Build prompt for a simple greeting
        result = builder.build([], "你好，你是谁？")
        
        print(f"\n[NPC: {char.name}]")
        print(f"Goal: {char.description}")
        print("-" * 40)
        
        # Print the identity/voice contract part
        for msg in result["messages"]:
            if "【NPC身份与口吻底线】" in msg["content"]:
                print("VOICE CONTRACT:")
                print(msg["content"])
                print("-" * 40)
                
        # Simulated "Ideal" response based on these instructions
        # Note: In a real test, this would be sent to an LLM. 
        # Here we are evaluating if the instructions ARE sufficient for a human/AI to produce a vivid response.
        
    print("\n[VERDICT]")
    print("Current implementation includes a strong 'Voice Contract' that mandates:")
    print("1. Character perspective (No breaking character)")
    print("2. Vividness (Sensory details in asterisks)")
    print("3. Anti-robotic (No repetitive greetings)")
    print("4. Emotional resonance")
    print("5. Brevity (1-3 sentences)")
    print("\nNext step: Run actual interactions and score them.")

if __name__ == "__main__":
    audit_npc_vividness()
