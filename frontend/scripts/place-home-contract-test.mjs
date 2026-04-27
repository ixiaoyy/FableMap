import assert from "node:assert/strict"

import {
  normalizeCreatePlacePayload,
  normalizeHomeMemberDraft,
  normalizePlaceRelationshipDraft,
} from "../app/lib/place-home.js"

const homePayload = normalizeCreatePlacePayload({
  name: "阿璃的 Home",
  place_type: "home",
  access: "public",
  lat: "31.2304",
  lon: "121.4737",
})
assert.equal(homePayload.place_type, "home")
assert.equal(homePayload.access, "private", "Home create payload should default to private even if a form still says public")
assert.equal(homePayload.lat, 31.2304)
assert.equal(homePayload.lon, 121.4737)

const cafePayload = normalizeCreatePlacePayload({
  name: "转角咖啡",
  place_type: "cafe",
  access: "public",
  lat: 31,
  lon: 121,
})
assert.equal(cafePayload.place_type, "cafe")
assert.equal(cafePayload.access, "public")

const silentMember = normalizeHomeMemberDraft({
  name: "小石头",
  member_type: "silent_member",
  speech_mode: "character",
})
assert.equal(silentMember.member_type, "silent_member")
assert.equal(silentMember.speech_mode, "silent", "Silent family members must not become conversational by form drift")

const displayObject = normalizeHomeMemberDraft({ name: "纪念相框", member_type: "display_object" })
assert.equal(displayObject.speech_mode, "display")

const genericRelationship = normalizePlaceRelationshipDraft({
  member_id: "member_1",
  target_tavern_id: "tavern_care",
  relation_type: "care_link",
  school_tavern_id: "legacy_school_should_not_win",
})
assert.equal(genericRelationship.member_id, "member_1")
assert.equal(genericRelationship.target_tavern_id, "tavern_care")
assert.equal(genericRelationship.relation_type, "care_link", "Relationship type should not be hardcoded to school_enrollment")

const legacySchoolRelationship = normalizePlaceRelationshipDraft({
  member_id: "member_2",
  school_tavern_id: "school_1",
  relation_type: "unsupported-freeform",
})
assert.equal(legacySchoolRelationship.target_tavern_id, "school_1")
assert.equal(legacySchoolRelationship.school_tavern_id, "school_1")
assert.equal(legacySchoolRelationship.relation_type, "school_enrollment", "Unsupported relationship types fall back to the safe school alias for legacy forms")

console.log("place-home-contract-test: ok")
