import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createWorldCatalog} from '../client/src/game/world/tiled-region-decoder.ts';
import {createInitialGameState} from '../domain/state/game-state.ts';
import {InventorySystem} from '../domain/inventory/InventorySystem.ts';
import {StaminaSystem} from '../domain/stamina/StaminaSystem.ts';
import {FarmingSystem} from '../domain/farming/FarmingSystem.ts';
import {GatheringSystem} from '../domain/gathering/GatheringSystem.ts';
import {MiningSystem} from '../domain/mining/MiningSystem.ts';
import {WeedCuttingSystem} from '../domain/gathering/WeedCuttingSystem.ts';
import {ShippingSystem} from '../domain/shipping/ShippingSystem.ts';
import {StorageCommandSystem} from '../domain/session/storage-commands.ts';
import {GiftSystem} from '../domain/social/GiftSystem.ts';
import {FriendshipSystem} from '../domain/social/FriendshipSystem.ts';
import {DailyRequestSystem} from '../domain/requests/DailyRequestSystem.ts';
import {NpcDialogueSystem} from '../domain/dialogue/NpcDialogueSystem.ts';
import {activeNpcSpawns} from '../domain/world/npc-schedules.ts';
import {stableHash} from '../domain/weather/WeatherSystem.ts';
import {WorldOccupancySystem} from '../domain/world/WorldOccupancySystem.ts';
import {FishingSystem} from '../domain/fishing/FishingSystem.ts';

