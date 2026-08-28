export interface DialogueDefinition {
  readonly id: string;
  readonly speaker: string;
  readonly lines: readonly [string, ...string[]];
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

/** Returns one fixed reviewed dialogue definition or null for an unknown catalog ID. */
export function getDialogueDefinition(dialogueId: string): DialogueDefinition | null {
  return DIALOGUES[dialogueId] ?? null;
}
