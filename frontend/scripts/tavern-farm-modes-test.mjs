import assert from 'node:assert/strict'
import {
  AVAILABLE_CROPS,
  FARM_DAILY_STEAL_LIMIT,
  FARM_NEIGHBOR_PLOTS,
  buildFarmActionPrompt,
  buildFarmActionPromptExtended,
  calculatePlanting,
  calculateFarmSale,
  calculateFarmSteal,
  claimDailyBonus,
  DAILY_LOGIN_BONUS,
  formatFarmCurrency,
  getFarmDailyKey,
  getFarmMarketRows,
  getFarmStealRows,
  getVisitorStatsFromProgress,
  normalizeFarmProgress,
  updateFarmProgress,
  updateFarmProgressExtended,
} from '../app/product/tavernFarmModes.js'

assert.ok(
  AVAILABLE_CROPS.some((crop) => crop.id === 'watermelon' && crop.anchored),
  'farm exchange should keep watermelon as the anchored market crop',
)

const empty = normalizeFarmProgress({})
assert.equal(empty.wallet, 0, 'new farm progress starts with no simulated earnings')
assert.equal(empty.plots.length, 3, 'farm progress keeps the three plot MVP')
assert.equal(empty.stealing.dailyKey, getFarmDailyKey(), 'farm progress tracks today for daily stealing limits')
assert.equal(empty.stealing.stealsUsed, 0, 'new farm progress starts with full daily stealing allowance')

const emptyPlanting = calculatePlanting(empty, 'blueberry')
assert.equal(emptyPlanting.canPlant, false, 'planting should require black-diamond seed funds')
assert.equal(emptyPlanting.reason, 'insufficient_funds')

const bonusResult = claimDailyBonus(empty)
assert.equal(bonusResult.claimed, true, 'daily bonus should be claimable once per day')
assert.equal(bonusResult.bonus, DAILY_LOGIN_BONUS)
assert.equal(bonusResult.progress.wallet, DAILY_LOGIN_BONUS, 'daily bonus adds black-diamond funds')
const repeatBonus = claimDailyBonus(bonusResult.progress)
assert.equal(repeatBonus.claimed, false, 'daily bonus cannot be claimed twice on the same day')

const fundedPlanting = calculatePlanting(bonusResult.progress, 'blueberry')
assert.equal(fundedPlanting.canPlant, true, 'daily bonus should make low-cost seeds plantable')
const afterPlant = updateFarmProgressExtended(bonusResult.progress, 'plant', { plotId: 'plot_1', cropId: 'blueberry' })
assert.equal(afterPlant.plots.find((plot) => plot.id === 'plot_1').cropId, 'blueberry', 'planting should occupy the selected plot')
assert.equal(afterPlant.wallet, DAILY_LOGIN_BONUS - fundedPlanting.seedCost, 'planting deducts seed cost from wallet')
assert.match(
  buildFarmActionPrompt('plant', { cropId: 'blueberry', planting: fundedPlanting }),
  /种子成本/,
  'plant prompt should mention seed cost after currency economy is enabled',
)

const marketRows = getFarmMarketRows({ inventory: { blueberry: 2 } })
const watermelon = marketRows.find((row) => row.cropId === 'watermelon')
assert.equal(watermelon.price, 100, 'watermelon is anchored to 1.00 black diamond')
assert.equal(watermelon.deltaLabel, '锚定', 'anchored crop should show explicit anchor label')

const progress = normalizeFarmProgress({
  inventory: { blueberry: 3, strawberry: 1 },
  wallet: 0,
})
const sale = calculateFarmSale(progress, 'blueberry', 2)
assert.equal(sale.canSell, true, 'available inventory should be sellable')
assert.equal(sale.quantity, 2)
assert.equal(sale.revenue, sale.unitPrice * 2)

