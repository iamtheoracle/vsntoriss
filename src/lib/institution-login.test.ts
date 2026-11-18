import assert from "node:assert/strict";
import test from "node:test";
import { institutionOf, stayOnInstitution } from "./institution-login.ts";

test("a path belongs to one institution", () => {
  assert.equal(institutionOf("/ashcombe/banking"), "ashcombe");
  assert.equal(institutionOf("/vantoris/portal"), "vantoris");
  assert.equal(institutionOf("/access"), null);
});

test("sign-in cannot leave the institution that opened it", () => {
  assert.equal(stayOnInstitution("ashcombe", "/ashcombe/office"), "/ashcombe/office");
  assert.equal(stayOnInstitution("ashcombe", "/vantoris/portal"), "/ashcombe/banking");
  assert.equal(stayOnInstitution("vantoris", "/access"), "/vantoris/portal");
  assert.equal(stayOnInstitution("vantoris", "https://example.com"), "/vantoris/portal");
  assert.equal(stayOnInstitution("ashcombe", "/security"), "/security");
});
