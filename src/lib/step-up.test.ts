import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { stepUpDecision } from "./step-up.ts";

test("step-up fails closed", () => {
  assert.match(stepUpDecision({ sessionBound: false, enrolled: true, fresh: true }) ?? "", /not bound/);
  assert.match(stepUpDecision({ sessionBound: true, enrolled: false, fresh: false }) ?? "", /second factor/i);
  assert.equal(stepUpDecision({ sessionBound: true, enrolled: true, fresh: true }), null);
});

test("privileged handlers call the step-up gate", () => {
  const platform = readFileSync(new URL("./platform.functions.ts", import.meta.url), "utf8");
  const registers = readFileSync(new URL("./registers.functions.ts", import.meta.url), "utf8");
  const required = [
    "bootstrapExecutive", "decideProfile", "issueKycLink", "proposeAccount", "approveAccount",
    "advancePayment", "checkBranchReceipt", "ashcombeOffice", "vantorisOffice",
    "appointOfficer", "approveLimit", "confirmDelegation", "ashcombeRegisters", "vantorisRegisters",
  ];
  const both = platform + "\n" + registers;
  for (const name of required) {
    const start = both.indexOf(`export const ${name} = createServerFn`);
    assert.ok(start > 0, name);
    const next = both.indexOf("\nexport const ", start + 10);
    const body = both.slice(start, next > 0 ? next : undefined);
    assert.match(body, /stepUpBlock/, name);
  }
});
