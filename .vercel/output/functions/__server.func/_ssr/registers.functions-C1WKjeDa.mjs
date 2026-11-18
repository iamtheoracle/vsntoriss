import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DGfkxNi8.mjs";
import { t as sessionMiddleware } from "./session.middleware-DE4ULBFa.mjs";
import { r as createServerRpc } from "./mfa.store-DGQAIV_c.mjs";
import { c as stepUpBlock, r as confirmDelegationRecord, t as appointmentRefusal } from "./mfa.server-Bd82LlpG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/registers.functions-C1WKjeDa.js
var READ = [
	"executive",
	"operations",
	"compliance",
	"audit",
	"relationship"
];
function id(prefix) {
	return `${prefix}_${crypto.randomUUID()}`;
}
function text(value, max) {
	const next = String(value ?? "").trim();
	if (!next || next.length > max) return "";
	return next;
}
function institutionOf(value) {
	return value === "vantoris" ? "vantoris" : value === "ashcombe" ? "ashcombe" : "";
}
async function audit(actor, institution, action, entity, entityId, detail) {
	await (await getSql())`insert into audit_events (id, institution, actor_user_id, action, entity, entity_id, detail)
    values (${id("aud")}, ${institution}, ${actor}, ${action}, ${entity}, ${entityId}, ${detail})`;
}
async function profilesOf(userId) {
	return (await getSql())`select id, user_id, institution, kind, role, status, display_name from profiles where user_id = ${userId}`;
}
function staff(profiles, institution, roles) {
	return profiles.find((profile) => profile.institution === institution && profile.kind === "staff" && profile.status === "active" && roles.includes(profile.role));
}
async function notify(userId, institution, body) {
	await (await getSql())`insert into notifications (id, user_id, institution, body) values (${id("ntf")}, ${userId}, ${institution}, ${body})`;
}
var publicPublications_createServerFn_handler = createServerRpc({
	id: "d7284332a5b5acec8b8d4202168b714ff8a1c3ba33e0173406c633edf10fbed0",
	name: "publicPublications",
	filename: "src/lib/registers.functions.ts"
}, (opts) => publicPublications.__executeServer(opts));
var publicPublications = createServerFn({ method: "GET" }).validator((institution) => institution).handler(publicPublications_createServerFn_handler, async ({ data }) => {
	const institution = institutionOf(data);
	if (!institution) return [];
	return (await getSql())`
      select title, summary, created_at::text as created_at from publications
      where institution = ${institution} and status = 'published'
      order by created_at desc limit 20`;
});
var clientDesk_createServerFn_handler = createServerRpc({
	id: "366819b2fd01b91bac10789a89318645ade4ec905155985859b64143157b8fe2",
	name: "clientDesk",
	filename: "src/lib/registers.functions.ts"
}, (opts) => clientDesk.__executeServer(opts));
var clientDesk = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(clientDesk_createServerFn_handler, async ({ context }) => {
	if (!(await profilesOf(context.userId)).find((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active")) return { allowed: false };
	const sql = await getSql();
	return {
		allowed: true,
		cards: await sql`
      select id, label, status, note, created_at::text as created_at from cards
      where client_user_id = ${context.userId} order by created_at desc`,
		documents: await sql`
      select id, title, kind, body, created_at::text as created_at from documents
      where institution = 'ashcombe' and classification = 'client' and owner_user_id = ${context.userId}
      order by created_at desc`,
		statements: await sql`
      select s.id, s.period_label, s.opening_cents, s.closing_cents, s.line_count, s.created_at::text as created_at, a.currency
      from statement_issues s join accounts a on a.id = s.account_id
      where a.client_user_id = ${context.userId} order by s.created_at desc`,
		complaints: await sql`
      select id, reference, subject, status from complaints
      where institution = 'ashcombe' and created_by = ${context.userId} order by created_at desc`,
		limits: await sql`
      select currency, max_cents from approval_limits where institution = 'ashcombe' and status = 'active'`,
		sessions: await sql`
      select "id", "createdAt"::text as created_at, "expiresAt"::text as expires_at,
        coalesce("ipAddress", '') as ip, coalesce("userAgent", '') as agent
      from "session" where "userId" = ${context.userId} order by "createdAt" desc`
	};
});
var requestCard_createServerFn_handler = createServerRpc({
	id: "571cbae0cd746e6444e3a7dcc0f74a60d9d0d07f4adf952e2d33bdff0a0ae8a6",
	name: "requestCard",
	filename: "src/lib/registers.functions.ts"
}, (opts) => requestCard.__executeServer(opts));
var requestCard = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(requestCard_createServerFn_handler, async ({ context, data }) => {
	if (!(await profilesOf(context.userId)).some((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active")) return { error: "An active private-client profile is required." };
	const accountId = text(data.accountId, 80);
	const label = text(data.label, 80);
	if (!accountId || !label) return { error: "Choose an account and a label." };
	const sql = await getSql();
	if (!(await sql`
      select id from accounts where id = ${accountId} and client_user_id = ${context.userId} and status = 'active'`)[0]) return { error: "Account not available." };
	const cardId = id("crd");
	await sql`insert into cards (id, account_id, client_user_id, label, status, maker_user_id, note)
      values (${cardId}, ${accountId}, ${context.userId}, ${label}, 'requested', ${context.userId},
        'Internal request only. No PAN and no scheme issuance.')`;
	await audit(context.userId, "ashcombe", "request_card", "card", cardId, label);
	return { ok: true };
});
var decideCard_createServerFn_handler = createServerRpc({
	id: "3124738d1abdde26cbeedb6ec83e2c646395b032c8a6f53c89c90c4f3edafe33",
	name: "decideCard",
	filename: "src/lib/registers.functions.ts"
}, (opts) => decideCard.__executeServer(opts));
var decideCard = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(decideCard_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!staff(await profilesOf(context.userId), "ashcombe", ["executive"])) return { error: "Executive approval is required." };
	const cardId = text(data.cardId, 80);
	const decision = data.decision === "approved_internal" || data.decision === "declined" ? data.decision : "";
	if (!cardId || !decision) return { error: "Incomplete decision." };
	const updated = await (await getSql())`
      update cards set status = ${decision}, checker_user_id = ${context.userId}
      where id = ${cardId} and status = 'requested' and maker_user_id <> ${context.userId}
      returning client_user_id`;
	if (!updated[0]) return { error: "Card request was not decided. You cannot approve your own request, and nothing is sent to a card scheme." };
	await notify(updated[0].client_user_id, "ashcombe", `Card request ${decision.replace("_", " ")}. No card has been issued to a network.`);
	await audit(context.userId, "ashcombe", "decide_card", "card", cardId, decision);
	return { ok: true };
});
var issueStatement_createServerFn_handler = createServerRpc({
	id: "0347fa9ff1c3b7f8b84f581a595462e06002d2060315aedc641a1c076b51855b",
	name: "issueStatement",
	filename: "src/lib/registers.functions.ts"
}, (opts) => issueStatement.__executeServer(opts));
var issueStatement = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(issueStatement_createServerFn_handler, async ({ context, data }) => {
	const mine = await profilesOf(context.userId);
	const accountId = text(data.accountId, 80);
	const periodLabel = text(data.periodLabel, 40);
	if (!accountId || !periodLabel) return { error: "Account and period label are required." };
	const client = mine.some((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active");
	const officer = staff(mine, "ashcombe", [
		"executive",
		"operations",
		"relationship"
	]);
	if (!client && !officer) return { error: "Not permitted." };
	const sql = await getSql();
	const account = (await sql`
      select id, client_user_id from accounts where id = ${accountId} and status = 'active'`)[0];
	if (!account) return { error: "Active account not found." };
	if (!officer && account.client_user_id !== context.userId) return { error: "That account is not yours." };
	const lines = await sql`
      select coalesce(sum(case when direction = 'credit' then amount_cents else -amount_cents end), 0) as closing_cents,
        count(*) as line_count
      from ledger_entries where account_id = ${accountId}`;
	const prior = await sql`
      select closing_cents from statement_issues where account_id = ${accountId} order by created_at desc limit 1`;
	const closing = Number(lines[0]?.closing_cents ?? 0);
	const opening = prior[0] ? Number(prior[0].closing_cents) : 0;
	const statementId = id("stm");
	await sql`insert into statement_issues (id, account_id, period_label, opening_cents, closing_cents, line_count, issued_by)
      values (${statementId}, ${accountId}, ${periodLabel}, ${opening}, ${closing}, ${Number(lines[0]?.line_count ?? 0)}, ${context.userId})`;
	await audit(context.userId, "ashcombe", "issue_statement", "statement", statementId, periodLabel);
	return { ok: true };
});
var fileComplaint_createServerFn_handler = createServerRpc({
	id: "8fbc8c7e36e6efefd89d11988cdd56753f1473b11e4a638a71c4eaaca27befac",
	name: "fileComplaint",
	filename: "src/lib/registers.functions.ts"
}, (opts) => fileComplaint.__executeServer(opts));
var fileComplaint = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(fileComplaint_createServerFn_handler, async ({ context, data }) => {
	const institution = institutionOf(data.institution);
	const subject = text(data.subject, 160);
	const detail = text(data.detail, 4e3);
	if (!institution || !subject || detail.length < 20) return { error: "Institution, subject and a full account are required." };
	const holder = (await profilesOf(context.userId)).find((profile) => profile.institution === institution && profile.status === "active");
	if (!holder) return { error: "An active profile at that institution is required." };
	const sql = await getSql();
	const reference = `${institution === "ashcombe" ? "APB-C" : "VPI-C"}-${Date.now().toString(36).toUpperCase()}`;
	const complaintId = id("cmp");
	await sql`insert into complaints (id, institution, reference, complainant, subject, detail, created_by)
      values (${complaintId}, ${institution}, ${reference}, ${holder.display_name}, ${subject}, ${detail}, ${context.userId})`;
	await audit(context.userId, institution, "file_complaint", "complaint", complaintId, reference);
	return { reference };
});
var closeComplaint_createServerFn_handler = createServerRpc({
	id: "59d78fcbb373e0e7c4fdc22a6ea916c841ca7cdfb03aa6b995d53b6271439982",
	name: "closeComplaint",
	filename: "src/lib/registers.functions.ts"
}, (opts) => closeComplaint.__executeServer(opts));
var closeComplaint = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(closeComplaint_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const complaintId = text(data.complaintId, 80);
	const sql = await getSql();
	const row = (await sql`
      select institution, created_by from complaints where id = ${complaintId} and status = 'open'`)[0];
	if (!row) return { error: "Open complaint not found." };
	if (!staff(await profilesOf(context.userId), row.institution, ["executive", "compliance"])) return { error: "Compliance authority is required." };
	if (row.created_by === context.userId) return { error: "You cannot close a complaint you filed." };
	if (!(await sql`
      update complaints set status = 'closed', owner_user_id = ${context.userId}
      where id = ${complaintId} and status = 'open' and created_by <> ${context.userId}
      returning id`)[0]) return { error: "Complaint was not closed." };
	await audit(context.userId, row.institution, "close_complaint", "complaint", complaintId, "closed");
	return { ok: true };
});
var revokeSession_createServerFn_handler = createServerRpc({
	id: "ca9ad2f09d5a6489278b9bcd39ab4534fc6f5f239dc5520e457811a0a0c760d1",
	name: "revokeSession",
	filename: "src/lib/registers.functions.ts"
}, (opts) => revokeSession.__executeServer(opts));
var revokeSession = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(revokeSession_createServerFn_handler, async ({ context, data }) => {
	const sessionId = text(data.sessionId, 80);
	if (!sessionId) return { error: "Session not found." };
	const sql = await getSql();
	if (!(await sql`
      delete from "session" where "id" = ${sessionId} and "userId" = ${context.userId} returning "id"`)[0]) return { error: "That session is not yours." };
	await sql`delete from mfa_step_up where session_id = ${sessionId} and user_id = ${context.userId}`;
	await audit(context.userId, "ashcombe", "revoke_session", "session", sessionId, "Ended one own session.");
	return { ok: true };
});
var ashcombeRegisters_createServerFn_handler = createServerRpc({
	id: "69315addcd3ebacebab9dd2a6f8fb60e8df7b0fa6cc7efa379c7187b362b6b89",
	name: "ashcombeRegisters",
	filename: "src/lib/registers.functions.ts"
}, (opts) => ashcombeRegisters.__executeServer(opts));
var ashcombeRegisters = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(ashcombeRegisters_createServerFn_handler, async ({ context }) => {
	const officer = staff(await profilesOf(context.userId), "ashcombe", READ);
	if (!officer) return {
		allowed: false,
		stepUp: null
	};
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return {
		allowed: false,
		stepUp: stepped
	};
	const sql = await getSql();
	const limits = await sql`
      select id, currency, max_cents, status, maker_user_id from approval_limits
      where institution = 'ashcombe' order by created_at desc`;
	const cards = await sql`
      select id, label, status, client_user_id, maker_user_id from cards order by created_at desc limit 40`;
	const documents = await sql`
      select id, title, kind, classification, owner_user_id from documents
      where institution = 'ashcombe' order by created_at desc limit 40`;
	const complaints = await sql`
      select id, reference, subject, status, created_by from complaints
      where institution = 'ashcombe' order by created_at desc limit 40`;
	const risks = await sql`
      select id, title, status from institution_risks where institution = 'ashcombe' order by created_at desc`;
	const incidents = await sql`
      select id, title, severity, status, reported_by from incidents where institution = 'ashcombe' order by created_at desc`;
	const policies = await sql`
      select id, title, status, owner_user_id from policies where institution = 'ashcombe' order by created_at desc`;
	const publications = await sql`
      select id, title, status, author_user_id from publications where institution = 'ashcombe' order by created_at desc`;
	const departments = await sql`
      select id, name, purpose from departments where institution = 'ashcombe' order by name`;
	const delegations = await sql`
      select id, from_user_id, to_user_id, scope, status, maker_user_id from delegations
      where institution = 'ashcombe' order by created_at desc`;
	const counts = await sql`
      select
        (select count(*) from obligations where status <> 'verified') as open_obligations,
        (select count(*) from obligations where status = 'verified') as verified_obligations,
        (select count(*) from complaints where institution = 'ashcombe' and status = 'open') as open_complaints,
        (select count(*) from incidents where institution = 'ashcombe' and status = 'open') as open_incidents,
        (select count(*) from payment_instructions where status not in ('settled', 'rejected')) as payments_open,
        (select coalesce(sum(case when direction = 'credit' then amount_cents else -amount_cents end), 0) from ledger_entries) as client_funds_cents`;
	return {
		allowed: true,
		role: officer.role,
		self: context.userId,
		limits,
		cards,
		documents,
		complaints,
		risks,
		incidents,
		policies,
		publications,
		departments,
		delegations,
		counts: counts[0]
	};
});
var appointOfficer_createServerFn_handler = createServerRpc({
	id: "13f7e6559a71414039ecb4d9a7fa7f50be27743a5fe87fc980b85e14e6a0a825",
	name: "appointOfficer",
	filename: "src/lib/registers.functions.ts"
}, (opts) => appointOfficer.__executeServer(opts));
var appointOfficer = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(appointOfficer_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const institution = institutionOf(data.institution);
	const userId = text(data.userId, 80);
	const displayName = text(data.displayName, 80);
	const role = text(data.role, 40);
	if (!institution || !userId || !displayName || !role) return { error: "Institution, person, name and role are required." };
	const actor = staff(await profilesOf(context.userId), institution, ["executive"]);
	const refusal = appointmentRefusal(actor?.role ?? "", role, userId === context.userId);
	if (refusal) return { error: refusal };
	const sql = await getSql();
	if (!(await sql`select id from "user" where id = ${userId}`)[0]) return { error: "That person has no sign-in identity yet." };
	const inserted = await sql`
      insert into profiles (id, user_id, institution, kind, role, status, display_name)
      values (${id("prf")}, ${userId}, ${institution}, 'staff', ${role}, 'active', ${displayName})
      on conflict (user_id, institution, kind) do nothing
      returning id`;
	if (!inserted[0]) return { error: "This person already has a staff profile at that institution." };
	await notify(userId, institution, `You have been appointed ${role}. This does not grant the other institution's authority.`);
	await audit(context.userId, institution, "appoint_officer", "profile", inserted[0].id, role);
	return { ok: true };
});
var proposeLimit_createServerFn_handler = createServerRpc({
	id: "adfdc3907547ba7ac814dfd72bc6b7c3f7a5d83d8b4c1b726499f3afa2bf0cd2",
	name: "proposeLimit",
	filename: "src/lib/registers.functions.ts"
}, (opts) => proposeLimit.__executeServer(opts));
var proposeLimit = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(proposeLimit_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!staff(await profilesOf(context.userId), "ashcombe", ["executive", "operations"])) return { error: "Operations authority is required." };
	const currency = data.currency === "EUR" || data.currency === "GBP" || data.currency === "USD" ? data.currency : "";
	const maxCents = Number(data.maxCents);
	if (!currency || !Number.isInteger(maxCents) || maxCents <= 0) return { error: "Currency and a whole-cent ceiling are required." };
	const sql = await getSql();
	const limitId = id("lim");
	await sql`insert into approval_limits (id, institution, currency, max_cents, status, maker_user_id)
      values (${limitId}, 'ashcombe', ${currency}, ${maxCents}, 'proposed', ${context.userId})`;
	await audit(context.userId, "ashcombe", "propose_limit", "limit", limitId, `${currency} ${maxCents}`);
	return { ok: true };
});
var approveLimit_createServerFn_handler = createServerRpc({
	id: "35969a2a116e2adfd29d63d3207923e541987190ab6a734efea9f8b7cefd5b00",
	name: "approveLimit",
	filename: "src/lib/registers.functions.ts"
}, (opts) => approveLimit.__executeServer(opts));
var approveLimit = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(approveLimit_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!staff(await profilesOf(context.userId), "ashcombe", ["executive"])) return { error: "Executive approval is required." };
	const limitId = text(data.limitId, 80);
	if (!(await (await getSql())`
      with approved as (
        update approval_limits set status = 'active', checker_user_id = ${context.userId}
        where id = ${limitId} and institution = 'ashcombe' and status = 'proposed' and maker_user_id <> ${context.userId}
        returning id, currency
      ),
      retired as (
        update approval_limits limit_row set status = 'superseded'
        from approved
        where limit_row.institution = 'ashcombe' and limit_row.currency = approved.currency
          and limit_row.status = 'active' and limit_row.id <> approved.id
        returning limit_row.id
      )
      select id from approved`)[0]) return { error: "Limit was not approved. The officer who proposed it cannot approve it." };
	await audit(context.userId, "ashcombe", "approve_limit", "limit", limitId, "active");
	return { ok: true };
});
var fileDocument_createServerFn_handler = createServerRpc({
	id: "ef9d5e6144bd9315c1de99293beea3c76d654c9f75d949fc0ca5b28cf93c8243",
	name: "fileDocument",
	filename: "src/lib/registers.functions.ts"
}, (opts) => fileDocument.__executeServer(opts));
var fileDocument = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(fileDocument_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const institution = institutionOf(data.institution);
	const ownerUserId = text(data.ownerUserId, 80);
	const title = text(data.title, 160);
	const kind = text(data.kind, 40);
	const body = text(data.body, 8e3);
	const classification = data.classification === "client" || data.classification === "internal" ? data.classification : "";
	if (!institution || !ownerUserId || !title || !kind || body.length < 10 || !classification) return { error: "A complete document record is required. Paste the text or a storage reference. Nothing is virus-scanned here." };
	if (!staff(await profilesOf(context.userId), institution, [
		"executive",
		"compliance",
		"relationship",
		"operations"
	])) return { error: "Not permitted." };
	const sql = await getSql();
	const docId = id("doc");
	await sql`insert into documents (id, institution, owner_user_id, title, kind, body, classification, created_by)
      values (${docId}, ${institution}, ${ownerUserId}, ${title}, ${kind}, ${body}, ${classification}, ${context.userId})`;
	await audit(context.userId, institution, "file_document", "document", docId, title);
	return { ok: true };
});
var addRisk_createServerFn_handler = createServerRpc({
	id: "b5e4379d7e1636dfa287ffc0ec914bfeba57b3bdcbd2d3a67bc6082df82f9fd6",
	name: "addRisk",
	filename: "src/lib/registers.functions.ts"
}, (opts) => addRisk.__executeServer(opts));
var addRisk = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(addRisk_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const institution = institutionOf(data.institution);
	const title = text(data.title, 160);
	const detail = text(data.detail, 4e3);
	if (!institution || !title || !detail) return { error: "Title and detail are required." };
	if (!staff(await profilesOf(context.userId), institution, ["executive", "compliance"])) return { error: "Compliance authority is required." };
	const sql = await getSql();
	const riskId = id("irk");
	await sql`insert into institution_risks (id, institution, title, detail, owner_user_id)
      values (${riskId}, ${institution}, ${title}, ${detail}, ${context.userId})`;
	await audit(context.userId, institution, "add_institution_risk", "risk", riskId, title);
	return { ok: true };
});
var reportIncident_createServerFn_handler = createServerRpc({
	id: "42bb3b6549b630a724d8e494d2d72feb630a42ba49f10c881b7e488931d256db",
	name: "reportIncident",
	filename: "src/lib/registers.functions.ts"
}, (opts) => reportIncident.__executeServer(opts));
var reportIncident = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(reportIncident_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const institution = institutionOf(data.institution);
	const title = text(data.title, 160);
	const detail = text(data.detail, 4e3);
	const severity = data.severity === "low" || data.severity === "high" ? data.severity : "";
	if (!institution || !title || !detail || !severity) return { error: "Title, detail and severity are required." };
	if (!staff(await profilesOf(context.userId), institution, READ)) return { error: "Staff authority is required." };
	const sql = await getSql();
	const incidentId = id("inc");
	await sql`insert into incidents (id, institution, title, detail, severity, reported_by)
      values (${incidentId}, ${institution}, ${title}, ${detail}, ${severity}, ${context.userId})`;
	await audit(context.userId, institution, "report_incident", "incident", incidentId, severity);
	return { ok: true };
});
var closeIncident_createServerFn_handler = createServerRpc({
	id: "51c079908985ccc4974e82e5f2d3d567a1ccc9e9677a66c2c2fbaca526d04e24",
	name: "closeIncident",
	filename: "src/lib/registers.functions.ts"
}, (opts) => closeIncident.__executeServer(opts));
var closeIncident = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(closeIncident_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const incidentId = text(data.incidentId, 80);
	const sql = await getSql();
	const row = (await sql`
      select institution, reported_by from incidents where id = ${incidentId} and status = 'open'`)[0];
	if (!row) return { error: "Open incident not found." };
	if (!staff(await profilesOf(context.userId), row.institution, ["executive"])) return { error: "Executive closure is required." };
	if (row.reported_by === context.userId) return { error: "You cannot close an incident you reported." };
	if (!(await sql`
      update incidents set status = 'closed', closed_by = ${context.userId}
      where id = ${incidentId} and status = 'open' and reported_by <> ${context.userId}
      returning id`)[0]) return { error: "Incident was not closed." };
	await audit(context.userId, row.institution, "close_incident", "incident", incidentId, "closed");
	return { ok: true };
});
var draftPolicy_createServerFn_handler = createServerRpc({
	id: "1a6effab89043cb0b19fdcf41aaefa54821fd0b61ee98048c5f46e92bd546a30",
	name: "draftPolicy",
	filename: "src/lib/registers.functions.ts"
}, (opts) => draftPolicy.__executeServer(opts));
var draftPolicy = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(draftPolicy_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const institution = institutionOf(data.institution);
	const title = text(data.title, 160);
	const body = text(data.body, 8e3);
	if (!institution || !title || body.length < 20) return { error: "A policy needs a title and text." };
	if (!staff(await profilesOf(context.userId), institution, ["executive", "compliance"])) return { error: "Compliance authority is required." };
	const sql = await getSql();
	const policyId = id("pol");
	await sql`insert into policies (id, institution, title, body, owner_user_id)
      values (${policyId}, ${institution}, ${title}, ${body}, ${context.userId})`;
	await audit(context.userId, institution, "draft_policy", "policy", policyId, title);
	return { ok: true };
});
var adoptPolicy_createServerFn_handler = createServerRpc({
	id: "2d94fefaac0685d97973855fc204d06d243c3aa63aec704eede308f119bc5b99",
	name: "adoptPolicy",
	filename: "src/lib/registers.functions.ts"
}, (opts) => adoptPolicy.__executeServer(opts));
var adoptPolicy = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(adoptPolicy_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const policyId = text(data.policyId, 80);
	const sql = await getSql();
	const row = (await sql`
      select institution from policies where id = ${policyId} and status = 'draft' and owner_user_id <> ${context.userId}`)[0];
	if (!row) return { error: "Draft not available to you. The author cannot adopt it." };
	if (!staff(await profilesOf(context.userId), row.institution, ["executive"])) return { error: "Executive adoption is required." };
	if (!(await sql`
      update policies set status = 'adopted', approved_by = ${context.userId}
      where id = ${policyId} and status = 'draft' and owner_user_id <> ${context.userId}
      returning id`)[0]) return { error: "Policy was not adopted." };
	await audit(context.userId, row.institution, "adopt_policy", "policy", policyId, "adopted");
	return { ok: true };
});
var draftPublication_createServerFn_handler = createServerRpc({
	id: "ee1ebd303068e0af3c9fd90ab34387d351dce02cc5e4a30c7a2e4f8ddd7184a6",
	name: "draftPublication",
	filename: "src/lib/registers.functions.ts"
}, (opts) => draftPublication.__executeServer(opts));
var draftPublication = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(draftPublication_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const institution = institutionOf(data.institution);
	const title = text(data.title, 160);
	const summary = text(data.summary, 2e3);
	if (!institution || !title || summary.length < 20) return { error: "Title and summary are required." };
	if (!staff(await profilesOf(context.userId), institution, [
		"executive",
		"compliance",
		"relationship"
	])) return { error: "Not permitted." };
	const sql = await getSql();
	const publicationId = id("pub");
	await sql`insert into publications (id, institution, title, summary, author_user_id)
      values (${publicationId}, ${institution}, ${title}, ${summary}, ${context.userId})`;
	await audit(context.userId, institution, "draft_publication", "publication", publicationId, title);
	return { ok: true };
});
var publishWork_createServerFn_handler = createServerRpc({
	id: "bd45861c3379fc2c94b81dd73c76e3afd44c1a9d4be8f1cfcf646bf1507eb298",
	name: "publishWork",
	filename: "src/lib/registers.functions.ts"
}, (opts) => publishWork.__executeServer(opts));
var publishWork = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(publishWork_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const publicationId = text(data.publicationId, 80);
	const sql = await getSql();
	const row = (await sql`
      select institution from publications where id = ${publicationId} and status = 'draft' and author_user_id <> ${context.userId}`)[0];
	if (!row) return { error: "The author cannot publish their own draft." };
	if (!staff(await profilesOf(context.userId), row.institution, ["executive"])) return { error: "Executive release is required." };
	if (!(await sql`
      update publications set status = 'published', published_by = ${context.userId}
      where id = ${publicationId} and status = 'draft' and author_user_id <> ${context.userId}
      returning id`)[0]) return { error: "Publication was not released." };
	await audit(context.userId, row.institution, "publish", "publication", publicationId, "published");
	return { ok: true };
});
var addDepartment_createServerFn_handler = createServerRpc({
	id: "02dad93c3919bd627c8c812726b281ff618ffbcd2d4e07aa4abaa12e07d6c6b1",
	name: "addDepartment",
	filename: "src/lib/registers.functions.ts"
}, (opts) => addDepartment.__executeServer(opts));
var addDepartment = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(addDepartment_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const institution = institutionOf(data.institution);
	const name = text(data.name, 80);
	const purpose = text(data.purpose, 400);
	if (!institution || !name || !purpose) return { error: "Name and purpose are required." };
	if (!staff(await profilesOf(context.userId), institution, ["executive"])) return { error: "Executive authority is required." };
	await (await getSql())`insert into departments (id, institution, name, purpose, created_by)
      values (${id("dep")}, ${institution}, ${name}, ${purpose}, ${context.userId})
      on conflict (institution, name) do nothing`;
	await audit(context.userId, institution, "add_department", "department", name, purpose);
	return { ok: true };
});
var proposeDelegation_createServerFn_handler = createServerRpc({
	id: "03bf0ab2320a7e69d1d506cec1726aacd912ff6c3389935ddea8d5b12e383010",
	name: "proposeDelegation",
	filename: "src/lib/registers.functions.ts"
}, (opts) => proposeDelegation.__executeServer(opts));
var proposeDelegation = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(proposeDelegation_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const institution = institutionOf(data.institution);
	const toUserId = text(data.toUserId, 80);
	const scope = text(data.scope, 400);
	if (!institution || !toUserId || scope.length < 10) return { error: "Name the person and the scope." };
	if (toUserId === context.userId) return { error: "You cannot delegate to yourself." };
	if (!staff(await profilesOf(context.userId), institution, ["executive"])) return { error: "Executive authority is required." };
	const sql = await getSql();
	const delegationId = id("del");
	await sql`insert into delegations (id, institution, from_user_id, to_user_id, scope, maker_user_id)
      values (${delegationId}, ${institution}, ${context.userId}, ${toUserId}, ${scope}, ${context.userId})`;
	await audit(context.userId, institution, "propose_delegation", "delegation", delegationId, "Record only. Authority is unchanged.");
	return { ok: true };
});
var confirmDelegation_createServerFn_handler = createServerRpc({
	id: "a67d85a3465ef66a0f9e7691bd095e50e7d41e3c667782906d07e52687ba0a25",
	name: "confirmDelegation",
	filename: "src/lib/registers.functions.ts"
}, (opts) => confirmDelegation.__executeServer(opts));
var confirmDelegation = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(confirmDelegation_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const delegationId = text(data.delegationId, 80);
	const sql = await getSql();
	const row = (await sql`
      select institution from delegations where id = ${delegationId} and status = 'proposed' and maker_user_id <> ${context.userId}`)[0];
	if (!row) return { error: "The proposer cannot confirm their own delegation." };
	if (!staff(await profilesOf(context.userId), row.institution, ["executive"])) return { error: "A different executive must confirm it." };
	if (!(await confirmDelegationRecord(sql, delegationId, context.userId))[0]) return { error: "Delegation was not confirmed. Roles are unchanged either way." };
	await audit(context.userId, row.institution, "confirm_delegation", "delegation", delegationId, "confirmed record; no role copied");
	return { ok: true };
});
var fileVantorisObligation_createServerFn_handler = createServerRpc({
	id: "b7c6b9f9bf3c7cd5dbec0ef20edcd593b0f8e048c7b6b6f837ef41a47015c0b3",
	name: "fileVantorisObligation",
	filename: "src/lib/registers.functions.ts"
}, (opts) => fileVantorisObligation.__executeServer(opts));
var fileVantorisObligation = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(fileVantorisObligation_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!staff(await profilesOf(context.userId), "vantoris", ["executive", "compliance"])) return { error: "Compliance authority is required." };
	const code = text(data.code, 20);
	const evidence = text(data.evidence, 240);
	if (!code.startsWith("VP-") || !evidence) return { error: "Evidence is required. This register is not the German banking tracker." };
	if (!(await (await getSql())`
      update institution_obligations set evidence_reference = ${evidence}, owner_user_id = ${context.userId}, approval_status = 'pending_approval'
      where code = ${code} and institution = 'vantoris' and approval_status <> 'verified'
      returning code`)[0]) return { error: "Obligation not updated." };
	await audit(context.userId, "vantoris", "file_institution_obligation", "obligation", code, evidence);
	return { ok: true };
});
var approveVantorisObligation_createServerFn_handler = createServerRpc({
	id: "9f970206d4074d11c0882a692d45683bf4344d2f1d8c798e3e8115582982e35e",
	name: "approveVantorisObligation",
	filename: "src/lib/registers.functions.ts"
}, (opts) => approveVantorisObligation.__executeServer(opts));
var approveVantorisObligation = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(approveVantorisObligation_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!staff(await profilesOf(context.userId), "vantoris", ["executive"])) return { error: "Executive approval is required." };
	const code = text(data.code, 20);
	if (!(await (await getSql())`
      update institution_obligations set status = 'verified', approval_status = 'verified', reviewer_user_id = ${context.userId}
      where code = ${code} and institution = 'vantoris' and approval_status = 'pending_approval'
        and owner_user_id <> ${context.userId} and evidence_reference is not null
      returning code`)[0]) return { error: "Verification refused. A different officer and evidence are both required." };
	await audit(context.userId, "vantoris", "verify_institution_obligation", "obligation", code, "verified");
	return { ok: true };
});
var vantorisRegisters_createServerFn_handler = createServerRpc({
	id: "52935a516a0b667f8ca0caf6827af9fe321018a29d5d894f4e9c19b393ef9c29",
	name: "vantorisRegisters",
	filename: "src/lib/registers.functions.ts"
}, (opts) => vantorisRegisters.__executeServer(opts));
var vantorisRegisters = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(vantorisRegisters_createServerFn_handler, async ({ context }) => {
	const officer = staff(await profilesOf(context.userId), "vantoris", READ);
	if (!officer) return {
		allowed: false,
		stepUp: null
	};
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return {
		allowed: false,
		stepUp: stepped
	};
	const sql = await getSql();
	const obligations = await sql`
      select code, title, description, status, approval_status, evidence_reference
      from institution_obligations where institution = 'vantoris' order by code`;
	const documents = await sql`
      select id, title, classification, owner_user_id from documents where institution = 'vantoris' order by created_at desc limit 30`;
	const complaints = await sql`
      select id, reference, subject, status, created_by from complaints where institution = 'vantoris' order by created_at desc limit 30`;
	const risks = await sql`
      select id, title, status from institution_risks where institution = 'vantoris' order by created_at desc`;
	const incidents = await sql`
      select id, title, severity, status, reported_by from incidents where institution = 'vantoris' order by created_at desc`;
	const policies = await sql`
      select id, title, status, owner_user_id from policies where institution = 'vantoris' order by created_at desc`;
	const publications = await sql`
      select id, title, status, author_user_id from publications where institution = 'vantoris' order by created_at desc`;
	const departments = await sql`
      select id, name, purpose from departments where institution = 'vantoris' order by name`;
	const delegations = await sql`
      select id, to_user_id, scope, status, maker_user_id from delegations where institution = 'vantoris' order by created_at desc`;
	const people = await sql`
      select count(*) as n from profiles where institution = 'vantoris' and kind = 'staff' and status = 'active'`;
	return {
		allowed: true,
		role: officer.role,
		self: context.userId,
		obligations,
		documents,
		complaints,
		risks,
		incidents,
		policies,
		publications,
		departments,
		delegations,
		staffCount: Number(people[0]?.n ?? 0)
	};
});
var memberDesk_createServerFn_handler = createServerRpc({
	id: "2d5e2b92b0d56c0729440b4f21a42566514f665bd74aff1a9594781819edc781",
	name: "memberDesk",
	filename: "src/lib/registers.functions.ts"
}, (opts) => memberDesk.__executeServer(opts));
var memberDesk = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(memberDesk_createServerFn_handler, async ({ context }) => {
	if (!(await profilesOf(context.userId)).find((profile) => profile.institution === "vantoris" && profile.kind === "member" && profile.status === "active")) return { allowed: false };
	const sql = await getSql();
	return {
		allowed: true,
		documents: await sql`
      select id, title, kind, body from documents
      where institution = 'vantoris' and classification = 'client' and owner_user_id = ${context.userId}
      order by created_at desc`,
		publications: await sql`
      select id, title, summary from publications where institution = 'vantoris' and status = 'published' order by created_at desc`
	};
});
//#endregion
export { addDepartment_createServerFn_handler, addRisk_createServerFn_handler, adoptPolicy_createServerFn_handler, appointOfficer_createServerFn_handler, approveLimit_createServerFn_handler, approveVantorisObligation_createServerFn_handler, ashcombeRegisters_createServerFn_handler, clientDesk_createServerFn_handler, closeComplaint_createServerFn_handler, closeIncident_createServerFn_handler, confirmDelegation_createServerFn_handler, decideCard_createServerFn_handler, draftPolicy_createServerFn_handler, draftPublication_createServerFn_handler, fileComplaint_createServerFn_handler, fileDocument_createServerFn_handler, fileVantorisObligation_createServerFn_handler, issueStatement_createServerFn_handler, memberDesk_createServerFn_handler, proposeDelegation_createServerFn_handler, proposeLimit_createServerFn_handler, publicPublications_createServerFn_handler, publishWork_createServerFn_handler, reportIncident_createServerFn_handler, requestCard_createServerFn_handler, revokeSession_createServerFn_handler, vantorisRegisters_createServerFn_handler };
