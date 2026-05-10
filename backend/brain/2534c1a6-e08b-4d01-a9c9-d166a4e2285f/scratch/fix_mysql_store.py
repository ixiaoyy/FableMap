
import os

filepath = r"d:\work\ai-\backend\src\fablemap_api\infrastructure\mysql_store.py"
with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# Replace in _to_character (already done by model probably, but let's be sure)
# wait, I already did one successful edit.

# Replace in char_model creation
target = """                    talkativeness=char.talkativeness,
                )"""
replacement = """                    talkativeness=char.talkativeness,
                    hobbies=list(char.hobbies) if char.hobbies else [],
                )"""

new_content = content.replace(target, replacement)

if new_content == content:
    print("No changes made! Target not found.")
else:
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("Success!")
