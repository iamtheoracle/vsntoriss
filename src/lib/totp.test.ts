import assert from "node:assert/strict";
import { test } from "node:test";
import { hotp, matchTotp, totpAt, base32Encode } from "./totp.ts";
import { randomBytes } from "node:crypto";

test("RFC 6238 SHA1 vector at 59 seconds", () => {
  const key = Buffer.from("12345678901234567890");
  assert.equal(hotp(key, 1n, 8), "94287082");
});

test("a current code is accepted once and then rejected as a replay", () => {
  const secret = base32Encode(randomBytes(20));
  const now = Date.UTC(2026, 0, 1, 0, 0, 30);
  const { code, counter } = totpAt(secret, now);
  const accepted = matchTotp(secret, code, now, null);
  assert.equal(accepted, counter);
  assert.equal(matchTotp(secret, code, now, accepted), null);
});

test("a malformed code is refused", () => {
  const secret = base32Encode(randomBytes(20));
  assert.equal(matchTotp(secret, "12", Date.now(), null), null);
});
