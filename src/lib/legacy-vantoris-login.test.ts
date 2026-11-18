import assert from "node:assert/strict";
import test from "node:test";
import { legacyPasswordAccepted } from "./legacy-vantoris-login.ts";

test("an old Vantoris password is accepted only when the existing sign-in says so", () => {
  assert.equal(legacyPasswordAccepted(400, { message: "Invalid email or password" }), false);
  assert.equal(legacyPasswordAccepted(200, { access_token: "issued" }), true);
  assert.equal(legacyPasswordAccepted(200, { mfa_required: true }), true);
  assert.equal(legacyPasswordAccepted(200, { message: "ok" }), false);
  assert.equal(legacyPasswordAccepted(500, { access_token: "issued" }), false);
});
