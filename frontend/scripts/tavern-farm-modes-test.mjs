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

assert.ok(AVAILABLE_CROPS.some((crop) => crop.id === 'watermelon' && crop.anchored), 'farm exchange should keep watermelon as the anchored market crop')

const empty = normalizeFarmProgress({})
assert.deepEqual(
  { wallet: empty.wallet, plots: empty.plots.length, dailyKey: empty.stealing.dailyKey, stealsUsed: empty.stealing.stealsUsed },
  { wallet: 0, plots: 3, dailyKey: getFarmDailyKey(), stealsUsed: 0 },
  'new farm progress should keep MVP defaults',
)
assert.deepEqual(
  { canPlant: calculatePlanting(empty, 'blueberry').canPlant, reason: calculatePlanting(empty, 'blueberry').reason },
  { canPlant: false, reason: 'insufficient_funds' },
  'planting should require seed funds',
)

const bonusResult = claimDailyBonus(empty)
assert.deepEqual(
  { claimed: bonusResult.claimed, bonus: bonusResult.bonus, wallet: bonusResult.progress.wallet, repeatClaimed: claimDailyBonus(bonusResult.progress).claimed },
  { claimed: true, bonus: DAILY_LOGIN_BONUS, wallet: DAILY_LOGIN_BONUS, repeatClaimed: false },
  'daily bonus should be claimable once per day',
)

const fundedPlanting = calculatePlanting(bonusResult.progress, 'blueberry')
const afterPlant = updateFarmProgressExtended(bonusResult.progress, 'plant', { plotId: 'plot_1', cropId: 'blueberry' })
assert.deepEqual(
  { canPlant: fundedPlanting.canPlant, cropId: afterPlant.plots.find((plot) => plot.id === 'plot_1').cropId, wallet: afterPlant.wallet },
  { canPlant: true, cropId: 'blueberry', wallet: DAILY_LOGIN_BONUS - fundedPlanting.seedCost },
  'planting should occupy a plot and deduct seed cost',
)

const watermelon = getFarmMarketRows({ inventory: { blueberry: 2 } }).find((row) => row.cropId === 'watermelon')
assert.deepEqual({ price: watermelon.price, deltaLabel: watermelon.deltaLabel }, { price: 100, deltaLabel: '锚定' }, 'watermelon should stay anchored to 1.00 black diamond')

const progress = normalizeFarmProgress({ inventory: { blueberry: 3, strawberry: 1 }, wallet: 0 })
const sale = calculateFarmSale(progress, 'blueberry', 2)
const afterSale = updateFarmProgress(progress, 'sell', { cropId: 'blueberry', quantity: 2 })
assert.deepEqual(
  { canSell: sale.canSell, quantity: sale.quantity, blueberry: afterSale.inventory.blueberry, strawberry: afterSale.inventory.strawberry, wallet: afterSale.wallet, earnings: getVisitorStatsFromProgress(afterSale).totalEarnings },
  { canSell: true, quantity: 2, blueberry: 1, strawberry: 1, wallet: sale.revenue, earnings: sale.revenue },
  'selling crops should reduce inventory and update local earnings',
)
const afterEmptySale = updateFarmProgress(afterSale, 'sell', { cropId: 'watermelon', quantity: 1 })
assert.deepEqual({ wallet: afterEmptySale.wallet, inventory: afterEmptySale.inventory }, { wallet: afterSale.wallet, inventory: afterSale.inventory }, 'empty sale should be a no-op')
assert.equal(formatFarmCurrency(100), '1.00 黑钻')

assert.equal(FARM_DAILY_STEAL_LIMIT, 3, 'garden tavern MVP should cap stealing to three daily attempts')
assert.ok(FARM_NEIGHBOR_PLOTS.length > FARM_DAILY_STEAL_LIMIT, 'neighbor plots need enough targets to verify daily limit')
const firstTheft = calculateFarmSteal(empty, FARM_NEIGHBOR_PLOTS[0].id)
const afterSteal = updateFarmProgress(empty, 'steal', { plotId: FARM_NEIGHBOR_PLOTS[0].id })
assert.deepEqual(
  { rowAvailable: getFarmStealRows(empty)[0].canSteal, canSteal: firstTheft.canSteal, quantity: firstTheft.quantity, inventory: afterSteal.inventory[firstTheft.crop.id], stealsUsed: afterSteal.stealing.stealsUsed },
  { rowAvailable: true, canSteal: true, quantity: 1, inventory: 1, stealsUsed: 1 },
  'successful stealing should add one crop and consume one daily attempt',
)
assert.equal(calculateFarmSteal(afterSteal, FARM_NEIGHBOR_PLOTS[0].id).reason, 'already_stolen')
let limitProgress = empty
for (const plot of FARM_NEIGHBOR_PLOTS.slice(0, FARM_DAILY_STEAL_LIMIT)) {
  limitProgress = updateFarmProgress(limitProgress, 'steal', { plotId: plot.id })
}
assert.equal(calculateFarmSteal(limitProgress, FARM_NEIGHBOR_PLOTS[FARM_DAILY_STEAL_LIMIT].id).reason, 'daily_limit')

assert.ok(buildFarmActionPrompt('plant', { cropId: 'blueberry', planting: fundedPlanting }).includes('种子成本'))
assert.ok(buildFarmActionPrompt('sell', { sale }).includes('收益') && buildFarmActionPrompt('market').includes('西瓜锚定'))
assert.ok(buildFarmActionPrompt('steal', { theft: firstTheft }).includes('被摘的访客会收到管家通知'))
assert.ok(buildFarmActionPromptExtended('daily-bonus', null, empty).includes('每日登录奖励'))
assert.ok(buildFarmActionPromptExtended('rank', { metric: 'totalEarnings' }, afterSale).includes('本酒馆'))

console.log('tavern-farm-modes-test: ok')