const catalog=createWorldCatalog(JSON.parse(await readFile('godot/generated/catalog.json','utf8')).regions);
const inventory=new InventorySystem(); const stamina=new StaminaSystem(inventory);
const farming=new FarmingSystem(inventory,stamina,catalog); const gathering=new GatheringSystem(inventory,catalog,stamina);
const mining=new MiningSystem(inventory,stamina,catalog); const weeds=new WeedCuttingSystem(inventory,catalog);
const shipping=new ShippingSystem(inventory); const storage=new StorageCommandSystem(catalog,inventory);
const friendship=new FriendshipSystem(); const requests=new DailyRequestSystem(inventory,friendship); const dialogue=new NpcDialogueSystem();
const cases=[];
/** 记录一个旧规则执行前后的独立快照，供 GDScript 逐项比较；只在内存操作。 */
function record(name,kind,state,args,operation){const before=structuredClone(state); operation(state); cases.push({name,kind,before,args,after:structuredClone(state)});}
let state=createInitialGameState(catalog);
inventory.add(state.inventory,'wood',51);
record('半组向上取整','storage',state,{type:'move-inventory',sourceIndex:5,targetIndex:6,amount:'half'},s=>storage.apply(s,[],{type:'move-inventory',sourceIndex:5,targetIndex:6,amount:'half'}));
record('单件交换不同物品失败','storage',state,{type:'move-inventory',sourceIndex:5,targetIndex:0,amount:'one'},s=>storage.apply(s,[],{type:'move-inventory',sourceIndex:5,targetIndex:0,amount:'one'}));
record('整理保持工具槽','storage',state,{type:'sort-inventory'},s=>storage.apply(s,[],{type:'sort-inventory'}));
record('制作木斧','storage',state,{type:'craft-item',recipeId:'wooden-axe',quantity:1,targetIndex:8},s=>storage.apply(s,[],{type:'craft-item',recipeId:'wooden-axe',quantity:1,targetIndex:8}));
record('制作失败不扣材料','storage',state,{type:'craft-item',recipeId:'chest',quantity:1,targetIndex:0},s=>storage.apply(s,[],{type:'craft-item',recipeId:'chest',quantity:1,targetIndex:0}));
state=createInitialGameState(catalog); inventory.add(state.inventory,'turnip-seed',3);
const region=catalog.requireRegion('farm'); const cell=region.tillableTiles.findIndex((on,index)=>on&&!region.resources.some(r=>Math.floor(r.x/16)===index%region.collision.columns&&Math.floor(r.y/16)===Math.floor(index/region.collision.columns)));
const column=cell%region.collision.columns,row=Math.floor(cell/region.collision.columns); state.player.x=column*16+8;state.player.y=(row+1)*16+8;
for(const [name,item] of [['锄地','hoe'],['播种','turnip-seed'],['浇水','watering-can'],['重复浇水不扣体力','watering-can']])record(name,'farm',state,{column,row,item,facing:'up'},s=>farming.use(s,column,row,item,'up'));
for(let day=0;day<3;day++){record('作物日结'+day,'crop-day',state,{},s=>farming.settleDay(s));state.day++;farming.applyRain(state);}
record('萝卜收获','farm',state,{column,row,item:'',facing:'up'},s=>farming.use(s,column,row,''));
state=createInitialGameState(catalog);
for(const kind of ['tree','stone','weed']){
 const spawn=catalog.allRegions().flatMap(r=>r.resources).find(r=>r.kind===kind); state.player.regionId=spawn.regionId;state.player.x=spawn.x;state.player.y=spawn.y+16;
 const tool={tree:'axe',stone:'pickaxe',weed:'scythe'}[kind];const service={tree:gathering,stone:mining,weed:weeds}[kind];
 record(kind+'产出','gather',state,{id:spawn.entityId,item:tool,facing:'up'},s=>service.use(s,spawn.entityId,tool,'up'));
}
state=createInitialGameState(catalog); inventory.add(state.inventory,'turnip',3);
record('投入出货','shipping-deposit',state,{index:5},s=>shipping.deposit(s,5,'stack'));
record('取回最后一笔','shipping-reclaim',state,{},s=>shipping.reclaim(s));
shipping.deposit(state,5,'stack'); record('隔夜出货汇总','shipping-settle',state,{},s=>shipping.settle(s));
state=createInitialGameState(catalog);
const npc=activeNpcSpawns(catalog,state.minuteOfDay,{day:state.day,weather:state.weather.current}).find(n=>n.npcId==='seed-keeper');state.player={...state.player,regionId:npc.regionId,x:npc.x,y:npc.y+16};
record('首次交谈与选句','talk',state,{npc},s=>{const submission=requests.submitForNpc(s,npc.npcId);friendship.talk(s,npc.npcId);dialogue.select(s,npc,submission)});
record('重复交谈不刷好感','talk',state,{npc},s=>{const submission=requests.submitForNpc(s,npc.npcId);friendship.talk(s,npc.npcId);dialogue.select(s,npc,submission)});
inventory.add(state.inventory,'cauliflower',2);
record('喜欢的礼物','gift',state,{npc,item:'cauliflower'},s=>new GiftSystem(inventory).give(s,[npc],npc.npcId,'cauliflower'));
record('每天礼物上限','gift',state,{npc,item:'cauliflower'},s=>new GiftSystem(inventory).give(s,[npc],npc.npcId,'cauliflower'));
state=createInitialGameState(catalog); state.inventoryCapacity=24; state.inventory.push(...Array.from({length:12},()=>({itemId:'',quantity:0})));
record('十二格行轮换','storage',state,{type:'rotate-hotbar-row',direction:1},s=>storage.apply(s,[],{type:'rotate-hotbar-row',direction:1}));
record('反向行轮换','storage',state,{type:'rotate-hotbar-row',direction:-1},s=>storage.apply(s,[],{type:'rotate-hotbar-row',direction:-1}));
state=createInitialGameState(catalog); inventory.add(state.inventory,'chest',1);
const occupancy=new WorldOccupancySystem(catalog); let position=null;
for(let y=2;y<region.collision.rows-2&&!position;y++)for(let x=2;x<region.collision.columns-2;x++){
 state.player.x=x*16+8; state.player.y=y*16+40;
 if(occupancy.placement(state,'chest','farm',x,y,undefined,[]).allowed){position={column:x,row:y};break;}
}
if(!position)throw new Error('缺少箱子对照位置');
record('摆放普通箱','storage',state,{type:'place-world-object',inventoryIndex:5,...position},s=>storage.apply(s,[],{type:'place-world-object',inventoryIndex:5,...position}));
const chest=state.worldObjects.find(object=>object.kind==='chest');
inventory.add(state.inventory,'wood',1000);
for(const command of [
 {type:'transfer-container-item',objectId:chest.id,direction:'to-chest',sourceIndex:5,targetIndex:0,amount:'half'},
 {type:'add-to-existing-stacks',objectId:chest.id},
 {type:'move-container-item',objectId:chest.id,sourceIndex:0,targetIndex:1,amount:'one'},
 {type:'set-chest-color',objectId:chest.id,colorId:'teal'},
 {type:'recover-empty-chest',objectId:chest.id,itemId:'axe'},
 {type:'push-chest',objectId:chest.id,itemId:'axe',facing:'up'},
])record(command.type,'storage',state,command,s=>storage.apply(s,[],command));
state=createInitialGameState(catalog); state.day=8;
for(const resource of Object.values(state.resources))if(resource.kind==='stone'||resource.kind==='weed')resource.phase='cleared';
record('每日地表恢复数量与排序','regenerate',state,{},s=>{gathering.settleDay(s);mining.settleDay(s);weeds.settleDay(s)});
state=createInitialGameState(catalog);state.day=7;state.minuteOfDay=1080;inventory.add(state.inventory,'fishing-rod',1);
const zone=catalog.allRegions().flatMap(region=>region.fishingZones)[0];state.player.regionId=zone.regionId;state.player.x=zone.x+zone.width/2;state.player.y=zone.y+zone.height/2+16;
const beforeFish=structuredClone(state);const fishing=new FishingSystem(inventory,stamina,catalog);fishing.start(state,zone.id);
const steps=[];
/** 记录输入与时钟步，不读取或改写游戏实例的隐藏运行时。 */
function fishStep(type,value){steps.push({type,value});if(type==='held')fishing.setHeld(state,value);else fishing.tick(state,value);}
fishStep('held',true);fishStep('tick',600);fishStep('held',false);
for(let index=0;index<100&&!fishing.snapshot().bite;index++)fishStep('tick',50);
fishStep('held',true);let held=true;
for(let index=0;index<200&&fishing.snapshot().phase==='reeling';index++){
 const tension=fishing.snapshot().tension;
 if(tension>65&&held){held=false;fishStep('held',false);}else if(tension<35&&!held){held=true;fishStep('held',true);}
 fishStep('tick',50);
}
cases.push({name:'确定性钓鱼完整状态机',kind:'fishing',before:beforeFish,args:{zoneId:zone.id,steps},after:structuredClone(state),fishing:fishing.snapshot()});
const hashes=[1,3,7,28,29].map(day=>({seed:1296650834,day,key:'surface-stone:foothills-rock-001',expected:stableHash(1296650834,day,'surface-stone:foothills-rock-001')}));
await mkdir('../../artifacts/godot-migration-2026-09-07',{recursive:true});
await writeFile('../../artifacts/godot-migration-2026-09-07/parity.json',JSON.stringify({cases,hashes}));
console.log(`${cases.length} 个原规则对照案例，仅内存执行。`);