const afterSale = updateFarmProgress(progress, 'sell', { cropId: 'blueberry', quantity: 2 })
assert.equal(afterSale.inventory.blueberry, 1, 'selling crops reduces inventory')
assert.equal(afterSale.inventory.strawberry, 1, 'selling one crop preserves other inventory')
assert.equal(afterSale.wallet, sale.revenue, 'selling crops adds simulated black-diamond earnings')
assert.equal(getVisitorStatsFromProgress(afterSale).totalEarnings, sale.revenue, 'selling crops updates local earnings stats')

const emptySale = calculateFarmSale(afterSale, 'watermelon', 1)
assert.equal(emptySale.canSell, false, 'empty inventory cannot be sold')
const afterEmptySale = updateFarmProgress(afterSale, 'sell', { cropId: 'watermelon', quantity: 1 })
assert.equal(afterEmptySale.wallet, afterSale.wallet, 'empty sale should not change earnings')
assert.deepEqual(afterEmptySale.inventory, afterSale.inventory, 'empty sale should not change inventory')

assert.equal(formatFarmCurrency(100), '1.00 黑钻')
assert.match(
  buildFarmActionPrompt('sell', { sale }),
  /收益/,
  'sell prompt should let the NPC housekeeper broadcast the transaction revenue',
)
assert.match(
  buildFarmActionPrompt('market'),
  /西瓜锚定/,
  'market prompt should include deterministic exchange quotes',
)

assert.equal(FARM_DAILY_STEAL_LIMIT, 3, 'garden tavern MVP should cap stealing to three daily attempts')
assert.ok(FARM_NEIGHBOR_PLOTS.length > FARM_DAILY_STEAL_LIMIT, 'neighbor plots need enough targets to verify daily limit')

const stealRows = getFarmStealRows(empty)
assert.equal(stealRows[0].canSteal, true, 'fresh daily stealing row should be available')
assert.equal(stealRows[0].stealsRemaining, FARM_DAILY_STEAL_LIMIT)

const firstTheft = calculateFarmSteal(empty, FARM_NEIGHBOR_PLOTS[0].id)
assert.equal(firstTheft.canSteal, true, 'mature neighbor crop should be stealable')
assert.equal(firstTheft.quantity, 1)

const afterSteal = updateFarmProgress(empty, 'steal', { plotId: FARM_NEIGHBOR_PLOTS[0].id })
assert.equal(afterSteal.inventory[firstTheft.crop.id], 1, 'successful stealing adds the crop to private inventory')
assert.equal(afterSteal.stealing.stealsUsed, 1, 'successful stealing consumes one daily attempt')

const repeatTheft = calculateFarmSteal(afterSteal, FARM_NEIGHBOR_PLOTS[0].id)
assert.equal(repeatTheft.canSteal, false, 'same neighbor plot cannot be stolen twice in one day')
assert.equal(repeatTheft.reason, 'already_stolen')

let limitProgress = empty
for (const plot of FARM_NEIGHBOR_PLOTS.slice(0, FARM_DAILY_STEAL_LIMIT)) {
  limitProgress = updateFarmProgress(limitProgress, 'steal', { plotId: plot.id })
}
const overLimit = calculateFarmSteal(limitProgress, FARM_NEIGHBOR_PLOTS[FARM_DAILY_STEAL_LIMIT].id)
assert.equal(overLimit.canSteal, false, 'daily stealing limit should disable further neighbor targets')
assert.equal(overLimit.reason, 'daily_limit')

assert.match(
  buildFarmActionPrompt('steal', { theft: firstTheft }),
  /被摘的访客会收到管家通知/,
  'steal prompt should include NPC notification boundary for the affected visitor',
)

assert.match(
  buildFarmActionPromptExtended('daily-bonus', null, empty),
  /每日登录奖励/,
  'daily bonus prompt should stay in farm housekeeper framing',
)
assert.match(
  buildFarmActionPromptExtended('rank', { metric: 'totalEarnings' }, afterSale),
  /本酒馆/,
  'rank prompt should frame ranking as tavern-local, not cross-tavern competition',
)

console.log('tavern-farm-modes-test: ok')
