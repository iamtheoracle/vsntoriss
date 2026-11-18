import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { openSecret, sealSecret } from "./secret-box.ts";
import { stepUpDecision } from "./step-up.ts";
import { base32Encode, matchTotp } from "./totp.ts";

type Sql = <T>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>;

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function hashCode(userId: string, code: string) {
  return createHash("sha256").update(`${userId}:${code.replace(/\s+/g, "").toUpperCase()}`).digest("hex");
}

function recoveryCode() {
  return randomBytes(6).toString("hex").toUpperCase().match(/.{4}/g)?.join("-") ?? "";
}

async function locked(sql: Sql, userId: string) {
  const rows = await sql<{ n: number }>`
    select count(*) as n from mfa_attempts
    where user_id = ${userId} and succeeded = false and created_at > now() - interval '15 minutes'`;
  return Number(rows[0]?.n ?? 0) >= 8;
}

async function attempt(sql: Sql, userId: string, succeeded: boolean) {
  await sql`insert into mfa_attempts (id, user_id, succeeded) values (${id("mfa")}, ${userId}, ${succeeded})`;
}

export async function readStepUp(sql: Sql, userId: string, sessionId: string | null) {
  if (!sessionId) return stepUpDecision({ sessionBound: false, enrolled: false, fresh: false });
  const rows = await sql<{ enrolled: boolean; fresh: boolean }>`
    select c.status = 'active' as enrolled,
      exists (
        select 1 from mfa_step_up s
        where s.session_id = ${sessionId} and s.user_id = ${userId}
          and s.verified_at > now() - interval '12 hours'
      ) as fresh
    from mfa_credentials c
    where c.user_id = ${userId}`;
  const row = rows[0];
  return stepUpDecision({
    sessionBound: true,
    enrolled: Boolean(row?.enrolled),
    fresh: Boolean(row?.fresh),
  });
}

export async function beginEnrolment(sql: Sql, userId: string, email: string) {
  const existing = await sql<{ status: string }>`select status from mfa_credentials where user_id = ${userId}`;
  if (existing[0]?.status === "active") return { error: "A second factor is already enrolled. Replace it with a recovery code." };
  const secret = base32Encode(randomBytes(20));
  const ciphertext = sealSecret(secret);
  await sql`insert into mfa_credentials (user_id, secret_ciphertext, status)
    values (${userId}, ${ciphertext}, 'pending')
    on conflict (user_id) do update set secret_ciphertext = ${ciphertext}, status = 'pending', last_accepted_step = null, confirmed_at = null`;
  const label = email || userId;
  const otpauth = `otpauth://totp/Ashcombe-Vantoris:${encodeURIComponent(label)}?secret=${secret}&issuer=Ashcombe-Vantoris&algorithm=SHA1&digits=6&period=30`;
  return { secret, otpauth };
}

async function credential(sql: Sql, userId: string) {
  const rows = await sql<{ secret_ciphertext: string; status: string; last_accepted_step: string | null }>`
    select secret_ciphertext, status, last_accepted_step::text as last_accepted_step from mfa_credentials where user_id = ${userId}`;
  return rows[0] ?? null;
}

async function sessionOwned(sql: Sql, userId: string, sessionId: string) {
  const rows = await sql<{ id: string }>`
    select "id" from "session" where "id" = ${sessionId} and "userId" = ${userId} and "expiresAt" > now()`;
  return Boolean(rows[0]);
}

async function grant(sql: Sql, userId: string, sessionId: string, method: "totp" | "recovery") {
  if (!(await sessionOwned(sql, userId, sessionId))) return "This session cannot be confirmed.";
  await sql`insert into mfa_step_up (session_id, user_id, method, verified_at)
    values (${sessionId}, ${userId}, ${method}, now())
    on conflict (session_id) do update set user_id = ${userId}, method = ${method}, verified_at = now()`;
  return null;
}

export async function confirmEnrolment(sql: Sql, userId: string, sessionId: string | null, code: string) {
  if (!sessionId) return { error: "This session is not bound." };
  if (await locked(sql, userId)) return { error: "Too many attempts. Wait and try again." };
  const row = await credential(sql, userId);
  if (!row || row.status !== "pending") return { error: "There is no enrolment waiting for a code." };
  const matched = matchTotp(openSecret(row.secret_ciphertext), code, Date.now(), null);
  if (matched === null) {
    await attempt(sql, userId, false);
    return { error: "That code was not accepted." };
  }
  await sql`update mfa_credentials set status = 'active', confirmed_at = now(), last_accepted_step = ${matched.toString()}::bigint where user_id = ${userId}`;
  await sql`delete from mfa_recovery_codes where user_id = ${userId}`;
  const codes = Array.from({ length: 8 }, recoveryCode);
  for (const plain of codes) {
    await sql`insert into mfa_recovery_codes (id, user_id, code_hash) values (${id("mrc")}, ${userId}, ${hashCode(userId, plain)})`;
  }
  await attempt(sql, userId, true);
  const denied = await grant(sql, userId, sessionId, "totp");
  if (denied) return { error: denied };
  return { recoveryCodes: codes };
}

