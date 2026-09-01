import {
  schedulePhaseAt,
  type NpcSchedulePhase,
} from "../../../../domain/time/game-time.ts";
import { getNpcDialogueProfile } from "../../../../domain/dialogue/definitions.ts";
import { getDailyRequest } from "../../../../domain/requests/definitions.ts";
import { ITEM_DEFINITIONS } from "../../../../domain/items/definitions.ts";

type DialogueLines = readonly [string, ...string[]];
type DialogueVariantPair = readonly [DialogueLines, DialogueLines];
type ContextualDialogueVariants = Readonly<Record<NpcSchedulePhase, DialogueVariantPair>>;

export interface DialogueDefinition {
  readonly id: string;
  readonly speaker: string;
  readonly lines: DialogueLines;
}

export interface DialogueContext {
  readonly day: number;
  readonly minuteOfDay: number;
  readonly shopAvailable?: boolean;
}

const DIALOGUES: Readonly<Record<string, DialogueDefinition>> = {
  "seed-keeper-welcome": {
    id: "seed-keeper-welcome",
    speaker: "华强",
    lines: ["萝卜种子还压着半箱。今天种下的话，别忘了浇水。"],
  },
  "blacksmith-intro": {
    id: "blacksmith-intro",
    speaker: "昊天",
    lines: [
      "炉子还没正式开张。",
      "不过东边最近总有人捡回带蓝光的石头，普通锤子敲不动。",
      "我妹妹昊美丽住在铁匠巷，她补的围裙比我打的铁耐用。",
    ],
  },
  "town-resident-pink-tree": {
    id: "town-resident-pink-tree",
    speaker: "阿禾",
    lines: [
      "这棵粉花树总比别处早开几天。",
      "镇上的人懒得记日子，就拿它当春天的钟。",
      "我和姐姐阿澜住在河边，她画的岸线图比路牌还准。",
    ],
  },
  "resident-mozi-home": {
    id: "resident-mozi-home",
    speaker: "墨子",
    lines: [
      "西街的屋顶最怕河风，我每年都要重新压一遍瓦。",
      "门窗若是发涩，别硬推，木头也有自己的脾气。",
      "北山倒下的旧木料还能用，前提是先晒透。",
    ],
  },
  "resident-haonan-home": {
    id: "resident-haonan-home",
    speaker: "浩南",
    lines: [
      "我每天看山泉的水色，就知道山路是不是好走。",
      "矿口还不安全，看到新落下的碎石就别往里钻。",
      "回镇时替我看看北街木牌，有松动就告诉墨子。",
    ],
  },
  "resident-alan-home": {
    id: "resident-alan-home",
    speaker: "阿澜",
    lines: [
      "阿禾喜欢守着粉花树，我更习惯沿河记颜色。",
      "这些布样都是用岸边植物染的，同一片叶子也会有深浅。",
      "南湖的旧码头我画进图里了，祥子说潮线还要再改。",
    ],
  },
  "resident-haomeili-home": {
    id: "resident-haomeili-home",
    speaker: "昊美丽",
    lines: [
      "昊天负责把铁烧红，我负责让他别把围裙烧穿。",
      "工坊的手套、布袋和护袖都在这张针线桌上修。",
      "他嘴上说不用帮忙，少一根扣带却能找我半天。",
    ],
  },
  "resident-xiangzi-home": {
    id: "resident-xiangzi-home",
    speaker: "祥子",
    lines: [
      "东岸风小的时候，我会去码头重系一遍绳结。",
      "湖面看着平，木板底下的水一直在推。",
      "阿澜的地图很细，我只负责告诉她哪块岸石又挪了位置。",
    ],
  },
  "town-notice-board": {
    id: "town-notice-board",
    speaker: "镇口公告板",
    lines: ["北边山路已经重新开放，南边湖岸的旧码头也修好了。"],
  },
  "blacksmith-forge": {
    id: "blacksmith-forge",
    speaker: "冷却的锻炉",
    lines: ["炉膛里还留着昨夜的余温，风箱却安静地靠在一旁。"],
  },
  "blacksmith-tool-rack": {
    id: "blacksmith-tool-rack",
    speaker: "工具架",
    lines: ["锤、钳和磨石分门别类地挂着，最上面空出了一格。"],
  },
  "town-house-table": {
    id: "town-house-table",
    speaker: "餐桌",
    lines: ["桌上压着一张手绘小镇图，北山和南湖各被圈了一笔。"],
  },
  "town-house-window": {
    id: "town-house-window",
    speaker: "窗边",
    lines: ["从这里正好能看见粉花树的树冠和河上的木桥。"],
  },
  "town-house-private-room": {
    id: "town-house-private-room",
    speaker: "内屋门",
    lines: ["这是屋主的私人房间，现在不方便进去。"],
  },
  "town-house-west-hearth": {
    id: "town-house-west-hearth",
    speaker: "西街壁炉",
    lines: ["炉边堆着劈好的木柴，茶壶还留着一点温度。"],
  },
  "town-house-west-shelf": {
    id: "town-house-west-shelf",
    speaker: "西街置物架",
    lines: ["架上摆着晒干的花和几只修补过的陶罐。"],
  },
  "town-house-west-private-room": {
    id: "town-house-west-private-room",
    speaker: "内屋门",
    lines: ["门牌写着“私人房间”，里面暂不开放参观。"],
  },
  "town-house-north-tea": {
    id: "town-house-north-tea",
    speaker: "北街茶桌",
    lines: ["两只茶杯一新一旧，桌角压着一张山路天气记录。"],
  },
  "town-house-north-cabinet": {
    id: "town-house-north-cabinet",
    speaker: "北街矮柜",
    lines: ["柜门上贴着分类纸条：盐、干果、灯油。"],
  },
  "town-house-north-private-room": {
    id: "town-house-north-private-room",
    speaker: "内屋门",
    lines: ["这里是屋主休息的地方，先不要打扰。"],
  },
  "town-house-southwest-sewing": {
    id: "town-house-southwest-sewing",
    speaker: "针线桌",
    lines: ["桌上摊着一块缝到一半的格纹桌布。"],
  },
  "town-house-southwest-pantry": {
    id: "town-house-southwest-pantry",
    speaker: "食品柜",
    lines: ["里面整齐放着面粉、蜂蜜和几捆干香草。"],
  },
  "town-house-southwest-private-room": {
    id: "town-house-southwest-private-room",
    speaker: "内屋门",
    lines: ["内屋属于私人空间，目前不能进入。"],
  },
  "town-house-east-map": {
    id: "town-house-east-map",
    speaker: "东岸航图",
    lines: ["纸上画着南湖岸线，旧码头旁标了一个小小的星号。"],
  },
  "town-house-east-window": {
    id: "town-house-east-window",
    speaker: "东岸窗台",
    lines: ["窗台常被水汽打湿，几块圆石压着晾晒的信纸。"],
  },
  "town-house-east-private-room": {
    id: "town-house-east-private-room",
    speaker: "内屋门",
    lines: ["门后是屋主的私人房间，暂时不便参观。"],
  },
  "foothills-trail-sign": {
    id: "foothills-trail-sign",
    speaker: "山路木牌",
    lines: ["向北：旧矿洞。向东：泉眼林地。雨后石阶湿滑。"],
  },
  "foothills-mine-mouth": {
    id: "foothills-mine-mouth",
    speaker: "封闭矿洞",
    lines: ["洞里传来很远的滴水声。木栅栏已经发白，暂时没有安全进入的路。"],
  },
  "foothills-spring": {
    id: "foothills-spring",
    speaker: "山泉",
    lines: ["泉水从石缝里冒出来，顺着浅沟一路流向南边的小镇。"],
  },
  "lakeshore-waystone": {
    id: "lakeshore-waystone",
    speaker: "湖岸石标",
    lines: ["石标上只刻着一个方向：沿水向东。"],
  },
  "lakeshore-dock": {
    id: "lakeshore-dock",
    speaker: "旧木码头",
    lines: ["木板被湖水磨得发亮，末端系船的绳结还是新的。"],
  },
  "lakeshore-picnic": {
    id: "lakeshore-picnic",
    speaker: "湖边休憩处",
    lines: ["长椅面向开阔水面。坐在这里，镇上的屋顶刚好藏到树后。"],
  },
};

