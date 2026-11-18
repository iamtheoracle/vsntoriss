import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { exportAshcombeLedger, postedBalance, restoreAshcombeLedger } from "./backup.ts";
import { approveProposedAccount, confirmDelegationRecord, postCheckedBranchReceipt, reconcilePayment, reopenException } from "./ledger.controls.ts";
import { beginEnrolment, confirmEnrolment, presentFactor, readStepUp, replaceWithRecovery, revokeOtherSessions } from "./mfa.store.ts";
import { base32Encode } from "./totp.ts";
import { totpAt } from "./totp.ts";

process.env.MFA_KEY = "integrity-test-key";

type Sql = <T>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>;

function tag(db: PGlite): Sql {
  return async (strings, ...values) => {
    let text = "";
    const params: unknown[] = [];
    strings.forEach((part, index) => {
      text += part;
      if (index < values.length) {
        params.push(values[index]);
        text += `$${params.length}`;
      }
    });
    const result = await db.query(text, params);
    return result.rows as never[];
  };
}

async function database() {
  const db = new PGlite();
  const names = readdirSync(new URL("../../migrations/", import.meta.url)).filter((name) => name.endsWith(".sql")).sort();
  for (const name of names) {
    await db.exec(readFileSync(new URL(`../../migrations/${name}`, import.meta.url), "utf8"));
  }
  return db;
}

test("constraints reject a zero amount and a third institution", async () => {
  const sql = tag(await database());
  await assert.rejects(sql`insert into ledger_entries (id, account_id, direction, amount_cents, currency, narrative, source, source_id, posted_by, checked_by)
    values ('led_bad', 'missing', 'credit', 0, 'EUR', 'no', 'x', 'y', 'a', 'b')`);
  await assert.rejects(sql`insert into profiles (id, user_id, institution, kind, role, status, display_name)
    values ('prf_bad', 'u', 'headquarters', 'staff', 'executive', 'active', 'Nope')`);
});

test("maker-checker, funding, exception restart, delegation and audit immutability", async () => {
  const db = await database();
  const sql = tag(db);
  await sql`insert into accounts (id, client_user_id, name, currency, status, maker_user_id)
    values ('acc_1', 'client', 'Current', 'EUR', 'proposed', 'maker')`;
  assert.equal((await approveProposedAccount(sql, "acc_1", "maker")).length, 0);
  assert.equal((await approveProposedAccount(sql, "acc_1", "executive")).length, 1);

  await sql`insert into branch_receipts (id, account_id, amount_cents, currency, branch_name, method, narrative, status, maker_user_id)
    values ('brn_1', 'acc_1', 2500, 'EUR', 'Berlin', 'cash', 'counter', 'recorded', 'ops')`;
  assert.equal((await postCheckedBranchReceipt(sql, "brn_1", "ops", "led_1")).length, 0);
  assert.equal((await postCheckedBranchReceipt(sql, "brn_1", "executive", "led_1")).length, 1);
  assert.equal(await postedBalance(sql, "acc_1"), 2500);
  assert.equal((await postCheckedBranchReceipt(sql, "brn_1", "executive", "led_again")).length, 0);

  await sql`insert into payment_instructions (id, account_id, client_user_id, idempotency_key, amount_cents, currency, beneficiary_name, beneficiary_iban, reference_text, status, settlement_by)
    values ('pay_1', 'acc_1', 'client', 'idem', 3000, 'EUR', 'Ada', 'GB82WEST12345698765432', 'rent', 'awaiting_reconciliation', 'ops')`;
  assert.equal((await reconcilePayment(sql, "pay_1", "executive", "led_2")).length, 0);
  await sql`update payment_instructions set amount_cents = 1000 where id = 'pay_1'`;
  assert.equal((await reconcilePayment(sql, "pay_1", "ops", "led_2")).length, 0);
  assert.equal((await reconcilePayment(sql, "pay_1", "executive", "led_2")).length, 1);
  assert.equal(await postedBalance(sql, "acc_1"), 1500);
  assert.equal((await reconcilePayment(sql, "pay_1", "executive", "led_3")).length, 0);

  await sql`insert into payment_instructions (id, account_id, client_user_id, idempotency_key, amount_cents, currency, beneficiary_name, beneficiary_iban, reference_text, status, exception_by)
    values ('pay_2', 'acc_1', 'client', 'idem2', 100, 'EUR', 'Ada', 'GB82WEST12345698765432', 'hold', 'exception', 'ops')`;
  assert.equal((await reopenException(sql, "pay_2", "ops")).length, 0);
  assert.equal((await reopenException(sql, "pay_2", "executive")).length, 1);

  await sql`insert into profiles (id, user_id, institution, kind, role, status, display_name)
    values ('prf_t', 'target', 'vantoris', 'staff', 'operations', 'active', 'Target')`;
  await sql`insert into delegations (id, institution, from_user_id, to_user_id, scope, status, maker_user_id)
    values ('del_1', 'vantoris', 'exec_a', 'target', 'read the research register only', 'proposed', 'exec_a')`;
  assert.equal((await confirmDelegationRecord(sql, "del_1", "exec_a")).length, 0);
  assert.equal((await confirmDelegationRecord(sql, "del_1", "exec_b")).length, 1);
  const role = await sql<{ role: string }>`select role from profiles where user_id = 'target'`;
  assert.equal(role[0]?.role, "operations");

  await sql`insert into enquiries (id, institution, reference, full_name, email, country, topic, message)
    values ('enq_a', 'ashcombe', 'APB-1', 'A', 'a@example.com', 'DE', 'account', 'Please contact me about an account.')`;
  await sql`insert into enquiries (id, institution, reference, full_name, email, country, topic, message)
    values ('enq_v', 'vantoris', 'VPI-1', 'V', 'v@example.com', 'DE', 'research', 'Please contact the institution about research.')`;
  const seen = await sql<{ id: string }>`select id from enquiries where institution = 'ashcombe'`;
  assert.deepEqual(seen.map((row) => row.id), ["enq_a"]);

  await sql`insert into audit_events (id, actor_user_id, action, entity, entity_id) values ('aud_1', 'executive', 'post', 'ledger', 'led_1')`;
  await assert.rejects(sql`update audit_events set detail = 'changed' where id = 'aud_1'`);
  await assert.rejects(sql`delete from ledger_entries where id = 'led_1'`);

  const snapshot = await exportAshcombeLedger(sql);
  assert.equal(await postedBalance(sql, "acc_1"), 1500);
  await restoreAshcombeLedger(sql, snapshot);
  assert.equal(await postedBalance(sql, "acc_1"), 1500);
  await assert.rejects(sql`delete from ledger_entries where id = 'led_1'`);
});

