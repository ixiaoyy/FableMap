# NPC Dynamic Responses Guidelines

> 规范 NPC 基于爱好（Hobbies）和状态卡（StateCards）的动态回复生成逻辑。

---

## 核心机制

FableMap 的 NPC 回复分为 **LLM 模式** 和 **规则模式** (Rules Backend)，两者均需感知角色的个性化背景。

### 1. 爱好字典 (Hobby Taxonomy)
为了确保 Prompt 的一致性和规则回复的可读性，系统维护了一套精选爱好字典：
- **文件路径**: `backend/src/fablemap_api/core/hobbies.py`
- **内容**: 包含爱好分类、显示名称 (Label) 和 Prompt 提示语 (Hint)。
- **规范**: 
  - 角色模型中的 `hobbies` 字段存储 Hobby ID 或自由文本。
  - 使用 `get_hobby_label(id)` 获取显示名。
  - 使用 `get_hobby_prompt_hint(id)` 获取用于 LLM 注入的性格描述。

### 2. LLM Prompt 注入
在构建系统 Prompt 时，爱好和状态卡通过以下方式注入：
- **Hobbies**: 注入到 `char_info` 层。除了爱好名称，还应包含对应的 `prompt_hint`，引导模型将爱好融入语气或比喻中。
- **StateCards**: 注入到 `result_messages` 层级（或专门的状态层）。仅注入状态为 `confirmed` 且在当前范围（Tavern 或 Visitor 专属）内的卡片。

### 3. 规则后端 (Rules Backend) Fallback
当没有特定规则匹配时，规则后端应使用动态模板生成带有上下文感的回复：
- **Hobbies 感知**: 从角色爱好中随机选择一个，并使用其显示名称。
- **StateCards 感知**: 若存在确认的状态卡，回复中应包含对最新状态卡的提及（如：“并留意到了关于‘XX’的动态”）。
- **模板示例**: `{character_name}停下了手中关于{hobby_label}的动作，并留意到了关于“{card_title}”的动态，抬头看向你...`

---

## 开发约束

1. **禁止硬编码**: 不要在 `runtime.py` 中直接写死具体的爱好名称，优先引用 `hobbies.py` 中的字典。
2. **状态卡过滤**: 必须严格检查状态卡的 `status == "confirmed"`。
3. **性能**: 对注入的状态卡进行数量限制（当前上限为 10），并按 `updated_at` 逆序排序，确保最新信息被优先处理。

---

## 验证要求

- **LLM 模式**: 通过 `test_character_hobbies_injection_in_runtime` 验证 Prompt 中是否包含爱好和提示语。
- **规则模式**: 通过 `test_rules_backend_hobby_injection` 和 `test_rules_backend_state_card_awareness` 验证回复中是否正确提到了爱好名和状态卡标题。