const CONTEXTUAL_DIALOGUES: Readonly<Partial<Record<string, ContextualDialogueVariants>>> = {
  "seed-keeper-welcome": {
    morning: [
      [
        "天还没亮透，我先把受潮的种袋挑出来。",
        "柜台九点后才开，早一点来只能陪我理货。",
      ],
      [
        "今早的清单比昨天短，萝卜种子还够。",
        "等我把木牌翻到营业那面，再进来慢慢挑。",
      ],
    ],
    day: [
      ["萝卜种子还压着半箱。今天种下的话，别忘了浇水。"],
      ["今天新拆了一捆萝卜种子，二十金一袋，还是老价钱。"],
    ],
    evening: [
      [
        "柜台已经收了，剩下的种袋要重新扎口。",
        "明早晒过一遍，纸袋才不会返潮。",
      ],
      [
        "今天的账刚对完，架上那排空位也该擦一擦。",
        "要买种子，明天白天再来。",
      ],
    ],
    night: [
      [
        "这个点不看账了，眼睛比算盘先累。",
        "明早还得把门前落下的种壳扫干净。",
      ],
      [
        "夜里听见纸袋响，多半是风从门缝钻进来。",
        "等我压好窗角，也该休息了。",
      ],
    ],
  },
  "blacksmith-intro": {
    morning: [
      [
        "昊美丽昨晚把围裙的扣带补好了。",
        "我趁炉火没起，先把今天要用的钳子排顺。",
      ],
      [
        "早上的铁砧最凉，落锤前得先把手腕活动开。",
        "工坊里那桶清水也要换新的。",
      ],
    ],
    day: [
      [
        "今天只处理镇里的门扣和农具修补。",
        "火候到了，锤声自然会稳下来。",
      ],
      [
        "风箱刚顺起来，炉膛里的颜色正合适。",
        "你站远半步，火星落不到鞋面上。",
      ],
    ],
    evening: [
      [
        "最后一块铁已经回火，剩下的是收钳子和扫铁屑。",
        "昊美丽总说我收工比开炉还慢。",
      ],
      [
        "炉火看着还亮，其实已经不能再添料了。",
        "把余温留到明早，工坊不会一下冷透。",
      ],
    ],
    night: [
      [
        "手上的铁味洗两遍也散不掉。",
        "今晚先歇着，明早再听第一声锤响。",
      ],
      [
        "昊美丽把灯芯剪短了，说我夜里不该再摸工具。",
        "她说得对，困的时候连钳口都看不准。",
      ],
    ],
  },
  "town-resident-pink-tree": {
    morning: [
      [
        "姐姐阿澜起得比我早，已经去看过河面的颜色了。",
        "我把窗边的小苗浇完才出门。",
      ],
      [
        "清晨的粉花落得慢，扫起来反而费时间。",
        "阿澜说风向变了，今天河边会更凉。",
      ],
    ],
    day: [
      [
        "这棵粉花树总比别处早开几天。",
        "我把树脚的土松开，雨水才不会积成一圈。",
      ],
      [
        "今天落下的花瓣很完整，我挑几片夹进旧账本里。",
        "等叶子长密了，这里会比街口凉快。",
      ],
    ],
    evening: [
      [
        "湖边的风把衣角都吹凉了。",
        "阿澜在看岸线，我替她记哪盏屋灯最先亮。",
      ],
      [
        "太阳落到水面时，粉花树的影子会刚好碰到桥头。",
        "从这里看，回家的路很清楚。",
      ],
    ],
    night: [
      [
        "阿澜还在整理今天画的岸线，我先把茶温着。",
        "窗外安静下来，才能听见河水碰桥桩。",
      ],
      [
        "夜里别把窗开得太大，水汽会落到桌面上。",
        "明早我还要去看看粉花树有没有折枝。",
      ],
    ],
  },
  "resident-mozi-home": {
    morning: [
      [
        "早上的木头最诚实，哪块受潮一敲就听得出来。",
        "我先把钉袋和尺子数一遍再出门。",
      ],
      [
        "昨夜河风不小，西街的檐角得挨家看过去。",
        "工具少一件，走到半路才发现最耽误事。",
      ],
    ],
    day: [
      [
        "这块门板只是合页松了，不用整扇换掉。",
        "旧木料修得好，也能再挡几年风。",
      ],
      [
        "西街的屋顶怕河风，钉得太死反而容易裂。",
        "留一点伸缩的位置，木头才住得安稳。",
      ],
    ],
    evening: [
      [
        "收工前还要绕一遍主街，看看白天补的地方有没有走样。",
        "太阳斜着照，木缝最容易看清。",
      ],
      [
        "今天的刨花够装一小袋，带回去引火正好。",
        "尺子我已经收了，锤子还得再擦一遍。",
      ],
    ],
    night: [
      [
        "屋里一安静，就能听见哪块地板在轻响。",
        "那不是坏事，木头也在跟着夜气伸缩。",
      ],
      [
        "壁炉边这把椅子修过三次，坐起来倒比新的稳。",
        "今晚不动工具，让手也歇一歇。",
      ],
    ],
  },
  "resident-haonan-home": {
    morning: [
      [
        "上山前先看云脚，再看泉水。",
        "两样都清，今天的石阶就不会太滑。",
      ],
      [
        "灯油、绳子和干布都带齐了。",
        "山里不缺路，缺的是出发前多想一步。",
      ],
    ],
    day: [
      [
        "山泉今天很清，靠北那段路却有新落下的碎石。",
        "沿木牌走就好，封着的地方别翻过去。",
      ],
      [
        "我刚巡过泉眼，浅沟没有堵。",
        "再往高处风更硬，听见树枝连响就该往回走。",
      ],
    ],
    evening: [
      [
        "回镇前我会把山路木牌再扶正一次。",
        "墨子看见松动的榫口，明天就知道带什么工具。",
      ],
      [
        "今天没有人越过旧栅栏，这就是好消息。",
        "鞋底的泥在街口刮干净，再回家喝茶。",
      ],
    ],
    night: [
      [
        "夜里不进山，熟路也会被影子变成另一条路。",
        "我把明天的天气记在茶桌那张纸上了。",
      ],
      [
        "山风停了以后，窗边反而会更冷。",
        "灯留一盏就够，明早还得早起。",
      ],
    ],
  },
  "resident-alan-home": {
    morning: [
      [
        "阿禾已经在给窗边的小苗浇水了。",
        "我先把空白纸压平，等河雾散一点再出门。",
      ],
      [
        "晨光偏冷，画出来的水色容易比实际更蓝。",
        "所以我总带一小块昨天的布样作比较。",
      ],
    ],
    day: [
      [
        "今天岸边的浅绿比昨天多了一层灰。",
        "风从东边来，水纹会把颜色切得很碎。",
      ],
      [
        "我在等云影离开码头，再补最后一段岸线。",
        "祥子说那块圆石昨晚又被水推偏了。",
      ],
    ],
    evening: [
      [
        "站在桥边回看，镇上的灯色比湖面更暖。",
        "阿禾喜欢数哪一盏先亮，我只记它们落在水里的位置。",
      ],
      [
        "傍晚的颜色留不久，慢一会儿就会完全变样。",
        "今天这张图先停在这里，明早再对照。",
      ],
    ],
    night: [
      [
        "纸已经收进柜里，夜里的水色不用追着画。",
        "阿禾温着茶，我们会把今天的记录对一遍。",
      ],
      [
        "窗台有一点潮，我拿圆石压住了画纸四角。",
        "等墨迹干透，明天才能带回湖边。",
      ],
    ],
  },
  "resident-haomeili-home": {
    morning: [
      [
        "昊天又把围裙扣反了，我出门前还得替他重系一次。",
        "针线盒倒是齐的，今天不用回头找。",
      ],
      [
        "早上光线好，深色布上的细裂口最容易看见。",
        "我先把工坊要用的护袖挑出来。",
      ],
    ],
    day: [
      [
        "锤子和钳子分开挂，昊天忙起来才不会抓错。",
        "这只布袋刚换过底，装铁件也不会漏。",
      ],
      [
        "工坊里最容易坏的不是铁器，是绑带和手套。",
        "趁昊天看炉火，我把磨破的边都收好。",
      ],
    ],
    evening: [
      [
        "收工后衣服上全是细灰，拍得太重反而往布里钻。",
        "我在街口吹一会儿风再回家。",
      ],
      [
        "今天补了两只手套和一条围裙带。",
        "昊天说这不算锻造，我说少了它们他也开不了炉。",
      ],
    ],
    night: [
      [
        "针线桌只剩这道短边，缝完就收灯。",
        "夜里眼睛累，针脚歪了明天还得拆。",
      ],
      [
        "昊天把明天要穿的围裙搭在椅背上了。",
        "总算有一次不用我提醒。",
      ],
    ],
  },
  "resident-xiangzi-home": {
    morning: [
      [
        "风还没起来，正适合检查绳结有没有返松。",
        "我带一块干布，码头的木板清早总有水汽。",
      ],
      [
        "出门前先看窗台那几块圆石，潮气重不重一眼就知道。",
        "今天湖面应该不会太急。",
      ],
    ],
    day: [
      [
        "旧码头今天很稳，最东边那块板还是别踩边角。",
        "绳结我重系过了，风大一点也不会散。",
      ],
      [
        "湖面看着平，木板底下的水一直在推。",
        "站久了就能听出哪根桩受力最重。",
      ],
    ],
    evening: [
      [
        "晚风一转向，靠岸的水声就会变。",
        "阿澜等我报完潮线，才肯收起今天的图。",
      ],
      [
        "最后一圈绳已经盘好，码头边没有落下东西。",
        "等天色再暗一点，我就沿湖岸回去。",
      ],
    ],
    night: [
      [
        "夜里听不见码头的木响，反而有点不习惯。",
        "明早我会先去看东边那根系船桩。",
      ],
      [
        "窗台的信纸已经晾干了，圆石也该放回原位。",
        "今晚风小，可以睡得安稳些。",
      ],
    ],
  },
};