export async function presentFactor(sql: Sql, userId: string, sessionId: string | null, code: string) {
  if (!sessionId) return { error: "This session is not bound." };
  if (await locked(sql, userId)) return { error: "Too many attempts. Wait and try again." };
  const row = await credential(sql, userId);
  if (!row || row.status !== "active") return { error: "Enrol a second factor first." };
  const last = row.last_accepted_step === null ? null : BigInt(row.last_accepted_step);
  const matched = matchTotp(openSecret(row.secret_ciphertext), code, Date.now(), last);
  if (matched === null) {
    await attempt(sql, userId, false);
    return { error: "That code was not accepted." };
  }
  await sql`update mfa_credentials set last_accepted_step = ${matched.toString()}::bigint where user_id = ${userId}`;
  await attempt(sql, userId, true);
  const denied = await grant(sql, userId, sessionId, "totp");
  if (denied) return { error: denied };
  return { ok: true as const };
}

export async function presentRecovery(sql: Sql, userId: string, sessionId: string | null, code: string) {
  if (!sessionId) return { error: "This session is not bound." };
  if (await locked(sql, userId)) return { error: "Too many attempts. Wait and try again." };
  const digest = hashCode(userId, code);
  const rows = await sql<{ id: string; code_hash: string }>`
    select id, code_hash from mfa_recovery_codes where user_id = ${userId} and used_at is null`;
  const found = rows.find((row) => {
    const left = Buffer.from(row.code_hash);
    const right = Buffer.from(digest);
    return left.length === right.length && timingSafeEqual(left, right);
  });
  if (!found) {
    await attempt(sql, userId, false);
    return { error: "That recovery code was not accepted." };
  }
  await sql`update mfa_recovery_codes set used_at = now() where id = ${found.id} and used_at is null`;
  await attempt(sql, userId, true);
  const denied = await grant(sql, userId, sessionId, "recovery");
  if (denied) return { error: denied };
  return { ok: true as const };
}

export async function replaceWithRecovery(sql: Sql, userId: string, sessionId: string | null, code: string, email: string) {
  const presented = await presentRecovery(sql, userId, sessionId, code);
  if ("error" in presented && presented.error) return presented;
  const secret = base32Encode(randomBytes(20));
  await sql`update mfa_credentials set secret_ciphertext = ${sealSecret(secret)}, status = 'pending', last_accepted_step = null, confirmed_at = null where user_id = ${userId}`;
  await sql`delete from mfa_step_up where user_id = ${userId}`;
  const otpauth = `otpauth://totp/Ashcombe-Vantoris:${encodeURIComponent(email || userId)}?secret=${secret}&issuer=Ashcombe-Vantoris&algorithm=SHA1&digits=6&period=30`;
  return { secret, otpauth };
}

export async function securityView(sql: Sql, userId: string, sessionId: string | null) {
  const cred = await sql<{ status: string }>`select status from mfa_credentials where user_id = ${userId}`;
  const remaining = await sql<{ n: number }>`select count(*) as n from mfa_recovery_codes where user_id = ${userId} and used_at is null`;
  const fresh = sessionId ? await readStepUp(sql, userId, sessionId) : "This session is not bound, so privileged actions stay closed.";
  const sessions = await sql<{ id: string; created_at: string; ip: string; agent: string }>`
    select "id", "createdAt"::text as created_at, coalesce("ipAddress", '') as ip, coalesce("userAgent", '') as agent
    from "session" where "userId" = ${userId} and "expiresAt" > now() order by "createdAt" desc`;
  return {
    status: cred[0]?.status ?? "absent",
    steppedUp: fresh === null,
    stepUp: fresh,
    sessionBound: Boolean(sessionId),
    recoveryRemaining: Number(remaining[0]?.n ?? 0),
    sessions: sessions.map((session) => ({ ...session, current: session.id === sessionId })),
  };
}

export async function revokeOtherSessions(sql: Sql, userId: string, sessionId: string | null) {
  const denied = await readStepUp(sql, userId, sessionId);
  if (denied) return { error: denied };
  await sql`delete from mfa_step_up where user_id = ${userId} and session_id <> ${sessionId}`;
  await sql`delete from "session" where "userId" = ${userId} and "id" <> ${sessionId}`;
  return { ok: true as const };
}
