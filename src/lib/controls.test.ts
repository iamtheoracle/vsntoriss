import assert from "node:assert/strict";
import test from "node:test";
import { appointmentRefusal, instructionBlockedByLimit } from "./controls.ts";

test("no approved limit does not invent a ceiling", () => {
  assert.equal(instructionBlockedByLimit(50_000_00, null), null);
});

test("an instruction above an approved limit is refused", () => {
  assert.match(instructionBlockedByLimit(100_01, 100_00) ?? "", /above the approved/);
  assert.equal(instructionBlockedByLimit(100_00, 100_00), null);
});

test("an officer cannot appoint themselves or mint another executive", () => {
  assert.match(appointmentRefusal("executive", "operations", true) ?? "", /own role/);
  assert.match(appointmentRefusal("operations", "compliance", false) ?? "", /Executive/);
  assert.match(appointmentRefusal("executive", "executive", false) ?? "", /founding path/);
  assert.equal(appointmentRefusal("executive", "audit", false), null);
});