const SEED_KEEPER_OPENING_DIALOGUE: DialogueVariantPair = [
  ["我正往柜台去。等我把木牌翻到营业那面，再来挑种子。"],
  ["账本还没摊开，先让我走到柜台把种袋摆好。"],
];

const PERSONALITY_DIALOGUES: Readonly<Record<string, readonly [DialogueLines, DialogueLines, DialogueLines]>> = {
  "seed-keeper": [
    ["种袋最怕潮气，我每天都要摸一遍封口。"],
    ["账本上的数字不会发芽，但能让我知道明天该补什么货。"],
    ["镇上谁家第一次种地，我通常看鞋底就知道。"],
  ],
  "town-blacksmith": [
    ["铁的颜色比钟表准，亮到哪一步就该落哪一锤。"],
    ["农具握柄顺不顺手，比刃口亮不亮更重要。"],
    ["炉火熄了以后，工坊才会慢慢说出今天哪里没做好。"],
  ],
  "town-resident-01": [
    ["我喜欢记哪朵花先开，可从来记不住账本放在哪。"],
    ["阿澜看水色，我看树影，我们常常得到同一个答案。"],
    ["镇口风大，站一会儿就能听见每条街不同的声音。"],
  ],
  "town-resident-mozi": [
    ["好木头不怕旧，怕的是没人知道它该往哪里受力。"],
    ["修东西前先听一听，松动和开裂的声音完全不同。"],
    ["我留下每块还能用的边角料，总有一天会碰上合适的位置。"],
  ],
  "town-resident-haonan": [
    ["山路不会突然变坏，它总会提前留下几处小迹象。"],
    ["我出门带的东西不多，但绳子和干布从不落下。"],
    ["巡山最重要的不是走得远，是知道什么时候该回来。"],
  ],
  "town-resident-alan": [
    ["同一片水每天都有不同的灰，我还没画到满意过。"],
    ["布样晒久一点，颜色会比刚染出来诚实。"],
    ["我画地图不是为了把路框死，是怕人错过沿途的变化。"],
  ],
  "town-resident-haomeili": [
    ["针脚藏在背面，穿的人看不见，它也得一样整齐。"],
    ["昊天总把修补说成小事，真少了扣带又第一个来找我。"],
    ["布料和人一样，拉得太紧反而更容易裂。"],
  ],
  "town-resident-xiangzi": [
    ["码头的绳结每天都一样打，受力的位置却天天不同。"],
    ["湖面越安静，我越会多看两眼木桩下面。"],
    ["我习惯把信压在窗边，等水汽退了再读第二遍。"],
  ],
};

