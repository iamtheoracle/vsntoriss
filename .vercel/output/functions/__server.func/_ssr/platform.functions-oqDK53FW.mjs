import { r as createServerFn } from "./ssr.mjs";
import { r as getSql } from "./db-DGfkxNi8.mjs";
import { t as sessionMiddleware } from "./session.middleware-DE4ULBFa.mjs";
import { r as createServerRpc } from "./mfa.store-DGQAIV_c.mjs";
import { a as postCheckedBranchReceipt, c as stepUpBlock, i as instructionBlockedByLimit, n as approveProposedAccount, o as reconcilePayment, s as reopenException } from "./mfa.server-Bd82LlpG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/platform.functions-oqDK53FW.js
function normaliseIban(value) {
	return value.replace(/\s+/g, "").toUpperCase();
}
function isValidIban(value) {
	const iban = normaliseIban(value);
	if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(iban)) return false;
	const rearranged = iban.slice(4) + iban.slice(0, 4);
	let remainder = 0;
	for (const char of rearranged) {
		const chunk = char >= "A" && char <= "Z" ? String(char.charCodeAt(0) - 55) : char;
		for (const digit of chunk) remainder = (remainder * 10 + Number(digit)) % 97;
	}
	return remainder === 1;
}
function id(prefix) {
	return `${prefix}_${crypto.randomUUID()}`;
}
async function audit(actor, institution, action, entity, entityId, detail) {
	await (await getSql())`insert into audit_events (id, institution, actor_user_id, action, entity, entity_id, detail)
    values (${id("aud")}, ${institution}, ${actor}, ${action}, ${entity}, ${entityId}, ${detail})`;
}
async function profilesOf(userId) {
	return (await getSql())`select id, user_id, institution, kind, role, status, display_name
    from profiles where user_id = ${userId}`;
}
function activeStaff(profiles, institution, roles) {
	return profiles.find((profile) => profile.institution === institution && profile.kind === "staff" && profile.status === "active" && roles.includes(profile.role));
}
var STAFF_READ = [
	"executive",
	"operations",
	"compliance",
	"audit",
	"relationship"
];
var MONEY = ["executive", "operations"];
var COMPLIANCE = ["executive", "compliance"];
function text(value, max) {
	const next = String(value ?? "").trim();
	if (!next || next.length > max) return "";
	return next;
}
var getAccess_createServerFn_handler = createServerRpc({
	id: "f86c3931e8593a08712d2a779abbbceebac3484fc39916930217fcf9970c0bf2",
	name: "getAccess",
	filename: "src/lib/platform.functions.ts"
}, (opts) => getAccess.__executeServer(opts));
var getAccess = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(getAccess_createServerFn_handler, async ({ context }) => {
	const sql = await getSql();
	const profiles = await profilesOf(context.userId);
	const counts = await sql`
      select institution, count(*) as n from profiles
      where kind = 'staff' and role = 'executive' and status = 'active'
      group by institution`;
	const has = (institution) => counts.some((row) => row.institution === institution && row.n > 0);
	const notes = await sql`
      select id, body, created_at::text as created_at from notifications
      where user_id = ${context.userId} order by created_at desc limit 12`;
	return {
		profiles,
		vacancies: {
			ashcombe: !has("ashcombe"),
			vantoris: !has("vantoris")
		},
		notes
	};
});
var bootstrapExecutive_createServerFn_handler = createServerRpc({
	id: "054bac981e791b7ca4010f4a24281975cae122d1ac0a6702131e57e59d0cb30b",
	name: "bootstrapExecutive",
	filename: "src/lib/platform.functions.ts"
}, (opts) => bootstrapExecutive.__executeServer(opts));
var bootstrapExecutive = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(bootstrapExecutive_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const institution = data.institution === "vantoris" ? "vantoris" : data.institution === "ashcombe" ? "ashcombe" : "";
	const displayName = text(data.displayName, 80);
	if (!institution || !displayName) return { error: "Institution and name are required." };
	const sql = await getSql();
	if ((await sql`
      select count(*) as n from profiles
      where institution = ${institution} and kind = 'staff' and role = 'executive' and status = 'active'`)[0]?.n) return { error: "An executive already exists. This path is closed." };
	const profileId = id("prf");
	await sql`insert into profiles (id, user_id, institution, kind, role, status, display_name)
      values (${profileId}, ${context.userId}, ${institution}, 'staff', 'executive', 'active', ${displayName})
      on conflict (user_id, institution, kind) do update
      set role = 'executive', status = 'active', display_name = ${displayName}`;
	await audit(context.userId, institution, "bootstrap_executive", "profile", profileId, "First executive. Path closes after this row.");
	return { ok: true };
});
var requestProfile_createServerFn_handler = createServerRpc({
	id: "ab252b472eb385f1337396e87623e5ce98ae5d1bfe31727d425f4f3abb8e9b24",
	name: "requestProfile",
	filename: "src/lib/platform.functions.ts"
}, (opts) => requestProfile.__executeServer(opts));
var requestProfile = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(requestProfile_createServerFn_handler, async ({ context, data }) => {
	const institution = data.institution === "vantoris" ? "vantoris" : data.institution === "ashcombe" ? "ashcombe" : "";
	const displayName = text(data.displayName, 80);
	if (!institution || !displayName) return { error: "Name is required." };
	const kind = institution === "ashcombe" ? "client" : "member";
	const role = institution === "ashcombe" ? "private_client" : "member";
	await (await getSql())`insert into profiles (id, user_id, institution, kind, role, status, display_name)
      values (${id("prf")}, ${context.userId}, ${institution}, ${kind}, ${role}, 'pending', ${displayName})
      on conflict (user_id, institution, kind) do nothing`;
	await audit(context.userId, institution, "request_profile", "profile", context.userId, kind);
	return { ok: true };
});
var decideProfile_createServerFn_handler = createServerRpc({
	id: "2d4c4d1270a0c0ac1bbc428f96b53cb78a5de4716c51928b198c8ba50b4c8f6e",
	name: "decideProfile",
	filename: "src/lib/platform.functions.ts"
}, (opts) => decideProfile.__executeServer(opts));
var decideProfile = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(decideProfile_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const decision = data.decision === "active" || data.decision === "suspended" ? data.decision : "";
	const profileId = text(data.profileId, 80);
	if (!decision || !profileId) return { error: "Incomplete decision." };
	const mine = await profilesOf(context.userId);
	const sql = await getSql();
	const target = (await sql`select id, user_id, institution, kind, role, status, display_name from profiles where id = ${profileId}`)[0];
	if (!target) return { error: "Profile not found." };
	if (target.user_id === context.userId) return { error: "You cannot decide your own profile." };
	if (target.role === "executive") return { error: "Executive authority is not granted from this action." };
	if (!activeStaff(mine, target.institution, ["executive"])) return { error: "Executive authority is required." };
	await sql`update profiles set status = ${decision} where id = ${profileId}`;
	await audit(context.userId, target.institution, "decide_profile", "profile", profileId, decision);
	return { ok: true };
});
var submitEnquiry_createServerFn_handler = createServerRpc({
	id: "29481e74710cce9c171ad39a2f63415addbff059d0aaae2c504be8232c57b62c",
	name: "submitEnquiry",
	filename: "src/lib/platform.functions.ts"
}, (opts) => submitEnquiry.__executeServer(opts));
var submitEnquiry = createServerFn({ method: "POST" }).validator((input) => input).handler(submitEnquiry_createServerFn_handler, async ({ data }) => {
	const institution = data.institution === "vantoris" ? "vantoris" : data.institution === "ashcombe" ? "ashcombe" : "";
	const fullName = text(data.fullName, 120);
	const email = text(data.email, 160);
	const country = text(data.country, 80);
	const topic = text(data.topic, 80);
	const message = text(data.message, 4e3);
	if (!institution || !fullName || !email.includes("@") || !country || !topic || message.length < 20) return { error: "Complete every field. The message needs at least 20 characters." };
	const sql = await getSql();
	const reference = `${institution === "ashcombe" ? "APB" : "VPI"}-${Date.now().toString(36).toUpperCase()}`;
	const enquiryId = id("enq");
	await sql`insert into enquiries (id, institution, reference, full_name, email, country, topic, message)
      values (${enquiryId}, ${institution}, ${reference}, ${fullName}, ${email}, ${country}, ${topic}, ${message})`;
	await sql`insert into audit_events (id, institution, actor_user_id, action, entity, entity_id, detail)
      values (${id("aud")}, ${institution}, 'public', 'enquiry_received', 'enquiry', ${enquiryId}, ${reference})`;
	return {
		reference,
		notice: "Your enquiry has been recorded for the operators responsible. It does not create an account. A member of staff will contact you."
	};
});
var issueKycLink_createServerFn_handler = createServerRpc({
	id: "aa248e39f3b473b2d099f41bfb1b521f03fb0f50fa3edd81b358922234084a87",
	name: "issueKycLink",
	filename: "src/lib/platform.functions.ts"
}, (opts) => issueKycLink.__executeServer(opts));
var issueKycLink = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(issueKycLink_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const enquiryId = text(data.enquiryId, 80);
	if (!activeStaff(await profilesOf(context.userId), "ashcombe", COMPLIANCE)) return { error: "Compliance authority is required." };
	const sql = await getSql();
	if ((await sql`select id, institution from enquiries where id = ${enquiryId}`)[0]?.institution !== "ashcombe") return { error: "Ashcombe enquiry not found." };
	const token = crypto.randomUUID().replace(/-/g, "");
	const inviteId = id("kyc");
	await sql`insert into kyc_invites (id, enquiry_id, token, issued_by, expires_at)
      values (${inviteId}, ${enquiryId}, ${token}, ${context.userId}, now() + interval '14 days')`;
	await audit(context.userId, "ashcombe", "issue_kyc_link", "kyc_invite", inviteId, enquiryId);
	return { token };
});
var readKycInvite_createServerFn_handler = createServerRpc({
	id: "2677bcc2d1b1ef4d80dea74004ac0e3ec78826305819730a74df86c85023746d",
	name: "readKycInvite",
	filename: "src/lib/platform.functions.ts"
}, (opts) => readKycInvite.__executeServer(opts));
var readKycInvite = createServerFn({ method: "GET" }).validator((token) => token).handler(readKycInvite_createServerFn_handler, async ({ data: token }) => {
	const row = (await (await getSql())`
      select i.status, i.expires_at < now() as expired, e.reference
      from kyc_invites i join enquiries e on e.id = i.enquiry_id
      where i.token = ${token}`)[0];
	if (!row || row.status !== "open" || row.expired) return { state: "closed" };
	return {
		state: "open",
		reference: row.reference
	};
});
var submitKyc_createServerFn_handler = createServerRpc({
	id: "748fe7038a9bd19d08aa79d7ef9f5f765b55397f63ac45bcbe0e2a28f09d4acc",
	name: "submitKyc",
	filename: "src/lib/platform.functions.ts"
}, (opts) => submitKyc.__executeServer(opts));
var submitKyc = createServerFn({ method: "POST" }).validator((input) => input).handler(submitKyc_createServerFn_handler, async ({ data }) => {
	const token = text(data.token, 80);
	const legalName = text(data.legalName, 160);
	const dateOfBirth = text(data.dateOfBirth, 20);
	const nationality = text(data.nationality, 80);
	const residence = text(data.residence, 120);
	const sourceOfFunds = text(data.sourceOfFunds, 2e3);
	if (!token || !legalName || !dateOfBirth || !nationality || !residence || sourceOfFunds.length < 10) return { error: "Complete the due-diligence form." };
	const sql = await getSql();
	const invite = (await sql`
      select id from kyc_invites
      where token = ${token} and status = 'open' and expires_at > now()`)[0];
	if (!invite) return { error: "This link is closed." };
	await sql`insert into kyc_submissions (id, invite_id, legal_name, date_of_birth, nationality, residence, source_of_funds)
      values (${id("kys")}, ${invite.id}, ${legalName}, ${dateOfBirth}, ${nationality}, ${residence}, ${sourceOfFunds})`;
	await sql`update kyc_invites set status = 'submitted', submitted_at = now() where id = ${invite.id} and status = 'open'`;
	await sql`insert into audit_events (id, institution, actor_user_id, action, entity, entity_id, detail)
      values (${id("aud")}, 'ashcombe', 'applicant', 'kyc_submitted', 'kyc_invite', ${invite.id}, '')`;
	return { ok: true };
});
var ashcombeClientHome_createServerFn_handler = createServerRpc({
	id: "e83bcebab27da44814ceec05d66f7ec479ecb4234cae077f2101c656fd7d01be",
	name: "ashcombeClientHome",
	filename: "src/lib/platform.functions.ts"
}, (opts) => ashcombeClientHome.__executeServer(opts));
var ashcombeClientHome = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(ashcombeClientHome_createServerFn_handler, async ({ context }) => {
	if (!(await profilesOf(context.userId)).find((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active")) return { allowed: false };
	const sql = await getSql();
	return {
		allowed: true,
		accounts: await sql`
      select a.id, a.name, a.currency, a.status, a.iban, a.iban_status,
        coalesce(sum(case when l.direction = 'credit' then l.amount_cents else -l.amount_cents end), 0) as balance_cents
      from accounts a
      left join ledger_entries l on l.account_id = a.id
      where a.client_user_id = ${context.userId} and a.status = 'active'
      group by a.id order by min(a.created_at)`,
		activity: await sql`
      select l.id, l.direction, l.amount_cents, l.currency, l.narrative, l.created_at::text as created_at
      from ledger_entries l join accounts a on a.id = l.account_id
      where a.client_user_id = ${context.userId}
      order by l.created_at desc limit 30`,
		payments: await sql`
      select id, amount_cents, currency, beneficiary_name, status, reference_text, created_at::text as created_at
      from payment_instructions where client_user_id = ${context.userId}
      order by created_at desc limit 30`,
		thread: await sql`
      select id, body, author_user_id, created_at::text as created_at from messages
      where institution = 'ashcombe' and thread_user_id = ${context.userId}
      order by created_at`,
		self: context.userId
	};
});
var createPayment_createServerFn_handler = createServerRpc({
	id: "8f757495d952567818fe92119202fe7736f589cd21b9baba3cc5ba363ab0f228",
	name: "createPayment",
	filename: "src/lib/platform.functions.ts"
}, (opts) => createPayment.__executeServer(opts));
var createPayment = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(createPayment_createServerFn_handler, async ({ context, data }) => {
	if (!(await profilesOf(context.userId)).some((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active")) return { error: "An active private-client profile is required." };
	const accountId = text(data.accountId, 80);
	const beneficiaryName = text(data.beneficiaryName, 140);
	const beneficiaryIban = normaliseIban(text(data.beneficiaryIban, 42));
	const referenceText = text(data.referenceText, 140);
	const amountCents = Number(data.amountCents);
	const idempotencyKey = text(data.idempotencyKey, 80) || crypto.randomUUID();
	if (!accountId || !beneficiaryName || !isValidIban(beneficiaryIban) || !referenceText || !Number.isInteger(amountCents) || amountCents <= 0) return { error: "A valid beneficiary IBAN, amount in cents, and reference are required." };
	const sql = await getSql();
	const account = (await sql`
      select id, currency from accounts
      where id = ${accountId} and client_user_id = ${context.userId} and status = 'active'`)[0];
	if (!account) return { error: "Account not available." };
	const limits = await sql`
      select max_cents from approval_limits
      where institution = 'ashcombe' and currency = ${account.currency} and status = 'active'
      order by created_at desc limit 1`;
	const blocked = instructionBlockedByLimit(amountCents, limits[0] ? Number(limits[0].max_cents) : null);
	if (blocked) return { error: blocked };
	const paymentId = id("pay");
	if (!(await sql`
      insert into payment_instructions (
        id, account_id, client_user_id, idempotency_key, amount_cents, currency,
        beneficiary_name, beneficiary_iban, reference_text, status
      ) values (
        ${paymentId}, ${account.id}, ${context.userId}, ${idempotencyKey}, ${amountCents}, ${account.currency},
        ${beneficiaryName}, ${beneficiaryIban}, ${referenceText}, 'submitted'
      )
      on conflict (client_user_id, idempotency_key) do nothing
      returning id`)[0]) return { error: "This instruction was already submitted." };
	await audit(context.userId, "ashcombe", "payment_submitted", "payment", paymentId, referenceText);
	return { ok: true };
});
var postMessage_createServerFn_handler = createServerRpc({
	id: "7a7b7b39133ea2bb4c82bbaea65f39f384764eb66cd1809077f949ca73d78b4e",
	name: "postMessage",
	filename: "src/lib/platform.functions.ts"
}, (opts) => postMessage.__executeServer(opts));
var postMessage = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(postMessage_createServerFn_handler, async ({ context, data }) => {
	const institution = data.institution === "vantoris" ? "vantoris" : data.institution === "ashcombe" ? "ashcombe" : "";
	const body = text(data.body, 2e3);
	if (!institution || !body) return { error: "Message is empty." };
	const mine = await profilesOf(context.userId);
	if (activeStaff(mine, institution, STAFF_READ)) {
		const stepped = await stepUpBlock(context.userId, context.sessionId);
		if (stepped) return { error: stepped };
	}
	const selfClient = mine.some((profile) => profile.institution === institution && profile.status === "active" && profile.kind !== "staff");
	let thread = context.userId;
	if (data.threadUserId && data.threadUserId !== context.userId) {
		if (!activeStaff(mine, institution, STAFF_READ)) return { error: "Not permitted." };
		thread = text(data.threadUserId, 80);
	} else if (!selfClient && !activeStaff(mine, institution, STAFF_READ)) return { error: "Not permitted." };
	await (await getSql())`insert into messages (id, institution, thread_user_id, author_user_id, body)
      values (${id("msg")}, ${institution}, ${thread}, ${context.userId}, ${body})`;
	return { ok: true };
});
var ashcombeOffice_createServerFn_handler = createServerRpc({
	id: "1802222336cec20af66fc5863f1c571ec5fa71eacaa7f784472c964846d41b39",
	name: "ashcombeOffice",
	filename: "src/lib/platform.functions.ts"
}, (opts) => ashcombeOffice.__executeServer(opts));
var ashcombeOffice = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(ashcombeOffice_createServerFn_handler, async ({ context }) => {
	const staff = activeStaff(await profilesOf(context.userId), "ashcombe", STAFF_READ);
	if (!staff) return {
		allowed: false,
		stepUp: null
	};
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return {
		allowed: false,
		stepUp: stepped
	};
	const sql = await getSql();
	const enquiries = await sql`select id, reference, full_name, email, country, topic, message, status, created_at::text as created_at
      from enquiries where institution = 'ashcombe' order by created_at desc limit 50`;
	const invites = await sql`
      select enquiry_id, token, status from kyc_invites order by expires_at desc limit 50`;
	const people = await sql`select id, user_id, institution, kind, role, status, display_name
      from profiles where institution = 'ashcombe' order by created_at desc`;
	const accounts = await sql`
      select a.id, a.client_user_id, a.name, a.currency, a.status, a.iban, a.iban_status, a.maker_user_id,
        coalesce(sum(case when l.direction = 'credit' then l.amount_cents else -l.amount_cents end), 0) as balance_cents
      from accounts a left join ledger_entries l on l.account_id = a.id
      group by a.id order by min(a.created_at) desc`;
	const payments = await sql`select id, amount_cents, currency, beneficiary_name, status, reference_text, maker_user_id, settlement_by
      from payment_instructions order by created_at desc limit 40`;
	const receipts = await sql`select id, account_id, amount_cents, currency, branch_name, method, narrative, status, maker_user_id
      from branch_receipts order by created_at desc limit 40`;
	const obligations = await sql`select code, title, description, status, evidence_reference, approval_status, owner_user_id from obligations order by code`;
	const history = await sql`
      select id, action, entity, detail, created_at::text as created_at from audit_events
      where institution = 'ashcombe' order by created_at desc limit 25`;
	return {
		allowed: true,
		role: staff.role,
		self: context.userId,
		enquiries,
		invites,
		people,
		accounts,
		payments,
		receipts,
		obligations,
		history
	};
});
var proposeAccount_createServerFn_handler = createServerRpc({
	id: "f6767aadd66ad960fc59bf102230f3d0984927b8a2ee8eec27a0c62e4a5f39da",
	name: "proposeAccount",
	filename: "src/lib/platform.functions.ts"
}, (opts) => proposeAccount.__executeServer(opts));
var proposeAccount = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(proposeAccount_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "ashcombe", MONEY)) return { error: "Operations authority is required." };
	const clientUserId = text(data.clientUserId, 80);
	const name = text(data.name, 80);
	const currency = data.currency === "GBP" || data.currency === "USD" ? data.currency : data.currency === "EUR" ? "EUR" : "";
	if (!clientUserId || !name || !currency) return { error: "Client, name and currency are required." };
	const sql = await getSql();
	if (!(await sql`
      select id from profiles where user_id = ${clientUserId} and institution = 'ashcombe' and kind = 'client' and status = 'active'`)[0]) return { error: "Active Ashcombe client profile not found." };
	if (!(await sql`
      select count(*) as n from kyc_submissions s
      join kyc_invites i on i.id = s.invite_id
      join enquiries e on e.id = i.enquiry_id
      where lower(e.email) in (select lower(email) from "user" where id = ${clientUserId})`)[0]?.n) return { error: "No submitted KYC is linked to this client's sign-in email." };
	const accountId = id("acc");
	await sql`insert into accounts (id, client_user_id, name, currency, status, maker_user_id)
      values (${accountId}, ${clientUserId}, ${name}, ${currency}, 'proposed', ${context.userId})`;
	await audit(context.userId, "ashcombe", "propose_account", "account", accountId, currency);
	return { ok: true };
});
var approveAccount_createServerFn_handler = createServerRpc({
	id: "64a53834ad83af0b44e78b4e6aa880de1b4e7247f35665a551aa4a9ec4cbff4c",
	name: "approveAccount",
	filename: "src/lib/platform.functions.ts"
}, (opts) => approveAccount.__executeServer(opts));
var approveAccount = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(approveAccount_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "ashcombe", ["executive"])) return { error: "Executive approval is required." };
	const accountId = text(data.accountId, 80);
	const sql = await getSql();
	if (!(await approveProposedAccount(sql, accountId, context.userId))[0]) return { error: "Nothing to approve. The maker cannot approve their own proposal." };
	await audit(context.userId, "ashcombe", "approve_account", "account", accountId, "active");
	return { ok: true };
});
var proposeIban_createServerFn_handler = createServerRpc({
	id: "d849230b6dded7888ff3587630350cd5edace80a727a3928827a2cfe1e782bd3",
	name: "proposeIban",
	filename: "src/lib/platform.functions.ts"
}, (opts) => proposeIban.__executeServer(opts));
var proposeIban = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(proposeIban_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "ashcombe", MONEY)) return { error: "Operations authority is required." };
	const accountId = text(data.accountId, 80);
	const iban = normaliseIban(text(data.iban, 42));
	if (!isValidIban(iban)) return { error: "IBAN checksum failed." };
	if (!(await (await getSql())`
      update accounts set iban = ${iban}, iban_status = 'proposed', iban_proposed_by = ${context.userId}
      where id = ${accountId} and status = 'active' and iban_status = 'not_issued'
      returning id`)[0]) return { error: "Account is not ready for an IBAN proposal." };
	await audit(context.userId, "ashcombe", "propose_iban", "account", accountId, iban.slice(0, 4));
	return { ok: true };
});
var confirmIban_createServerFn_handler = createServerRpc({
	id: "353177414a4b5dd00df42dae098efa1abe1bcd967f8aac66ff5000c5e8ab211f",
	name: "confirmIban",
	filename: "src/lib/platform.functions.ts"
}, (opts) => confirmIban.__executeServer(opts));
var confirmIban = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(confirmIban_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "ashcombe", ["executive"])) return { error: "Executive confirmation is required." };
	const accountId = text(data.accountId, 80);
	if (!(await (await getSql())`
      update accounts set iban_status = 'issued'
      where id = ${accountId} and iban_status = 'proposed' and iban_proposed_by <> ${context.userId} and iban is not null
      returning id`)[0]) return { error: "IBAN was not confirmed. The proposer cannot confirm it." };
	await audit(context.userId, "ashcombe", "confirm_iban", "account", accountId, "issued");
	return { ok: true };
});
var recordBranchReceipt_createServerFn_handler = createServerRpc({
	id: "58a68314c5e62712fcad4947684a23de2594932c3b397fc7b467dbb4f41697da",
	name: "recordBranchReceipt",
	filename: "src/lib/platform.functions.ts"
}, (opts) => recordBranchReceipt.__executeServer(opts));
var recordBranchReceipt = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(recordBranchReceipt_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "ashcombe", MONEY)) return { error: "Operations authority is required." };
	const accountId = text(data.accountId, 80);
	const branchName = text(data.branchName, 120);
	const method = text(data.method, 40);
	const narrative = text(data.narrative, 240);
	const amountCents = Number(data.amountCents);
	if (!accountId || !branchName || !method || !narrative || !Number.isInteger(amountCents) || amountCents <= 0) return { error: "Branch, method, narrative and a whole-cent amount are required." };
	const sql = await getSql();
	const accounts = await sql`select currency from accounts where id = ${accountId} and status = 'active'`;
	if (!accounts[0]) return { error: "Active account not found." };
	const receiptId = id("brn");
	await sql`insert into branch_receipts (id, account_id, amount_cents, currency, branch_name, method, narrative, status, maker_user_id)
      values (${receiptId}, ${accountId}, ${amountCents}, ${accounts[0].currency}, ${branchName}, ${method}, ${narrative}, 'recorded', ${context.userId})`;
	await audit(context.userId, "ashcombe", "record_branch_receipt", "branch_receipt", receiptId, branchName);
	return { ok: true };
});
var checkBranchReceipt_createServerFn_handler = createServerRpc({
	id: "4461fc6c1747748529efe116528bd35879e368eb02a7ac710c249a2b5493f009",
	name: "checkBranchReceipt",
	filename: "src/lib/platform.functions.ts"
}, (opts) => checkBranchReceipt.__executeServer(opts));
var checkBranchReceipt = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(checkBranchReceipt_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "ashcombe", ["executive"])) return { error: "A second officer must be an executive." };
	const receiptId = text(data.receiptId, 80);
	const sql = await getSql();
	if (!(await postCheckedBranchReceipt(sql, receiptId, context.userId, id("led")))[0]) return { error: "Receipt was not posted. The recording officer cannot check it." };
	await audit(context.userId, "ashcombe", "post_branch_receipt", "branch_receipt", receiptId, "ledger credit");
	return { ok: true };
});
var advancePayment_createServerFn_handler = createServerRpc({
	id: "b0e8d15688d1804dd8df69048e01bb01e6359773871543c4d5770fffd3710191",
	name: "advancePayment",
	filename: "src/lib/platform.functions.ts"
}, (opts) => advancePayment.__executeServer(opts));
var advancePayment = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(advancePayment_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	const mine = await profilesOf(context.userId);
	const paymentId = text(data.paymentId, 80);
	const step = text(data.step, 40);
	const sql = await getSql();
	if (!(await sql`select id from payment_instructions where id = ${paymentId}`)[0]) return { error: "Instruction not found." };
	if (step === "validate") {
		if (!activeStaff(mine, "ashcombe", MONEY)) return { error: "Operations authority is required." };
		if (!(await sql`
        update payment_instructions set status = 'validated', maker_user_id = ${context.userId}
        where id = ${paymentId} and status = 'submitted' returning id`)[0]) return { error: "Instruction is not awaiting validation." };
	} else if (step === "authorise") {
		if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "Executive authorisation is required." };
		if (!(await sql`
        update payment_instructions set status = 'authorised', checker_user_id = ${context.userId}
        where id = ${paymentId} and status = 'validated' and maker_user_id <> ${context.userId}
        returning id`)[0]) return { error: "Authorisation needs a different officer from the validator." };
	} else if (step === "process") {
		if (!activeStaff(mine, "ashcombe", MONEY)) return { error: "Operations authority is required." };
		if (!(await sql`
        update payment_instructions set status = 'processing'
        where id = ${paymentId} and status = 'authorised' and checker_user_id <> ${context.userId}
        returning id`)[0]) return { error: "Processing needs an officer other than the authoriser." };
	} else if (step === "settlement") {
		if (!activeStaff(mine, "ashcombe", MONEY)) return { error: "Operations authority is required." };
		const reference = text(data.settlementReference, 160);
		if (!reference) return { error: "A settlement evidence reference is required. Nothing is marked settled without it." };
		if (!(await sql`
        update payment_instructions set status = 'awaiting_reconciliation', settlement_reference = ${reference}, settlement_by = ${context.userId}
        where id = ${paymentId} and status = 'processing' and coalesce(checker_user_id, '') <> ${context.userId}
        returning id`)[0]) return { error: "Settlement evidence was not accepted." };
	} else if (step === "reconcile") {
		if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "Executive reconciliation is required." };
		if (!(await reconcilePayment(sql, paymentId, context.userId, id("led")))[0]) return { error: "Not reconciled. Funds are insufficient, or you recorded the settlement evidence." };
	} else if (step === "exception") {
		if (!activeStaff(mine, "ashcombe", [
			"executive",
			"operations",
			"compliance"
		])) return { error: "Not permitted." };
		if (!(await sql`
        update payment_instructions set status = 'exception', exception_by = ${context.userId}
        where id = ${paymentId} and status in ('validated', 'authorised', 'processing', 'awaiting_reconciliation')
          and coalesce(maker_user_id, '') <> ${context.userId}
        returning id`)[0]) return { error: "Exception was not recorded. The validator cannot park their own instruction." };
	} else if (step === "reopen") {
		if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "Executive authority is required." };
		if (!(await reopenException(sql, paymentId, context.userId))[0]) return { error: "The officer who parked the instruction cannot restart it." };
	} else if (step === "reject") {
		if (!activeStaff(mine, "ashcombe", ["executive", "operations"])) return { error: "Not permitted." };
		if (!(await sql`
        update payment_instructions set status = 'rejected'
        where id = ${paymentId} and status in ('submitted', 'validated', 'authorised')
        and coalesce(maker_user_id, '') <> ${context.userId}
        returning id`)[0]) return { error: "Instruction cannot be rejected by its validator." };
	} else return { error: "Unknown step." };
	await audit(context.userId, "ashcombe", `payment_${step}`, "payment", paymentId, step);
	return { ok: true };
});
var fileObligation_createServerFn_handler = createServerRpc({
	id: "fbd039f57c95fd4db478643cfbccb212ac112b029b95079619d39f144e843c70",
	name: "fileObligation",
	filename: "src/lib/platform.functions.ts"
}, (opts) => fileObligation.__executeServer(opts));
var fileObligation = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(fileObligation_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "ashcombe", COMPLIANCE)) return { error: "Compliance authority is required." };
	const code = text(data.code, 20);
	const evidence = text(data.evidence, 240);
	const nextReview = text(data.nextReview, 20);
	if (!code || !evidence) return { error: "Evidence reference is required. Status stays open until a second officer approves." };
	const sql = await getSql();
	if (!(await sql`
      update obligations set evidence_reference = ${evidence}, owner_user_id = ${context.userId},
        approval_status = 'pending_approval', next_review_on = nullif(${nextReview}, '')::date
      where code = ${code} and approval_status <> 'verified'
      returning code`)[0]) return { error: "Obligation not updated." };
	await sql`insert into obligation_history (id, code, actor_user_id, change)
      values (${id("obh")}, ${code}, ${context.userId}, ${`evidence filed: ${evidence}`})`;
	await audit(context.userId, "ashcombe", "file_obligation_evidence", "obligation", code, evidence);
	return { ok: true };
});
var approveObligation_createServerFn_handler = createServerRpc({
	id: "4267a96508a64ce51c73d5ab02f7e48e08238c379525f5c47ae8e757b18bc937",
	name: "approveObligation",
	filename: "src/lib/platform.functions.ts"
}, (opts) => approveObligation.__executeServer(opts));
var approveObligation = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(approveObligation_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "ashcombe", ["executive"])) return { error: "Executive approval is required." };
	const code = text(data.code, 20);
	const sql = await getSql();
	if (!(await sql`
      update obligations set status = 'verified', approval_status = 'verified',
        reviewer_user_id = ${context.userId}, last_verified_on = current_date
      where code = ${code} and approval_status = 'pending_approval' and owner_user_id <> ${context.userId}
        and evidence_reference is not null
      returning code`)[0]) return { error: "Verification refused. Evidence and a different approver are both required." };
	await sql`insert into obligation_history (id, code, actor_user_id, change)
      values (${id("obh")}, ${code}, ${context.userId}, 'marked verified')`;
	await audit(context.userId, "ashcombe", "verify_obligation", "obligation", code, "verified");
	return { ok: true };
});
var vantorisHome_createServerFn_handler = createServerRpc({
	id: "ed0497c182003cd17f6ad84b12683868ec2d4bc179f0472c17f21ef6deb3f8df",
	name: "vantorisHome",
	filename: "src/lib/platform.functions.ts"
}, (opts) => vantorisHome.__executeServer(opts));
var vantorisHome = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(vantorisHome_createServerFn_handler, async ({ context }) => {
	const mine = await profilesOf(context.userId);
	const member = mine.find((profile) => profile.institution === "vantoris" && profile.kind === "member");
	const staff = activeStaff(mine, "vantoris", STAFF_READ);
	const sql = await getSql();
	const requests = member ? await sql`
          select id, title, body, status, created_at::text as created_at from vantoris_requests
          where user_id = ${context.userId} order by created_at desc` : [];
	const thread = await sql`
      select id, body, author_user_id, created_at::text as created_at from messages
      where institution = 'vantoris' and thread_user_id = ${context.userId} order by created_at`;
	return {
		member: member ?? null,
		staff: Boolean(staff),
		requests,
		thread,
		self: context.userId
	};
});
var createVantorisRequest_createServerFn_handler = createServerRpc({
	id: "0e605b764f94c1e6a89cfa944e31a9c1bb89fc357302197bdd94c90306b0e2cc",
	name: "createVantorisRequest",
	filename: "src/lib/platform.functions.ts"
}, (opts) => createVantorisRequest.__executeServer(opts));
var createVantorisRequest = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(createVantorisRequest_createServerFn_handler, async ({ context, data }) => {
	if (!(await profilesOf(context.userId)).some((profile) => profile.institution === "vantoris" && profile.kind === "member" && profile.status === "active")) return { error: "Active institutional access is required." };
	const title = text(data.title, 140);
	const body = text(data.body, 4e3);
	if (!title || body.length < 10) return { error: "Title and a short description are required." };
	await (await getSql())`insert into vantoris_requests (id, user_id, title, body) values (${id("vrq")}, ${context.userId}, ${title}, ${body})`;
	await audit(context.userId, "vantoris", "create_request", "request", title, "");
	return { ok: true };
});
var vantorisOffice_createServerFn_handler = createServerRpc({
	id: "50e1b4f8f754cb30eecf72419875e07fe8ba2aaeefaa563d190b27ee16042d95",
	name: "vantorisOffice",
	filename: "src/lib/platform.functions.ts"
}, (opts) => vantorisOffice.__executeServer(opts));
var vantorisOffice = createServerFn({ method: "GET" }).middleware([sessionMiddleware]).handler(vantorisOffice_createServerFn_handler, async ({ context }) => {
	const staff = activeStaff(await profilesOf(context.userId), "vantoris", STAFF_READ);
	if (!staff) return {
		allowed: false,
		stepUp: null
	};
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return {
		allowed: false,
		stepUp: stepped
	};
	const sql = await getSql();
	const people = await sql`select id, user_id, institution, kind, role, status, display_name
      from profiles where institution = 'vantoris' order by created_at desc`;
	const requests = await sql`
      select id, user_id, title, body, status from vantoris_requests order by created_at desc limit 40`;
	const risks = await sql`
      select id, title, detail, status, owner_user_id from vantoris_risks order by created_at desc`;
	const enquiries = await sql`
      select id, reference, full_name, topic, message, status from enquiries where institution = 'vantoris' order by created_at desc limit 30`;
	const history = await sql`
      select id, action, detail, created_at::text as created_at from audit_events
      where institution = 'vantoris' order by created_at desc limit 20`;
	return {
		allowed: true,
		role: staff.role,
		self: context.userId,
		people,
		requests,
		risks,
		enquiries,
		history
	};
});
var addVantorisRisk_createServerFn_handler = createServerRpc({
	id: "76ae67e587f22a2a955f3cf87da1abea034a7e1024aa4bd8ba4d54a168b0050f",
	name: "addVantorisRisk",
	filename: "src/lib/platform.functions.ts"
}, (opts) => addVantorisRisk.__executeServer(opts));
var addVantorisRisk = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(addVantorisRisk_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "vantoris", ["executive", "compliance"])) return { error: "Compliance authority is required." };
	const title = text(data.title, 140);
	const detail = text(data.detail, 2e3);
	if (!title || !detail) return { error: "Title and detail are required." };
	const sql = await getSql();
	const riskId = id("rsk");
	await sql`insert into vantoris_risks (id, title, detail, owner_user_id) values (${riskId}, ${title}, ${detail}, ${context.userId})`;
	await audit(context.userId, "vantoris", "add_risk", "risk", riskId, title);
	return { ok: true };
});
var setRequestStatus_createServerFn_handler = createServerRpc({
	id: "286f5436d386dfd9c5875dfeacc24e86448c1626e2816f4e582fdb1fe2adc3ee",
	name: "setRequestStatus",
	filename: "src/lib/platform.functions.ts"
}, (opts) => setRequestStatus.__executeServer(opts));
var setRequestStatus = createServerFn({ method: "POST" }).validator((input) => input).middleware([sessionMiddleware]).handler(setRequestStatus_createServerFn_handler, async ({ context, data }) => {
	const stepped = await stepUpBlock(context.userId, context.sessionId);
	if (stepped) return { error: stepped };
	if (!activeStaff(await profilesOf(context.userId), "vantoris", [
		"executive",
		"operations",
		"relationship"
	])) return { error: "Not permitted." };
	const requestId = text(data.requestId, 80);
	const status = data.status === "in_progress" || data.status === "closed" ? data.status : "";
	if (!requestId || !status) return { error: "Incomplete." };
	await (await getSql())`update vantoris_requests set status = ${status} where id = ${requestId}`;
	await audit(context.userId, "vantoris", "set_request_status", "request", requestId, status);
	return { ok: true };
});
//#endregion
export { addVantorisRisk_createServerFn_handler, advancePayment_createServerFn_handler, approveAccount_createServerFn_handler, approveObligation_createServerFn_handler, ashcombeClientHome_createServerFn_handler, ashcombeOffice_createServerFn_handler, bootstrapExecutive_createServerFn_handler, checkBranchReceipt_createServerFn_handler, confirmIban_createServerFn_handler, createPayment_createServerFn_handler, createVantorisRequest_createServerFn_handler, decideProfile_createServerFn_handler, fileObligation_createServerFn_handler, getAccess_createServerFn_handler, issueKycLink_createServerFn_handler, postMessage_createServerFn_handler, proposeAccount_createServerFn_handler, proposeIban_createServerFn_handler, readKycInvite_createServerFn_handler, recordBranchReceipt_createServerFn_handler, requestProfile_createServerFn_handler, setRequestStatus_createServerFn_handler, submitEnquiry_createServerFn_handler, submitKyc_createServerFn_handler, vantorisHome_createServerFn_handler, vantorisOffice_createServerFn_handler };
