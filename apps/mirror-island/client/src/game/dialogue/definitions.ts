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
    ],
  },
  "town-resident-pink-tree": {
    id: "town-resident-pink-tree",
    speaker: "阿禾",
    lines: [
      "这棵粉花树总比别处早开几天。",
      "镇上的人懒得记日子，就拿它当春天的钟。",
    ],
  },
};

/** Returns one fixed reviewed dialogue definition or null for an unknown catalog ID. */
export function getDialogueDefinition(dialogueId: string): DialogueDefinition | null {
  return DIALOGUES[dialogueId] ?? null;
}