const RELATIONSHIP_DIALOGUES: Readonly<Record<string, Readonly<Record<"familiar" | "friendly", DialogueLines>>>> = {
  "seed-keeper": { familiar: ["你来得正好，我给你留了一袋干燥些的种子。"], friendly: ["你的田我大概记住了，缺什么先来跟我说。"] },
  "town-blacksmith": { familiar: ["你的工具握痕我认得，放到架上就行。"], friendly: ["下次开炉早点来，我让你看看火候怎么分。"] },
  "town-resident-01": { familiar: ["今天树影挪得早，我猜你也会经过这里。"], friendly: ["我替你记了一朵最早开的花，别告诉阿澜。"] },
  "town-resident-mozi": { familiar: ["你家哪处门窗不顺，路过时告诉我一声。"], friendly: ["我留了块纹理很稳的木料，觉得你以后用得上。"] },
  "town-resident-haonan": { familiar: ["看见你来，我就知道镇口那段路有人照应了。"], friendly: ["哪天想看山泉最清的时候，我带你走一段。"] },
  "town-resident-alan": { familiar: ["我在图上添了你常走的那条小路。"], friendly: ["这张湖岸草图给你看，很多地方我还没给别人看过。"] },
  "town-resident-haomeili": { familiar: ["你的袖口有点松，下次带来我顺手补好。"], friendly: ["我给你留了更结实的线，农活时不容易磨断。"] },
  "town-resident-xiangzi": { familiar: ["今天湖风稳，你来了正好一起听听木桩的声音。"], friendly: ["码头最安静的时辰我只告诉熟人，你算一个。"] },
};

