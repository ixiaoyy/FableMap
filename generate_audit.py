# -*- coding: utf-8 -*-
import json
import os
from collections import Counter

def count_tasks(directory, include_archive=False):
    statuses = Counter()
    phases = Counter()
    priorities = Counter()
    review_tasks = []
    completed_tasks = []
    total = 0

    for root, dirs, files in os.walk(directory):
        # Skip archive unless requested
        if not include_archive and 'archive' in root:
            continue
        if 'task.json' in files:
            path = os.path.join(root, 'task.json')
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    task = json.load(f)
                    status = task.get('status', 'unknown')
                    phase = task.get('current_phase', 0)
                    priority = task.get('priority', 'P3')
                    statuses[status] += 1
                    phases[phase] += 1
                    priorities[priority] += 1
                    total += 1
                    if status == 'review':
                        review_tasks.append(task.get('id'))
                    if status == 'completed':
                        completed_tasks.append(task.get('id'))
            except Exception as e:
                pass
    return statuses, phases, priorities, review_tasks, completed_tasks, total

# Analyze active tasks
active_dir = '.trellis/tasks'
statuses, phases, priorities, review_tasks, completed_tasks, total = count_tasks(active_dir)

print(f"=== FableMap 项目审计报告 ===")
print(f"生成时间: 2026-04-30")
print()
print(f"## 任务概览")
print(f"| 类别 | 数量 |")
print(f"|------|------|")
print(f"| 活跃任务 | {total} |")
print()
print(f"### 活跃任务状态分布")
for s, c in statuses.most_common():
    pct = c * 100 // total if total > 0 else 0
    print(f"- {s}: **{c}** ({pct}%)")
print()
print(f"### 活跃任务优先级分布")
for p, c in sorted(priorities.items()):
    pct = c * 100 // total if total > 0 else 0
    print(f"- {p}: **{c}** ({pct}%)")
print()
print(f"### 活跃任务阶段分布")
for p, c in sorted(phases.items()):
    pct = c * 100 // total if total > 0 else 0
    print(f"- Phase {p}: **{c}** ({pct}%)")
print()
print(f"### Review 状态任务")
if review_tasks:
    for t in review_tasks:
        print(f"- {t}")
else:
    print("无 (所有 review 任务已处理)")
print()
print(f"### Completed 状态任务")
if completed_tasks:
    print(f"共 {len(completed_tasks)} 个已完成任务")
else:
    print("无")
