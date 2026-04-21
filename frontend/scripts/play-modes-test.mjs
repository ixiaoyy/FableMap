import assert from 'node:assert/strict'

import {
  DEFAULT_GUILD_QUESTS,
  buildGuildActionPrompt,
  getGuildQuestBoard,
  getGuildTier,
  inferTavernPlayMode,
  updateGuildProgress,
} from '../src/tavernPlayModes.js'
import { TAVERN_TEMPLATES } from '../src/tavernTemplates.js'

const guildTavern = {
  name: '街角冒险者公会',
  description: '发任务、接任务、完成委托，获得身份奖励和酒馆内不同待遇。',
  scene_prompt: '用老少皆宜的冒险工会规则主持任务板、声望和身份。',
  characters: [
    {
      name: '洛塔',
      personality: '冒险工会接待员，会登记委托和提醒身份待遇。',
      system_prompt: '始终给出【身份】【可接委托】【当前待遇】【可选行动】。',
      tags: ['冒险工会', '任务板'],
    },
  ],
}

const mode = inferTavernPlayMode(guildTavern)
assert.equal(mode.id, 'guild')
assert.equal(mode.label, '冒险工会')
assert.ok(mode.summary.includes('身份'))
assert.ok(mode.prompts.some((prompt) => prompt.includes('委托')))

const bookmarkMode = inferTavernPlayMode({
  name: '普通柜台',
  bookmarks: [{ content: '模板标签：线索 / 调查 / 失物' }],
})
assert.equal(bookmarkMode.id, 'clue_game')

assert.ok(DEFAULT_GUILD_QUESTS.length >= 3)
assert.ok(DEFAULT_GUILD_QUESTS.every((quest) => quest.reward > 0))
assert.ok(DEFAULT_GUILD_QUESTS.every((quest) => quest.familyFriendly === true))

assert.equal(getGuildTier(0).title, '新人旅人')
assert.equal(getGuildTier(6).title, '正式冒险者')

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
  objective: '确认同名自定义委托奖励。',
  difficulty: '标准',
  reward: 7,
  identityReward: '同名覆盖测试员',
  treatment: '显示自定义奖励。',
  familyFriendly: true,
}
const customCompletedProgress = updateGuildProgress(undefined, {
  type: 'complete',
  questId: customQuest.id,
  quest: customQuest,
})
assert.equal(customCompletedProgress.reputation, 7)

const prompt = buildGuildActionPrompt('complete', acceptedQuest, getGuildTier(completedProgress.reputation))
assert.ok(prompt.includes('提交委托'))
assert.ok(prompt.includes('身份待遇'))
assert.ok(prompt.includes(acceptedQuest.title))

const postPrompt = buildGuildActionPrompt('post', null, getGuildTier(14))
assert.ok(postPrompt.includes('发布友善委托'))
assert.ok(postPrompt.includes('老少皆宜'))

const guildTemplate = TAVERN_TEMPLATES.find((template) => template.id === 'adventurer-guild-counter')
assert.ok(guildTemplate)
assert.ok(guildTemplate.tags.includes('冒险工会'))
assert.ok(guildTemplate.package.tavern.scene_prompt.includes('身份待遇'))
assert.ok(guildTemplate.package.characters[0].system_prompt.includes('可接委托'))
assert.ok(guildTemplate.package.world_info.some((entry) => entry.content.includes('声望')))

console.log('play-modes-test: ok')