const EVENT_DIALOGUES: Readonly<Record<string, DialogueDefinition>> = {
  "event:seed-keeper-two-heart": {
    id: "event:seed-keeper-two-heart",
    speaker: "华强",
    lines: ["等等，这本旧种植簿借你。", "空白处不少，正好记你自己的田。", "用完不用急着还，我知道你会保管好。"],
  },
  "event:blacksmith-two-heart": {
    id: "event:blacksmith-two-heart",
    speaker: "昊天",
    lines: ["听这一下，声音比昨天稳。", "工具顺手不是因为它新，是因为有人认真用。", "以后要调哪里，直接告诉我。"],
  },
};

const LAKESHORE_MIRROR_TEASER: DialogueDefinition = {
  id: "lakeshore-waystone",
  speaker: "湖岸石标",
  lines: [
    "石标正面像蒙了一层水，却照不出你的影子。",
    "冷光深处闪过一座倒悬的山门，随后被细小涟漪吞没。",
    "刻痕下多了一行很浅的字：镜门未开，彼岸仍在。",
  ],
};

/** Returns one fixed or deterministic day/phase dialogue, or null for an unknown catalog ID. */
export function getDialogueDefinition(
  dialogueId: string,
  context?: DialogueContext,
): DialogueDefinition | null {
  if (dialogueId === "lakeshore-waystone" && context && context.day >= 7) {
    return LAKESHORE_MIRROR_TEASER;
  }
  const selected = selectedDialogueDefinition(dialogueId, context);
  if (selected) return selected;
  const definition = DIALOGUES[dialogueId];
  if (!definition) return null;
  const variants = CONTEXTUAL_DIALOGUES[dialogueId];
  if (!context || !variants) return definition;
  if (!Number.isSafeInteger(context.day) || context.day < 1) {
    throw new Error("Dialogue day is invalid.");
  }
  const phase = schedulePhaseAt(context.minuteOfDay);
  const variantIndex = (context.day - 1) % 2;
  const lines = dialogueId === "seed-keeper-welcome"
    && phase === "day"
    && context.shopAvailable === false
    ? SEED_KEEPER_OPENING_DIALOGUE[variantIndex]!
    : variants[phase][variantIndex]!;
  return { ...definition, lines };
}

