import assert from "node:assert/strict";
import { test } from "node:test";
import { parseMatchText } from "./ocr-parse.ts";

test("reads label-and-value lines", () => {
  const text = "#12/98\nEliminations 5\nDamage 1,432\nSurvived 23:30\nAssists 2";
  assert.deepEqual(parseMatchText(text), { placement: 12, kills: 5, damage: 1432, survivalMin: 23.5 });
});

test("reads a header row with values underneath", () => {
  const text = "Finishes Assists Damage Survived\n7 1 980 18 min";
  assert.deepEqual(parseMatchText(text), { kills: 7, damage: 980, survivalMin: 18 });
});

test("reads a value on the line below its label", () => {
  assert.deepEqual(parseMatchText("Damage Dealt\n650\nKills\n3"), { damage: 650, kills: 3 });
});

test("treats a chicken dinner as first place", () => {
  assert.equal(parseMatchText("WINNER WINNER CHICKEN DINNER\nKills 9").placement, 1);
});

test("does not take a neighbouring stat's number", () => {
  assert.deepEqual(parseMatchText("Rating 3200\nKills 4"), { kills: 4 });
});

test("drops impossible values", () => {
  assert.deepEqual(parseMatchText("Kills 412\nSurvived 95 min\n#250"), {});
});

test("returns nothing for unrelated text", () => {
  assert.deepEqual(parseMatchText("Season 30 lobby\nInvite friends"), {});
});
