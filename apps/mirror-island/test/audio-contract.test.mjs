import assert from "node:assert/strict";
import test from "node:test";
import { ITEM_ID } from "../domain/items/definitions.ts";
import { AUDIO_CUE, ambientGroupForRegion } from "../client/src/audio/audio-catalog.ts";
import { audioCueForCommandResult } from "../client/src/audio/audio-events.ts";
import { DEFAULT_AUDIO_SETTINGS, decodeAudioSettings } from "../client/src/audio/audio-settings.ts";

test("audio settings decode one versioned local preference and clamp finite channels", () => {
  assert.deepEqual(decodeAudioSettings(null), DEFAULT_AUDIO_SETTINGS);
  assert.deepEqual(decodeAudioSettings({ version: 2, master: 0, music: 0, sfx: 0 }), DEFAULT_AUDIO_SETTINGS);
  assert.deepEqual(decodeAudioSettings({ version: 1, master: 2, music: -1, sfx: 0.35 }), {
    version: 1,
    master: 1,
    music: 0,
    sfx: 0.35,
  });
});

test("successful typed command results map to semantic cues while failures remain silent", () => {
  assert.equal(audioCueForCommandResult(
    { type: "buy-item", itemId: ITEM_ID.turnipSeed, quantity: 1 },
    { tone: "success", code: "bought", message: "ok" },
  ), AUDIO_CUE.buy);
  assert.equal(audioCueForCommandResult(
    { type: "buy-item", itemId: ITEM_ID.turnipSeed, quantity: 1 },
    { tone: "error", code: "insufficient-gold", message: "no" },
  ), null);
  assert.equal(audioCueForCommandResult(
    { type: "use-item-on-target", itemId: ITEM_ID.wateringCan, targetId: "farm-plot-001" },
    { tone: "success", code: "watered", message: "ok" },
  ), AUDIO_CUE.watering);
  assert.equal(audioCueForCommandResult(
    { type: "transition-region", exitId: "farm-east-exit" },
    null,
  ), null);
  assert.equal(audioCueForCommandResult(
    { type: "acknowledge-retention-event", eventId: "day-3-watering-intro" },
    { tone: "success", code: "milestone-acknowledged", message: "ok" },
  ), null);
  assert.equal(audioCueForCommandResult(
    { type: "pet-home-pet" },
    { tone: "success", code: "pet-petted", message: "ok" },
  ), null);
});

test("world regions select one stable ambience group without adding gameplay state", () => {
  assert.equal(ambientGroupForRegion("farm"), "farm");
  assert.equal(ambientGroupForRegion("foothills"), "farm");
  assert.equal(ambientGroupForRegion("town"), "town");
  assert.equal(ambientGroupForRegion("lakeshore"), "lakeshore");
  assert.equal(ambientGroupForRegion("cottage"), "interior");
});
