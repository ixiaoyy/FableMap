import assert from 'node:assert/strict'

import { createTavernDraftRequest, draftResponseToCreateForm } from '../app/lib/tavern-drafts.js'

const request = createTavernDraftRequest({
  lat: '31.2304',
  lon: '121.4737',
  address: ' 上海 · 外滩 ',
  placeType: 'cafe',
  styleTagsText: '雨夜, 霓虹，安静',
  forbiddenText: '现实名人, 暴力',
  tone: ' 温暖一点 ',
})

assert.deepEqual(request, {
  lat: 31.2304,
  lon: 121.4737,
  address: '上海 · 外滩',
  place_type: 'cafe',
  style_tags: ['雨夜', '霓虹', '安静'],
  forbidden: ['现实名人', '暴力'],
  tone: '温暖一点',
})

const form = draftResponseToCreateForm({
  draft: {
    name: '外滩雨灯空间',
    description: '江风边的小空间。',
    scene_prompt: '雨后霓虹。',
    character: {
      name: '灯叔',
      description: '夜班招待。',
      first_mes: '伞先放门口。',
    },
  },
})

assert.equal(form.name, '外滩雨灯空间')
assert.equal(form.description, '江风边的小空间。')
assert.equal(form.scene_prompt, '雨后霓虹。')
assert.equal(form.character_name, '灯叔')
assert.equal(form.character_description, '夜班招待。')
assert.equal(form.first_mes, '伞先放门口。')

assert.throws(() => draftResponseToCreateForm({}), /AI 空间草稿返回为空/)
console.log('AI tavern draft helpers ok')
