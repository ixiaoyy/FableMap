import assert from "node:assert/strict"

import { GENDER_OPTIONS, genderLabel, normalizeGender } from "../app/lib/gender.js"

assert.deepEqual(
  GENDER_OPTIONS.map((option) => option.value),
  ["unspecified", "female", "male", "nonbinary", "other"],
)

assert.equal(normalizeGender(), "unspecified")
assert.equal(normalizeGender(""), "unspecified")
assert.equal(normalizeGender("女"), "female")
assert.equal(normalizeGender("male"), "male")
assert.equal(normalizeGender("非二元"), "nonbinary")
assert.equal(normalizeGender("unknown-freeform"), "unspecified")

assert.equal(genderLabel("female"), "女性")
assert.equal(genderLabel("non-binary"), "非二元")
assert.equal(genderLabel("not-a-gender"), "未说明")

console.log("gender-fields-test: ok")