/** Resolves one domain-selected stable dialogue ID into client presentation text. */
function selectedDialogueDefinition(
  dialogueId: string,
  context?: DialogueContext,
): DialogueDefinition | null {
  if (EVENT_DIALOGUES[dialogueId]) return EVENT_DIALOGUES[dialogueId]!;
  const parts = dialogueId.split(":");
  const kind = parts[0];
  if (kind === "activity" && parts.length === 4) {
    const [, npcId, rawPhase, rawVariant] = parts;
    const profile = getNpcDialogueProfile(npcId!);
    const variants = profile ? CONTEXTUAL_DIALOGUES[profile.baseDialogueId] : null;
    const definition = profile ? DIALOGUES[profile.baseDialogueId] : null;
    if (!profile || !variants || !definition || !isSchedulePhase(rawPhase)) return null;
    const variant = rawVariant === "0" ? 0 : rawVariant === "1" ? 1 : null;
    if (variant === null) return null;
    const lines = npcId === "seed-keeper"
      && rawPhase === "day"
      && context?.shopAvailable === false
      ? SEED_KEEPER_OPENING_DIALOGUE[variant]
      : variants[rawPhase][variant];
    return { id: dialogueId, speaker: definition.speaker, lines };
  }
  if (kind === "personality" && parts.length === 3) {
    const [, npcId, rawVariant] = parts;
    const profile = getNpcDialogueProfile(npcId!);
    const definition = profile ? DIALOGUES[profile.baseDialogueId] : null;
    const variant = rawVariant === "0" ? 0 : rawVariant === "1" ? 1 : rawVariant === "2" ? 2 : null;
    const lines = variant === null ? null : PERSONALITY_DIALOGUES[npcId!]?.[variant] ?? null;
    return definition && lines ? { id: dialogueId, speaker: definition.speaker, lines } : null;
  }
  if (kind === "relationship" && parts.length === 3) {
    const [, npcId, rawStage] = parts;
    const profile = getNpcDialogueProfile(npcId!);
    const definition = profile ? DIALOGUES[profile.baseDialogueId] : null;
    const stage = rawStage === "familiar" || rawStage === "friendly" ? rawStage : null;
    const lines = stage ? RELATIONSHIP_DIALOGUES[npcId!]?.[stage] ?? null : null;
    return definition && lines ? { id: dialogueId, speaker: definition.speaker, lines } : null;
  }
  if (kind === "request" && parts.length === 3) {
    const [, requestId, rawStatus] = parts;
    const request = getDailyRequest(requestId);
    const profile = request ? getNpcDialogueProfile(request.npcId) : null;
    const definition = profile ? DIALOGUES[profile.baseDialogueId] : null;
    if (!request || !definition || (rawStatus !== "missing" && rawStatus !== "thanks")) return null;
    const itemName = ITEM_DEFINITIONS[request.itemId].name;
    const lines: DialogueLines = rawStatus === "thanks"
      ? [`正是我需要的${itemName}，这些帮了大忙。`]
      : [`还差 ${request.quantity} 份${itemName}，不用着急，今天带来就好。`];
    return { id: dialogueId, speaker: definition.speaker, lines };
  }
  return null;
}

/** Narrows one persisted activity token to the four reviewed NPC schedule phases. */
function isSchedulePhase(value: string | undefined): value is NpcSchedulePhase {
  return value === "morning" || value === "day" || value === "evening" || value === "night";
}
