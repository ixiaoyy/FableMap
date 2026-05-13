import sys
import os
from pathlib import Path
from datetime import datetime, timezone

# Add backend/src to path
sys.path.append(str(Path(__file__).resolve().parents[1] / "backend" / "src"))

from fablemap_api.infrastructure.env import load_env_file
from fablemap_api.core.prompt_builder import PromptBuilder, PromptBuildConfig
from fablemap_api.core.default_taverns import default_public_welfare_taverns
from fablemap_api.core.tavern import Tavern, TavernCharacter
from fablemap_api.core.llm_clients import LLMConfig, create_client
from fablemap_api.core.time_context import TimeContext

def test_environmental_resonance(npc_name_search, user_message, hour=3, season="冬季", is_open=True, stage="stranger", strength=0.0):
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

    # Mock TimeContext
    mock_time = datetime(2026, 1, 15, hour, 0, 0) # Jan 15th (Winter)
    time_ctx = TimeContext(
        utc_now=mock_time.replace(tzinfo=timezone.utc),
        local_time=mock_time,
        timezone="Asia/Shanghai",
        time_display=f"{'深夜' if hour < 5 else '白天'}{hour}点00分",
        day_of_week="周三",
        is_open=is_open,
        season=season,
        local_hour=hour
    )

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
        visitor_relationship_stage=stage,
        visitor_relationship_strength=strength,
        _time_context=time_ctx
    )
    
    builder = PromptBuilder(config)
    result = builder.build([], user_message)
    
    # Configure real LLM from environment
    api_key = os.environ.get("OPENCODE_API_KEY", "")
    llm_config = LLMConfig(
        backend="custom",
        model="deepseek-v4-flash-free",
        api_key=api_key,
        base_url="https://opencode.ai/zen",
        temperature=0.8,
    )
    
    client = create_client(llm_config)
    response = client.complete(result["messages"])
    
    print("-" * 60)
    print(f"ENVIRONMENT: {time_ctx.season} | {time_ctx.time_display} | {'Open' if is_open else 'Closed'}")
    print(f"NPC: {target_npc.name} (Tavern: {target_tavern.name})")
    print(f"User: {user_message}")
    print("-" * 60)
    print(f"LLM RESPONSE:\n{response.content}")
    print("-" * 60)

if __name__ == "__main__":
    # Test 1: Late Night Winter
    print("Testing Late Night Winter Resonance...")
    test_environmental_resonance("小舟", "你好，请问这里现在提供热水吗？", hour=3, season="冬季")
