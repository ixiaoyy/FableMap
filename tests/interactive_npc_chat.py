import sys
import os
from pathlib import Path
import json

# Add backend/src to path
sys.path.append(str(Path(__file__).resolve().parents[1] / "backend" / "src"))

from fablemap_api.infrastructure.env import load_env_file
from fablemap_api.core.prompt_builder import PromptBuilder, PromptBuildConfig
from fablemap_api.core.default_taverns import default_public_welfare_taverns
from fablemap_api.core.tavern import Tavern, TavernCharacter
from fablemap_api.core.llm_clients import LLMConfig, create_client

def chat_with_npc(npc_name_search, user_message):
    load_env_file()
    
    taverns_data = default_public_welfare_taverns()
    target_npc = None
    target_tavern = None
    
    for t_data in taverns_data:
        for c_data in t_data["characters"]:
            if npc_name_search in c_data["name"]:
                target_npc = TavernCharacter.from_dict(c_data)
                target_tavern = Tavern.from_dict(t_data)
                break
        if target_npc:
            break
            
    if not target_npc:
        print(f"Error: NPC '{npc_name_search}' not found.")
        return

    config = PromptBuildConfig(
        char_name=target_npc.name,
        char_description=target_npc.description,
        char_personality=target_npc.personality,
        char_scenario=target_npc.scenario,
        char_system_prompt=target_npc.system_prompt,
        char_first_mes=target_npc.first_mes,
        char_mes_example=target_npc.mes_example,
        char_gender=target_npc.gender,
        char_tags=target_npc.tags,
        char_hobbies=target_npc.hobbies,
        char_traits=target_npc.traits,
        tavern_name=target_tavern.name,
        tavern_scene_prompt=target_tavern.scene_prompt,
        user_name="旅人",
    )
    
    builder = PromptBuilder(config)
    result = builder.build([], user_message)
    
    # Configure real LLM from environment
    # Priority: Project Free Route -> Anthropic -> OpenAI
    free_backend = os.environ.get("FABLEMAP_DEFAULT_FREE_LLM_BACKEND")
    free_model = os.environ.get("FABLEMAP_DEFAULT_FREE_LLM_MODEL")
    free_base_url = os.environ.get("FABLEMAP_DEFAULT_FREE_LLM_BASE_URL")
    free_key_env = os.environ.get("FABLEMAP_DEFAULT_FREE_LLM_API_KEY_ENV", "")
    free_key = os.environ.get(free_key_env, "") if free_key_env else ""
    
    anthropic_key = os.environ.get("ANTHROPIC_API_KEY", "")
    openai_key = os.environ.get("OPENAI_API_KEY", "")

    if free_backend and free_key:
        llm_backend = free_backend
        api_key = free_key
        model = free_model or "default"
        base_url = free_base_url or ""
        print(f"(Using default project free route: {llm_backend} @ {model})")
    elif anthropic_key:
        llm_backend = "claude"
        api_key = anthropic_key
        model = "claude-3-5-sonnet-20240620"
        base_url = ""
    elif openai_key:
        llm_backend = "openai"
        api_key = openai_key
        model = "gpt-4o-mini"
        base_url = ""
    else:
        llm_backend = "rules"
        api_key = ""
        model = "default"
        base_url = ""
    
    llm_config = LLMConfig(
        backend=llm_backend,
        model=model,
        api_key=api_key,
        base_url=base_url,
        temperature=0.8,
    )
    
    if not api_key:
        print("(Warning: No OpenAI API key found, falling back to rules engine)")
        
    client = create_client(llm_config)
    response = client.complete(result["messages"])
    
    print("-" * 60)
    print(f"NPC: {target_npc.name} (Tavern: {target_tavern.name})")
    print(f"User: {user_message}")
    print("-" * 60)
    print(f"LLM RESPONSE:\n{response.content}")
    print("-" * 60)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 tests/interactive_npc_chat.py <NPC_NAME> <MESSAGE>")
    else:
        chat_with_npc(sys.argv[1], sys.argv[2])
