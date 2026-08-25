export interface DialogueDefinition {
  readonly id: string;
  readonly speaker: string;
  readonly text: string;
}

const DIALOGUES: Readonly<Record<string, DialogueDefinition>> = {
  "seed-keeper-welcome": {
    id: "seed-keeper-welcome",
    speaker: "种子店老板",
    text: "新搬来的？需要种子就来找我。",
  },
};

/** Returns one fixed reviewed dialogue definition or null for an unknown catalog ID. */
export function getDialogueDefinition(dialogueId: string): DialogueDefinition | null {
  return DIALOGUES[dialogueId] ?? null;
}
