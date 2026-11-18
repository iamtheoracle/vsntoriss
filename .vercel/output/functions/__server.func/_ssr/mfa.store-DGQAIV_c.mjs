import { i as TSS_SERVER_FUNCTION } from "./ssr.mjs";
import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/mfa.store-DGQAIV_c.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function key() {
	const material = process.env.BETTER_AUTH_SECRET?.trim() || process.env.MFA_KEY?.trim();
	if (!material) throw new Error("MFA_KEY or BETTER_AUTH_SECRET is required to protect the second factor.");
	return createHash("sha256").update(material).digest();
}
function sealSecret(plain) {
	const iv = randomBytes(12);
	const cipher = createCipheriv("aes-256-gcm", key(), iv);
	const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
	const tag = cipher.getAuthTag();
	return Buffer.concat([
		iv,
		tag,
		encrypted
	]).toString("base64url");
}
function openSecret(payload) {
	const raw = Buffer.from(payload, "base64url");
	const iv = raw.subarray(0, 12);
	const tag = raw.subarray(12, 28);
	const encrypted = raw.subarray(28);
	const decipher = createDecipheriv("aes-256-gcm", key(), iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
/** Officer step-up policy. Sign-in alone is not this factor. */
function stepUpDecision(input) {
	if (!input.sessionBound) return "This session is not bound, so privileged actions stay closed.";
	if (!input.enrolled || !input.fresh) return "A second factor is required before this action.";
	return null;
}
var ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
function base32Encode(data) {
	let bits = 0;
	let value = 0;
	let output = "";
	for (const byte of data) {
		value = value << 8 | byte;
		bits += 8;
		while (bits >= 5) {
			output += ALPHABET[value >>> bits - 5 & 31];
			bits -= 5;
		}
	}
	if (bits > 0) output += ALPHABET[value << 5 - bits & 31];
	return output;
}
function base32Decode(input) {
	const clean = input.replace(/=+$/g, "").replace(/\s+/g, "").toUpperCase();
	let bits = 0;
	let value = 0;
	const bytes = [];
	for (const char of clean) {
		const index = ALPHABET.indexOf(char);
		if (index < 0) throw new Error("Invalid base32.");
		value = value << 5 | index;
		bits += 5;
		if (bits >= 8) {
			bytes.push(value >>> bits - 8 & 255);
			bits -= 8;
		}
	}
	return Buffer.from(bytes);
}
function hotp(key, counter, digits = 6) {
	const buf = Buffer.alloc(8);
	buf.writeBigUInt64BE(counter);
	const hmac = createHmac("sha1", key).update(buf).digest();
	const offset = hmac[hmac.length - 1] & 15;
	const bin = hmac.readUInt32BE(offset) & 2147483647;
	return String(bin % 10 ** digits).padStart(digits, "0");
}
function totpAt(secret, timeMs, digits = 6, stepSeconds = 30) {
	const counter = BigInt(Math.floor(timeMs / 1e3 / stepSeconds));
	return {
		code: hotp(base32Decode(secret), counter, digits),
		counter
	};
}
function matchTotp(secret, code, timeMs = Date.now(), lastAccepted = null) {
	const cleaned = code.replace(/\s+/g, "");
	if (!/^\d{6}$/.test(cleaned)) return null;
	for (const skew of [
		-1,
		0,
		1
	]) {
		const at = totpAt(secret, timeMs + skew * 3e4);
		if (lastAccepted !== null && at.counter <= lastAccepted) continue;
		const left = Buffer.from(at.code);
		const right = Buffer.from(cleaned);
		if (left.length === right.length && timingSafeEqual(left, right)) return at.counter;
	}
	return null;
}
function id(prefix) {
	return `${prefix}_${crypto.randomUUID()}`;
}
function hashCode(userId, code) {
	return createHash("sha256").update(`${userId}:${code.replace(/\s+/g, "").toUpperCase()}`).digest("hex");
}
function recoveryCode() {
	return randomBytes(6).toString("hex").toUpperCase().match(/.{4}/g)?.join("-") ?? "";
}
async function locked(sql, userId) {
	const rows = await sql`
    select count(*) as n from mfa_attempts
    where user_id = ${userId} and succeeded = false and created_at > now() - interval '15 minutes'`;
	return Number(rows[0]?.n ?? 0) >= 8;
}
async function attempt(sql, userId, succeeded) {
	await sql`insert into mfa_attempts (id, user_id, succeeded) values (${id("mfa")}, ${userId}, ${succeeded})`;
}
async function readStepUp(sql, userId, sessionId) {
	if (!sessionId) return stepUpDecision({
		sessionBound: false,
		enrolled: false,
		fresh: false
	});
	const row = (await sql`
    select c.status = 'active' as enrolled,
      exists (
        select 1 from mfa_step_up s
        where s.session_id = ${sessionId} and s.user_id = ${userId}
          and s.verified_at > now() - interval '12 hours'
      ) as fresh
    from mfa_credentials c
    where c.user_id = ${userId}`)[0];
	return stepUpDecision({
		sessionBound: true,
		enrolled: Boolean(row?.enrolled),
		fresh: Boolean(row?.fresh)
	});
}
async function beginEnrolment(sql, userId, email) {
	if ((await sql`select status from mfa_credentials where user_id = ${userId}`)[0]?.status === "active") return { error: "A second factor is already enrolled. Replace it with a recovery code." };
	const secret = base32Encode(randomBytes(20));
	const ciphertext = sealSecret(secret);
	await sql`insert into mfa_credentials (user_id, secret_ciphertext, status)
    values (${userId}, ${ciphertext}, 'pending')
    on conflict (user_id) do update set secret_ciphertext = ${ciphertext}, status = 'pending', last_accepted_step = null, confirmed_at = null`;
	return {
		secret,
		otpauth: `otpauth://totp/Ashcombe-Vantoris:${encodeURIComponent(email || userId)}?secret=${secret}&issuer=Ashcombe-Vantoris&algorithm=SHA1&digits=6&period=30`
	};
}
async function credential(sql, userId) {
	return (await sql`
    select secret_ciphertext, status, last_accepted_step::text as last_accepted_step from mfa_credentials where user_id = ${userId}`)[0] ?? null;
}
async function sessionOwned(sql, userId, sessionId) {
	const rows = await sql`
    select "id" from "session" where "id" = ${sessionId} and "userId" = ${userId} and "expiresAt" > now()`;
	return Boolean(rows[0]);
}
async function grant(sql, userId, sessionId, method) {
	if (!await sessionOwned(sql, userId, sessionId)) return "This session cannot be confirmed.";
	await sql`insert into mfa_step_up (session_id, user_id, method, verified_at)
    values (${sessionId}, ${userId}, ${method}, now())
    on conflict (session_id) do update set user_id = ${userId}, method = ${method}, verified_at = now()`;
	return null;
}
async function confirmEnrolment(sql, userId, sessionId, code) {
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
	for (const plain of codes) await sql`insert into mfa_recovery_codes (id, user_id, code_hash) values (${id("mrc")}, ${userId}, ${hashCode(userId, plain)})`;
	await attempt(sql, userId, true);
	const denied = await grant(sql, userId, sessionId, "totp");
	if (denied) return { error: denied };
	return { recoveryCodes: codes };
}
async function presentFactor(sql, userId, sessionId, code) {
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
	return { ok: true };
}
async function presentRecovery(sql, userId, sessionId, code) {
	if (!sessionId) return { error: "This session is not bound." };
	if (await locked(sql, userId)) return { error: "Too many attempts. Wait and try again." };
	const digest = hashCode(userId, code);
	const found = (await sql`
    select id, code_hash from mfa_recovery_codes where user_id = ${userId} and used_at is null`).find((row) => {
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
	return { ok: true };
}
async function replaceWithRecovery(sql, userId, sessionId, code, email) {
	const presented = await presentRecovery(sql, userId, sessionId, code);
	if ("error" in presented && presented.error) return presented;
	const secret = base32Encode(randomBytes(20));
	await sql`update mfa_credentials set secret_ciphertext = ${sealSecret(secret)}, status = 'pending', last_accepted_step = null, confirmed_at = null where user_id = ${userId}`;
	await sql`delete from mfa_step_up where user_id = ${userId}`;
	return {
		secret,
		otpauth: `otpauth://totp/Ashcombe-Vantoris:${encodeURIComponent(email || userId)}?secret=${secret}&issuer=Ashcombe-Vantoris&algorithm=SHA1&digits=6&period=30`
	};
}
async function securityView(sql, userId, sessionId) {
	const cred = await sql`select status from mfa_credentials where user_id = ${userId}`;
	const remaining = await sql`select count(*) as n from mfa_recovery_codes where user_id = ${userId} and used_at is null`;
	const fresh = sessionId ? await readStepUp(sql, userId, sessionId) : "This session is not bound, so privileged actions stay closed.";
	const sessions = await sql`
    select "id", "createdAt"::text as created_at, coalesce("ipAddress", '') as ip, coalesce("userAgent", '') as agent
    from "session" where "userId" = ${userId} and "expiresAt" > now() order by "createdAt" desc`;
	return {
		status: cred[0]?.status ?? "absent",
		steppedUp: fresh === null,
		stepUp: fresh,
		sessionBound: Boolean(sessionId),
		recoveryRemaining: Number(remaining[0]?.n ?? 0),
		sessions: sessions.map((session) => ({
			...session,
			current: session.id === sessionId
		}))
	};
}
async function revokeOtherSessions(sql, userId, sessionId) {
	const denied = await readStepUp(sql, userId, sessionId);
	if (denied) return { error: denied };
	await sql`delete from mfa_step_up where user_id = ${userId} and session_id <> ${sessionId}`;
	await sql`delete from "session" where "userId" = ${userId} and "id" <> ${sessionId}`;
	return { ok: true };
}
//#endregion
export { presentRecovery as a, revokeOtherSessions as c, presentFactor as i, securityView as l, confirmEnrolment as n, readStepUp as o, createServerRpc as r, replaceWithRecovery as s, beginEnrolment as t };
