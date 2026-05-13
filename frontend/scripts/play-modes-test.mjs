import assert from 'node:assert/strict'

import {
  DEFAULT_GUILD_QUESTS,
  buildGuildActionPrompt,
  getGuildQuestBoard,
  getQuestRecordLabel,
  getQuestReturnHint,
  getGuildTier,
  inferTavernPlayMode,
  updateGuildProgress,
} from '../app/product/tavernPlayModes.js'
import { TAVERN_TEMPLATES } from '../app/product/tavernTemplates.js'

const guildTavern = {
  name: '街角探索清单台',
  description: '查看探索清单、领取空间委托、记录完成，获得文字纪念章和回访提示。',
  scene_prompt: '用老少皆宜的探索清单规则主持空间委托、完成记录和回访提示。',
  characters: [{ name: '领航兔·洛塔', personality: '探索清单引导员。', system_prompt: '始终给出【完成记录】【可领取清单】【回访提示】【可选行动】。', tags: ['探索清单', '空间委托'] }],
}

const mode = inferTavernPlayMode(guildTavern)
assert.ok(mode.id === 'guild' && mode.label === '探索清单' && mode.summary.includes('回访提示') && mode.prompts.some((prompt) => prompt.includes('委托')), 'guild mode should be inferred from owner-authored guild copy')
assert.equal(inferTavernPlayMode({ name: '普通柜台', bookmarks: [{ content: '模板标签：线索 / 调查 / 失物' }] }).id, 'clue_game')
assert.ok(DEFAULT_GUILD_QUESTS.length >= 3 && DEFAULT_GUILD_QUESTS.every((quest) => quest.reward > 0 && quest.familyFriendly && quest.recordLabel && quest.returnHint), 'default guild quests should stay safe and complete')
assert.deepEqual([getGuildTier(0).title, getGuildTier(6).title], ['初访记录', '线索记录'])

const acceptedProgress = updateGuildProgress(undefined, { type: 'accept', questId: 'errand-postcard' })
const acceptedQuest = getGuildQuestBoard(guildTavern, acceptedProgress).find((quest) => quest.id === 'errand-postcard')
const completedProgress = updateGuildProgress(acceptedProgress, { type: 'complete', questId: acceptedQuest.id })
assert.deepEqual(
  { accepted: acceptedProgress.acceptedQuestIds, acceptedStatus: acceptedQuest.status, completed: completedProgress.completedQuestIds.includes(acceptedQuest.id), reputation: completedProgress.reputation, repeat: updateGuildProgress(completedProgress, { type: 'complete', questId: acceptedQuest.id }).reputation },
  { accepted: ['errand-postcard'], acceptedStatus: 'accepted', completed: true, reputation: acceptedQuest.reward, repeat: completedProgress.reputation },
  'guild progress should accept, complete once, and avoid duplicate rewards',
)

const customQuest = { id: 'errand-postcard', title: '高阶同名明信片', summary: '同 ID 自定义委托应该以传入 quest 为准。', objective: '确认同名自定义委托完成点。', difficulty: '标准', reward: 7, recordLabel: '同名覆盖记录', returnHint: '显示自定义回访提示。', familyFriendly: true }
assert.deepEqual(
  { reputation: updateGuildProgress(undefined, { type: 'complete', questId: customQuest.id, quest: customQuest }).reputation, record: getQuestRecordLabel(customQuest), hint: getQuestReturnHint(customQuest) },
  { reputation: 7, record: '同名覆盖记录', hint: '显示自定义回访提示。' },
)
assert.ok(buildGuildActionPrompt('complete', acceptedQuest, getGuildTier(completedProgress.reputation)).includes('文字纪念章'))
assert.ok(buildGuildActionPrompt('post', null, getGuildTier(14)).includes('需要店主确认') && buildGuildActionPrompt('post', null, getGuildTier(14)).includes('老少皆宜'))

const guildTemplate = TAVERN_TEMPLATES.find((template) => template.id === 'adventurer-guild-counter')
assert.ok(guildTemplate && guildTemplate.tags.includes('探索清单') && guildTemplate.package.tavern.scene_prompt.includes('文字纪念章') && guildTemplate.package.world_info.some((entry) => entry.content.includes('回访提示')))
const visibleCopy = [mode.label, mode.summary, ...mode.prompts, ...DEFAULT_GUILD_QUESTS.flatMap((quest) => [quest.title, quest.summary, quest.objective, quest.recordLabel, quest.returnHint]), guildTemplate.title, guildTemplate.summary, guildTemplate.package.tavern.description, guildTemplate.package.tavern.scene_prompt, guildTemplate.package.characters[0].description, guildTemplate.package.characters[0].system_prompt, ...guildTemplate.package.world_info.map((entry) => entry.content)].join('\n')
assert.doesNotMatch(visibleCopy, /冒险工会|声望|身份奖励|身份待遇|任务板|接任务|发任务|完成任务/)

console.log('play-modes-test: ok')
