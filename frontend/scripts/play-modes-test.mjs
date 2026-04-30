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
  description: '查看探索清单、领取酒馆委托、记录完成，获得文字纪念章和回访提示。',
  scene_prompt: '用老少皆宜的探索清单规则主持酒馆委托、完成记录和回访提示。',
  characters: [
    {
      name: '洛塔',
      personality: '探索清单引导员，会登记委托和提醒回访提示。',
      system_prompt: '始终给出【完成记录】【可领取清单】【回访提示】【可选行动】。',
      tags: ['探索清单', '酒馆委托'],
    },
  ],
}

const mode = inferTavernPlayMode(guildTavern)
assert.equal(mode.id, 'guild')
assert.equal(mode.label, '探索清单')
assert.ok(mode.summary.includes('回访提示'))
assert.ok(mode.prompts.some((prompt) => prompt.includes('委托')))

const bookmarkMode = inferTavernPlayMode({
  name: '普通柜台',
  bookmarks: [{ content: '模板标签：线索 / 调查 / 失物' }],
})
assert.equal(bookmarkMode.id, 'clue_game')

assert.ok(DEFAULT_GUILD_QUESTS.length >= 3)
assert.ok(DEFAULT_GUILD_QUESTS.every((quest) => quest.reward > 0))
assert.ok(DEFAULT_GUILD_QUESTS.every((quest) => quest.familyFriendly === true))
assert.ok(DEFAULT_GUILD_QUESTS.every((quest) => quest.recordLabel && quest.returnHint))

assert.equal(getGuildTier(0).title, '初访记录')
assert.equal(getGuildTier(6).title, '线索记录')

const acceptedProgress = updateGuildProgress(undefined, {
  type: 'accept',
  questId: 'errand-postcard',
})
assert.deepEqual(acceptedProgress.acceptedQuestIds, ['errand-postcard'])
assert.deepEqual(acceptedProgress.completedQuestIds, [])
assert.equal(acceptedProgress.reputation, 0)

const board = getGuildQuestBoard(guildTavern, acceptedProgress)
const acceptedQuest = board.find((quest) => quest.id === 'errand-postcard')
assert.equal(acceptedQuest.status, 'accepted')

const completedProgress = updateGuildProgress(acceptedProgress, {
  type: 'complete',
  questId: acceptedQuest.id,
})
assert.ok(completedProgress.completedQuestIds.includes(acceptedQuest.id))
assert.equal(completedProgress.reputation, acceptedQuest.reward)

const completedAgain = updateGuildProgress(completedProgress, {
  type: 'complete',
  questId: acceptedQuest.id,
})
assert.equal(completedAgain.reputation, completedProgress.reputation)

const customQuest = {
  id: 'errand-postcard',
  title: '高阶同名明信片',
  summary: '同 ID 自定义委托应该以传入 quest 为准。',
  objective: '确认同名自定义委托完成点。',
  difficulty: '标准',
  reward: 7,
  recordLabel: '同名覆盖记录',
  returnHint: '显示自定义回访提示。',
  familyFriendly: true,
}
const customCompletedProgress = updateGuildProgress(undefined, {
  type: 'complete',
  questId: customQuest.id,
  quest: customQuest,
})
assert.equal(customCompletedProgress.reputation, 7)
assert.equal(getQuestRecordLabel(customQuest), '同名覆盖记录')
assert.equal(getQuestReturnHint(customQuest), '显示自定义回访提示。')

const prompt = buildGuildActionPrompt('complete', acceptedQuest, getGuildTier(completedProgress.reputation))
assert.ok(prompt.includes('记录完成探索清单'))
assert.ok(prompt.includes('文字纪念章'))
assert.ok(prompt.includes(acceptedQuest.title))

const postPrompt = buildGuildActionPrompt('post', null, getGuildTier(14))
assert.ok(postPrompt.includes('友善酒馆委托草稿'))
assert.ok(postPrompt.includes('需要店主确认'))
assert.ok(postPrompt.includes('老少皆宜'))

const guildTemplate = TAVERN_TEMPLATES.find((template) => template.id === 'adventurer-guild-counter')
assert.ok(guildTemplate)
assert.ok(guildTemplate.tags.includes('探索清单'))
assert.ok(guildTemplate.package.tavern.scene_prompt.includes('文字纪念章'))
assert.ok(guildTemplate.package.characters[0].system_prompt.includes('可领取清单'))
assert.ok(guildTemplate.package.world_info.some((entry) => entry.content.includes('回访提示')))

const visibleCopy = [
  mode.label,
  mode.summary,
  ...mode.prompts,
  ...DEFAULT_GUILD_QUESTS.flatMap((quest) => [
    quest.title,
    quest.summary,
    quest.objective,
    quest.recordLabel,
    quest.returnHint,
  ]),
  guildTemplate.title,
  guildTemplate.summary,
  guildTemplate.package.tavern.description,
  guildTemplate.package.tavern.scene_prompt,
  guildTemplate.package.characters[0].description,
  guildTemplate.package.characters[0].system_prompt,
  ...guildTemplate.package.world_info.map((entry) => entry.content),
].join('\n')

assert.doesNotMatch(visibleCopy, /冒险工会|声望|身份奖励|身份待遇|任务板|接任务|发任务|完成任务/)

console.log('play-modes-test: ok')
