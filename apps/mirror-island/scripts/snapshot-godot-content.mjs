import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createWorldCatalog } from '../client/src/game/world/tiled-region-decoder.ts';
import { createInitialGameState } from '../domain/state/game-state.ts';
import { ITEM_DEFINITIONS } from '../domain/items/definitions.ts';
import { CROP_DEFINITIONS, sellPriceForItem } from '../domain/farming/crops.ts';
import { RECIPE_DEFINITIONS } from '../domain/recipes/definitions.ts';
import { FISH_DEFINITIONS } from '../domain/fishing/definitions.ts';
import { NPC_DIALOGUE_PROFILES, RETENTION_EVENT_IDS } from '../domain/dialogue/definitions.ts';
import { DAILY_REQUESTS } from '../domain/requests/definitions.ts';
import { FIRST_WEEK_MILESTONES } from '../domain/retention/FirstWeekMilestoneSystem.ts';
import { activeNpcSpawns, npcRestDay } from '../domain/world/npc-schedules.ts';
import { npcActivityAt } from '../domain/world/npc-activities.ts';
import { resolveCarpenterSchedule } from '../domain/building/carpenter-schedule.ts';
import { giftPreference } from '../domain/social/GiftSystem.ts';
import { getDialogueDefinition } from '../client/src/game/dialogue/definitions.ts';
import { itemIconForItem, seedBadgeForItem } from '../client/src/game/assets/item-icons.ts';
import { entityMediaForRegion, VECTORAITH_MEDIA_URLS } from '../client/src/game/assets/visual-profile.ts';
import { petMediaProfile, PET_MEDIA_URLS } from '../client/src/game/assets/pet-media.ts';
import { PET_ANCHOR_IDS } from '../domain/pets/definitions.ts';
import { daylightVisualAt } from '../client/src/game/presentation/daylight.ts';
import { FOOTSTEP_ASSETS, ONE_SHOT_ASSETS, ambientLayersForGroup } from '../client/src/audio/audio-catalog.ts';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = path.join(app, 'godot/data');
await mkdir(directory, { recursive: true });
const { regions } = JSON.parse(await readFile(path.join(app, 'godot/generated/catalog.json'), 'utf8'));
const catalog = createWorldCatalog(regions);
const items = Object.values(ITEM_DEFINITIONS);
const profiles = NPC_DIALOGUE_PROFILES;
const schedules = {};
// 将重复的星期/天气日程压成变化点；运行时无需执行原 TypeScript。
for (let day = 1; day <= 7; day++) for (const weather of ['sunny', 'rain', 'wind']) {
  const segments = [];
  let previous = '';
  for (let minute = 360; minute <= 1560; minute += 10) {
    const npcs = activeNpcSpawns(catalog, minute, { day, weather }).map(npc => {
      const activity = npcActivityAt(catalog,npc.npcId,minute,{day,weather});
      return {...npc, activityPlan: activity?.regionId === npc.regionId && (npc.npcId==='town-resident-mozi' || !['rain','rest'].includes(npc.routine)) ? activity : null};
    });
    const carpenter = resolveCarpenterSchedule(minute,{day,weather});
    const value = JSON.stringify({npcs,carpenter});
    if (value !== previous) segments.push({ minute, npcs, carpenter });
    previous = value;
  }
  schedules[`${day}:${weather}`] = segments;
}
const dialogueIds = new Set(regions.flatMap(region => region.interactions.map(item => item.dialogueId).filter(Boolean)));
for (const profile of profiles) {
  dialogueIds.add(profile.baseDialogueId);
  for (const phase of ['morning','day','evening','night']) for (const index of [0,1]) dialogueIds.add(`activity:${profile.npcId}:${phase}:${index}`);
  for (const index of [0,1,2]) dialogueIds.add(`personality:${profile.npcId}:${index}`);
  for (const kind of ['rain','rest']) dialogueIds.add(`routine:${profile.npcId}:${kind}`);
  for (const stage of ['familiar','friendly']) dialogueIds.add(`relationship:${profile.npcId}:${stage}`);
}
for (const request of DAILY_REQUESTS) for (const status of ['missing','thanks']) dialogueIds.add(`request:${request.requestId}:${status}`);
for (const event of RETENTION_EVENT_IDS) dialogueIds.add(`event:${event}`);
const dialogues = {};
for (const id of dialogueIds) {
  const dialogue = getDialogueDefinition(id);
  if (dialogue) dialogues[id] = dialogue;
}
const rules = {
  sourceVersion: 13,
  initial: createInitialGameState(catalog),
  items: ITEM_DEFINITIONS, crops: CROP_DEFINITIONS, recipes: RECIPE_DEFINITIONS,
  prices: Object.fromEntries(items.map(item => [item.id, sellPriceForItem(item.id)])),
  fish: FISH_DEFINITIONS, profiles, requests: DAILY_REQUESTS, milestones: FIRST_WEEK_MILESTONES,
  events: RETENTION_EVENT_IDS, petAnchors: PET_ANCHOR_IDS,
  giftPreferences: Object.fromEntries(profiles.map(profile => [profile.npcId, Object.fromEntries(items.map(item => [item.id, giftPreference(profile.npcId,item.id)]))])),
  restDays: Object.fromEntries(profiles.map(profile => [profile.npcId,npcRestDay(profile.npcId)])),
};
const media = {
  daylight: Object.fromEntries(['farm','cottage'].map(region=>[region,Object.fromEntries(Array.from({length:121},(_,index)=>{const minute=360+index*10;return [minute,daylightVisualAt(minute,region)];}))])),
  items: Object.fromEntries(items.map(item => [item.id, itemIconForItem(item.id)])),
  badges: Object.fromEntries(items.map(item => [item.id, seedBadgeForItem(item.id)])),
  regions: Object.fromEntries(regions.map(region => [region.id, entityMediaForRegion(region.id)])),
  textures: VECTORAITH_MEDIA_URLS,
  pets: {cat: petMediaProfile('cat'), dog: petMediaProfile('dog')}, petTextures: PET_MEDIA_URLS,
  footsteps: FOOTSTEP_ASSETS, cues: ONE_SHOT_ASSETS,
  ambience: Object.fromEntries(['farm','town','lakeshore','interior'].map(group => [group,ambientLayersForGroup(group)])),
};
for (const [name, value] of Object.entries({rules,schedules,dialogues,media})) {
  const serialized = JSON.stringify(value, null, 2) + '\n';
  await writeFile(path.join(directory, `${name}.json`), serialized);
  console.log(`${name}: ${Buffer.byteLength(serialized)} bytes ${createHash('sha256').update(serialized).digest('hex')}`);
}