test("second factor enrolment, replay, recovery and replacement", async () => {
  const db = await database();
  const sql = tag(db);
  const secretBytes = randomBytes(20);
  await sql`insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
    values ('user_a', 'Officer', 'officer@example.com', true, now(), now())`;
  await sql`insert into "session" ("id", "expiresAt", "token", "createdAt", "updatedAt", "userId")
    values ('sess_a', now() + interval '1 day', 'tok', now(), now(), 'user_a')`;
  const started = await beginEnrolment(sql, "user_a", "officer@example.com");
  assert.ok("secret" in started && started.secret);
  const code = totpAt(started.secret, Date.now()).code;
  const confirmed = await confirmEnrolment(sql, "user_a", "sess_a", code);
  assert.ok("recoveryCodes" in confirmed && confirmed.recoveryCodes?.length === 8);
  assert.equal(await readStepUp(sql, "user_a", "sess_a"), null);
  assert.ok("error" in (await presentFactor(sql, "user_a", "sess_a", code)));
  const recovery = confirmed.recoveryCodes?.[0] ?? "";
  await sql`delete from mfa_step_up where user_id = 'user_a'`;
  const replaced = await replaceWithRecovery(sql, "user_a", "sess_a", recovery, "officer@example.com");
  assert.ok("secret" in replaced && replaced.secret);
  assert.match(await readStepUp(sql, "user_a", "sess_a") ?? "", /second factor/i);
  const fresh = totpAt(replaced.secret, Date.now()).code;
  const again = await confirmEnrolment(sql, "user_a", "sess_a", fresh);
  assert.ok("recoveryCodes" in again);
  assert.equal(secretBytes.length, 20);
  assert.equal(base32Encode(secretBytes).length > 0, true);
});

test("session termination ends other sessions and refuses a foreign session", async () => {
  const sql = tag(await database());
  await sql`insert into "user" ("id", "name", "email", "emailVerified", "createdAt", "updatedAt")
    values ('user_a', 'Officer', 'officer@example.com', true, now(), now()),
           ('user_b', 'Other', 'other@example.com', true, now(), now())`;
  await sql`insert into "session" ("id", "expiresAt", "token", "createdAt", "updatedAt", "userId")
    values ('sess_current', now() + interval '1 day', 'tok-c', now(), now(), 'user_a'),
           ('sess_other', now() + interval '1 day', 'tok-o', now(), now(), 'user_a'),
           ('sess_b', now() + interval '1 day', 'tok-b', now(), now(), 'user_b')`;

  const unbound = await revokeOtherSessions(sql, "user_a", null);
  assert.match("error" in unbound ? unbound.error ?? "" : "", /not bound/i);

  const started = await beginEnrolment(sql, "user_a", "officer@example.com");
  assert.ok("secret" in started && started.secret);
  const confirmed = await confirmEnrolment(sql, "user_a", "sess_current", totpAt(started.secret, Date.now()).code);
  assert.ok("recoveryCodes" in confirmed);
  await sql`insert into mfa_step_up (session_id, user_id, method) values ('sess_other', 'user_a', 'totp')`;

  const ended = await revokeOtherSessions(sql, "user_a", "sess_current");
  assert.equal("ok" in ended && ended.ok, true);
  const own = await sql<{ id: string }>`select id from "session" where "userId" = 'user_a' order by id`;
  assert.deepEqual(own.map((row) => row.id), ["sess_current"]);
  const steps = await sql<{ session_id: string }>`select session_id from mfa_step_up where user_id = 'user_a'`;
  assert.deepEqual(steps.map((row) => row.session_id), ["sess_current"]);
  assert.equal(await readStepUp(sql, "user_a", "sess_current"), null);

  const stolen = await sql<{ id: string }>`
    delete from "session" where "id" = 'sess_current' and "userId" = 'user_b' returning "id"`;
  assert.equal(stolen.length, 0);
  const still = await sql<{ id: string }>`select id from "session" where "id" = 'sess_current'`;
  assert.equal(still.length, 1);
  const foreign = await sql<{ id: string }>`select id from "session" where "id" = 'sess_b'`;
  assert.equal(foreign.length, 1);
});
