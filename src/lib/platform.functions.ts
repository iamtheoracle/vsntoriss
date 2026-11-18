import { createServerFn } from "@tanstack/react-start";
import { instructionBlockedByLimit } from "@/lib/controls";
import { getSql } from "@/lib/db";
import { isValidIban, normaliseIban } from "@/lib/iban";
import { approveProposedAccount, postCheckedBranchReceipt, reconcilePayment, reopenException } from "@/lib/ledger.controls";
import { stepUpBlock } from "@/lib/mfa.server";
import { sessionMiddleware } from "@/lib/session.middleware";

type Institution = "ashcombe" | "vantoris";

type Profile = {
  id: string;
  user_id: string;
  institution: Institution;
  kind: "client" | "member" | "staff";
  role: string;
  status: string;
  display_name: string;
};

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

async function audit(
  actor: string,
  institution: string | null,
  action: string,
  entity: string,
  entityId: string,
  detail: string,
) {
  const sql = await getSql();
  await sql`insert into audit_events (id, institution, actor_user_id, action, entity, entity_id, detail)
    values (${id("aud")}, ${institution}, ${actor}, ${action}, ${entity}, ${entityId}, ${detail})`;
}

async function profilesOf(userId: string): Promise<Profile[]> {
  const sql = await getSql();
  return sql<Profile>`select id, user_id, institution, kind, role, status, display_name
    from profiles where user_id = ${userId}`;
}

function activeStaff(profiles: Profile[], institution: Institution, roles: string[]) {
  return profiles.find(
    (profile) =>
      profile.institution === institution &&
      profile.kind === "staff" &&
      profile.status === "active" &&
      roles.includes(profile.role),
  );
}

const STAFF_READ = ["executive", "operations", "compliance", "audit", "relationship"];
const MONEY = ["executive", "operations"];
const COMPLIANCE = ["executive", "compliance"];

function text(value: unknown, max: number) {
  const next = String(value ?? "").trim();
  if (!next || next.length > max) return "";
  return next;
}

export const getAccess = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const profiles = await profilesOf(context.userId);
    const counts = await sql<{ institution: string; n: number }>`
      select institution, count(*) as n from profiles
      where kind = 'staff' and role = 'executive' and status = 'active'
      group by institution`;
    const has = (institution: string) => counts.some((row) => row.institution === institution && row.n > 0);
    const notes = await sql<{ id: string; body: string; created_at: string }>`
      select id, body, created_at::text as created_at from notifications
      where user_id = ${context.userId} order by created_at desc limit 12`;
    return {
      profiles,
      vacancies: { ashcombe: !has("ashcombe"), vantoris: !has("vantoris") },
      notes,
    };
  });

export const bootstrapExecutive = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; displayName?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const institution = data.institution === "vantoris" ? "vantoris" : data.institution === "ashcombe" ? "ashcombe" : "";
    const displayName = text(data.displayName, 80);
    if (!institution || !displayName) return { error: "Institution and name are required." };
    const sql = await getSql();
    const existing = await sql<{ n: number }>`
      select count(*) as n from profiles
      where institution = ${institution} and kind = 'staff' and role = 'executive' and status = 'active'`;
    if (existing[0]?.n) return { error: "An executive already exists. This path is closed." };
    const profileId = id("prf");
    await sql`insert into profiles (id, user_id, institution, kind, role, status, display_name)
      values (${profileId}, ${context.userId}, ${institution}, 'staff', 'executive', 'active', ${displayName})
      on conflict (user_id, institution, kind) do update
      set role = 'executive', status = 'active', display_name = ${displayName}`;
    await audit(context.userId, institution, "bootstrap_executive", "profile", profileId, "First executive. Path closes after this row.");
    return { ok: true };
  });

export const requestProfile = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; displayName?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const institution = data.institution === "vantoris" ? "vantoris" : data.institution === "ashcombe" ? "ashcombe" : "";
    const displayName = text(data.displayName, 80);
    if (!institution || !displayName) return { error: "Name is required." };
    const kind = institution === "ashcombe" ? "client" : "member";
    const role = institution === "ashcombe" ? "private_client" : "member";
    const sql = await getSql();
    await sql`insert into profiles (id, user_id, institution, kind, role, status, display_name)
      values (${id("prf")}, ${context.userId}, ${institution}, ${kind}, ${role}, 'pending', ${displayName})
      on conflict (user_id, institution, kind) do nothing`;
    await audit(context.userId, institution, "request_profile", "profile", context.userId, kind);
    return { ok: true };
  });

export const decideProfile = createServerFn({ method: "POST" })
  .validator((input: { profileId?: string; decision?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const decision = data.decision === "active" || data.decision === "suspended" ? data.decision : "";
    const profileId = text(data.profileId, 80);
    if (!decision || !profileId) return { error: "Incomplete decision." };
    const mine = await profilesOf(context.userId);
    const sql = await getSql();
    const rows = await sql<Profile>`select id, user_id, institution, kind, role, status, display_name from profiles where id = ${profileId}`;
    const target = rows[0];
    if (!target) return { error: "Profile not found." };
    if (target.user_id === context.userId) return { error: "You cannot decide your own profile." };
    if (target.role === "executive") return { error: "Executive authority is not granted from this action." };
    if (!activeStaff(mine, target.institution, ["executive"])) return { error: "Executive authority is required." };
    await sql`update profiles set status = ${decision} where id = ${profileId}`;
    await audit(context.userId, target.institution, "decide_profile", "profile", profileId, decision);
    return { ok: true };
  });

export const submitEnquiry = createServerFn({ method: "POST" })
  .validator((input: Record<string, string>) => input)
  .handler(async ({ data }) => {
    const institution = data.institution === "vantoris" ? "vantoris" : data.institution === "ashcombe" ? "ashcombe" : "";
    const fullName = text(data.fullName, 120);
    const email = text(data.email, 160);
    const country = text(data.country, 80);
    const topic = text(data.topic, 80);
    const message = text(data.message, 4000);
    if (!institution || !fullName || !email.includes("@") || !country || !topic || message.length < 20) {
      return { error: "Complete every field. The message needs at least 20 characters." };
    }
    const sql = await getSql();
    const reference = `${institution === "ashcombe" ? "APB" : "VPI"}-${Date.now().toString(36).toUpperCase()}`;
    const enquiryId = id("enq");
    await sql`insert into enquiries (id, institution, reference, full_name, email, country, topic, message)
      values (${enquiryId}, ${institution}, ${reference}, ${fullName}, ${email}, ${country}, ${topic}, ${message})`;
    await sql`insert into audit_events (id, institution, actor_user_id, action, entity, entity_id, detail)
      values (${id("aud")}, ${institution}, 'public', 'enquiry_received', 'enquiry', ${enquiryId}, ${reference})`;
    return {
      reference,
      notice:
        "Your enquiry has been recorded for the operators responsible. It does not create an account. A member of staff will contact you.",
    };
  });

export const issueKycLink = createServerFn({ method: "POST" })
  .validator((input: { enquiryId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const enquiryId = text(data.enquiryId, 80);
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "ashcombe", COMPLIANCE)) return { error: "Compliance authority is required." };
    const sql = await getSql();
    const rows = await sql<{ id: string; institution: string }>`select id, institution from enquiries where id = ${enquiryId}`;
    if (rows[0]?.institution !== "ashcombe") return { error: "Ashcombe enquiry not found." };
    const token = crypto.randomUUID().replace(/-/g, "");
    const inviteId = id("kyc");
    await sql`insert into kyc_invites (id, enquiry_id, token, issued_by, expires_at)
      values (${inviteId}, ${enquiryId}, ${token}, ${context.userId}, now() + interval '14 days')`;
    await audit(context.userId, "ashcombe", "issue_kyc_link", "kyc_invite", inviteId, enquiryId);
    return { token };
  });

export const readKycInvite = createServerFn({ method: "GET" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    const sql = await getSql();
    const rows = await sql<{ status: string; expired: boolean; reference: string }>`
      select i.status, i.expires_at < now() as expired, e.reference
      from kyc_invites i join enquiries e on e.id = i.enquiry_id
      where i.token = ${token}`;
    const row = rows[0];
    if (!row || row.status !== "open" || row.expired) return { state: "closed" as const };
    return { state: "open" as const, reference: row.reference };
  });

export const submitKyc = createServerFn({ method: "POST" })
  .validator((input: Record<string, string>) => input)
  .handler(async ({ data }) => {
    const token = text(data.token, 80);
    const legalName = text(data.legalName, 160);
    const dateOfBirth = text(data.dateOfBirth, 20);
    const nationality = text(data.nationality, 80);
    const residence = text(data.residence, 120);
    const sourceOfFunds = text(data.sourceOfFunds, 2000);
    if (!token || !legalName || !dateOfBirth || !nationality || !residence || sourceOfFunds.length < 10) {
      return { error: "Complete the due-diligence form." };
    }
    const sql = await getSql();
    const invites = await sql<{ id: string }>`
      select id from kyc_invites
      where token = ${token} and status = 'open' and expires_at > now()`;
    const invite = invites[0];
    if (!invite) return { error: "This link is closed." };
    await sql`insert into kyc_submissions (id, invite_id, legal_name, date_of_birth, nationality, residence, source_of_funds)
      values (${id("kys")}, ${invite.id}, ${legalName}, ${dateOfBirth}, ${nationality}, ${residence}, ${sourceOfFunds})`;
    await sql`update kyc_invites set status = 'submitted', submitted_at = now() where id = ${invite.id} and status = 'open'`;
    await sql`insert into audit_events (id, institution, actor_user_id, action, entity, entity_id, detail)
      values (${id("aud")}, 'ashcombe', 'applicant', 'kyc_submitted', 'kyc_invite', ${invite.id}, '')`;
    return { ok: true };
  });

export const ashcombeClientHome = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const mine = await profilesOf(context.userId);
    const client = mine.find((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active");
    if (!client) return { allowed: false as const };
    const sql = await getSql();
    const accounts = await sql<{
      id: string; name: string; currency: string; status: string; iban: string | null; iban_status: string; balance_cents: number;
    }>`
      select a.id, a.name, a.currency, a.status, a.iban, a.iban_status,
        coalesce(sum(case when l.direction = 'credit' then l.amount_cents else -l.amount_cents end), 0) as balance_cents
      from accounts a
      left join ledger_entries l on l.account_id = a.id
      where a.client_user_id = ${context.userId} and a.status = 'active'
      group by a.id order by min(a.created_at)`;
    const activity = await sql<{
      id: string; direction: string; amount_cents: number; currency: string; narrative: string; created_at: string;
    }>`
      select l.id, l.direction, l.amount_cents, l.currency, l.narrative, l.created_at::text as created_at
      from ledger_entries l join accounts a on a.id = l.account_id
      where a.client_user_id = ${context.userId}
      order by l.created_at desc limit 30`;
    const payments = await sql<{
      id: string; amount_cents: number; currency: string; beneficiary_name: string; status: string; reference_text: string; created_at: string;
    }>`
      select id, amount_cents, currency, beneficiary_name, status, reference_text, created_at::text as created_at
      from payment_instructions where client_user_id = ${context.userId}
      order by created_at desc limit 30`;
    const thread = await sql<{ id: string; body: string; author_user_id: string; created_at: string }>`
      select id, body, author_user_id, created_at::text as created_at from messages
      where institution = 'ashcombe' and thread_user_id = ${context.userId}
      order by created_at`;
    return { allowed: true as const, accounts, activity, payments, thread, self: context.userId };
  });

export const createPayment = createServerFn({ method: "POST" })
  .validator((input: Record<string, string>) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await profilesOf(context.userId);
    if (!mine.some((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active")) {
      return { error: "An active private-client profile is required." };
    }
    const accountId = text(data.accountId, 80);
    const beneficiaryName = text(data.beneficiaryName, 140);
    const beneficiaryIban = normaliseIban(text(data.beneficiaryIban, 42));
    const referenceText = text(data.referenceText, 140);
    const amountCents = Number(data.amountCents);
    const idempotencyKey = text(data.idempotencyKey, 80) || crypto.randomUUID();
    if (!accountId || !beneficiaryName || !isValidIban(beneficiaryIban) || !referenceText || !Number.isInteger(amountCents) || amountCents <= 0) {
      return { error: "A valid beneficiary IBAN, amount in cents, and reference are required." };
    }
    const sql = await getSql();
    const owned = await sql<{ id: string; currency: string }>`
      select id, currency from accounts
      where id = ${accountId} and client_user_id = ${context.userId} and status = 'active'`;
    const account = owned[0];
    if (!account) return { error: "Account not available." };
    const limits = await sql<{ max_cents: number }>`
      select max_cents from approval_limits
      where institution = 'ashcombe' and currency = ${account.currency} and status = 'active'
      order by created_at desc limit 1`;
    const blocked = instructionBlockedByLimit(amountCents, limits[0] ? Number(limits[0].max_cents) : null);
    if (blocked) return { error: blocked };
    const paymentId = id("pay");
    const inserted = await sql<{ id: string }>`
      insert into payment_instructions (
        id, account_id, client_user_id, idempotency_key, amount_cents, currency,
        beneficiary_name, beneficiary_iban, reference_text, status
      ) values (
        ${paymentId}, ${account.id}, ${context.userId}, ${idempotencyKey}, ${amountCents}, ${account.currency},
        ${beneficiaryName}, ${beneficiaryIban}, ${referenceText}, 'submitted'
      )
      on conflict (client_user_id, idempotency_key) do nothing
      returning id`;
    if (!inserted[0]) return { error: "This instruction was already submitted." };
    await audit(context.userId, "ashcombe", "payment_submitted", "payment", paymentId, referenceText);
    return { ok: true };
  });

export const postMessage = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; threadUserId?: string; body?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const institution: Institution | "" = data.institution === "vantoris" ? "vantoris" : data.institution === "ashcombe" ? "ashcombe" : "";
    const body = text(data.body, 2000);
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
    } else if (!selfClient && !activeStaff(mine, institution, STAFF_READ)) {
      return { error: "Not permitted." };
    }
    const sql = await getSql();
    await sql`insert into messages (id, institution, thread_user_id, author_user_id, body)
      values (${id("msg")}, ${institution}, ${thread}, ${context.userId}, ${body})`;
    return { ok: true };
  });

export const ashcombeOffice = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const mine = await profilesOf(context.userId);
    const staff = activeStaff(mine, "ashcombe", STAFF_READ);
    if (!staff) return { allowed: false as const, stepUp: null as string | null };
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { allowed: false as const, stepUp: stepped };
    const sql = await getSql();
    const enquiries = await sql<{
      id: string; reference: string; full_name: string; email: string; country: string; topic: string; message: string; status: string; created_at: string;
    }>`select id, reference, full_name, email, country, topic, message, status, created_at::text as created_at
      from enquiries where institution = 'ashcombe' order by created_at desc limit 50`;
    const invites = await sql<{ enquiry_id: string; token: string; status: string }>`
      select enquiry_id, token, status from kyc_invites order by expires_at desc limit 50`;
    const people = await sql<Profile>`select id, user_id, institution, kind, role, status, display_name
      from profiles where institution = 'ashcombe' order by created_at desc`;
    const accounts = await sql<{
      id: string; client_user_id: string; name: string; currency: string; status: string; iban: string | null; iban_status: string; balance_cents: number; maker_user_id: string;
    }>`
      select a.id, a.client_user_id, a.name, a.currency, a.status, a.iban, a.iban_status, a.maker_user_id,
        coalesce(sum(case when l.direction = 'credit' then l.amount_cents else -l.amount_cents end), 0) as balance_cents
      from accounts a left join ledger_entries l on l.account_id = a.id
      group by a.id order by min(a.created_at) desc`;
    const payments = await sql<{
      id: string; amount_cents: number; currency: string; beneficiary_name: string; status: string; reference_text: string; maker_user_id: string | null; settlement_by: string | null;
    }>`select id, amount_cents, currency, beneficiary_name, status, reference_text, maker_user_id, settlement_by
      from payment_instructions order by created_at desc limit 40`;
    const receipts = await sql<{
      id: string; account_id: string; amount_cents: number; currency: string; branch_name: string; method: string; narrative: string; status: string; maker_user_id: string;
    }>`select id, account_id, amount_cents, currency, branch_name, method, narrative, status, maker_user_id
      from branch_receipts order by created_at desc limit 40`;
    const obligations = await sql<{
      code: string; title: string; description: string; status: string; evidence_reference: string | null; approval_status: string; owner_user_id: string | null;
    }>`select code, title, description, status, evidence_reference, approval_status, owner_user_id from obligations order by code`;
    const history = await sql<{ id: string; action: string; entity: string; detail: string; created_at: string }>`
      select id, action, entity, detail, created_at::text as created_at from audit_events
      where institution = 'ashcombe' order by created_at desc limit 25`;
    return { allowed: true as const, role: staff.role, self: context.userId, enquiries, invites, people, accounts, payments, receipts, obligations, history };
  });

export const proposeAccount = createServerFn({ method: "POST" })
  .validator((input: { clientUserId?: string; name?: string; currency?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "ashcombe", MONEY)) return { error: "Operations authority is required." };
    const clientUserId = text(data.clientUserId, 80);
    const name = text(data.name, 80);
    const currency = data.currency === "GBP" || data.currency === "USD" ? data.currency : data.currency === "EUR" ? "EUR" : "";
    if (!clientUserId || !name || !currency) return { error: "Client, name and currency are required." };
    const sql = await getSql();
    const clients = await sql<{ id: string }>`
      select id from profiles where user_id = ${clientUserId} and institution = 'ashcombe' and kind = 'client' and status = 'active'`;
    if (!clients[0]) return { error: "Active Ashcombe client profile not found." };
    const kyc = await sql<{ n: number }>`
      select count(*) as n from kyc_submissions s
      join kyc_invites i on i.id = s.invite_id
      join enquiries e on e.id = i.enquiry_id
      where lower(e.email) in (select lower(email) from "user" where id = ${clientUserId})`;
    if (!kyc[0]?.n) return { error: "No submitted KYC is linked to this client's sign-in email." };
    const accountId = id("acc");
    await sql`insert into accounts (id, client_user_id, name, currency, status, maker_user_id)
      values (${accountId}, ${clientUserId}, ${name}, ${currency}, 'proposed', ${context.userId})`;
    await audit(context.userId, "ashcombe", "propose_account", "account", accountId, currency);
    return { ok: true };
  });

export const approveAccount = createServerFn({ method: "POST" })
  .validator((input: { accountId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "Executive approval is required." };
    const accountId = text(data.accountId, 80);
    const sql = await getSql();
    const updated = await approveProposedAccount(sql, accountId, context.userId);
    if (!updated[0]) return { error: "Nothing to approve. The maker cannot approve their own proposal." };
    await audit(context.userId, "ashcombe", "approve_account", "account", accountId, "active");
    return { ok: true };
  });

export const proposeIban = createServerFn({ method: "POST" })
  .validator((input: { accountId?: string; iban?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "ashcombe", MONEY)) return { error: "Operations authority is required." };
    const accountId = text(data.accountId, 80);
    const iban = normaliseIban(text(data.iban, 42));
    if (!isValidIban(iban)) return { error: "IBAN checksum failed." };
    const sql = await getSql();
    const updated = await sql<{ id: string }>`
      update accounts set iban = ${iban}, iban_status = 'proposed', iban_proposed_by = ${context.userId}
      where id = ${accountId} and status = 'active' and iban_status = 'not_issued'
      returning id`;
    if (!updated[0]) return { error: "Account is not ready for an IBAN proposal." };
    await audit(context.userId, "ashcombe", "propose_iban", "account", accountId, iban.slice(0, 4));
    return { ok: true };
  });

export const confirmIban = createServerFn({ method: "POST" })
  .validator((input: { accountId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "Executive confirmation is required." };
    const accountId = text(data.accountId, 80);
    const sql = await getSql();
    const updated = await sql<{ id: string }>`
      update accounts set iban_status = 'issued'
      where id = ${accountId} and iban_status = 'proposed' and iban_proposed_by <> ${context.userId} and iban is not null
      returning id`;
    if (!updated[0]) return { error: "IBAN was not confirmed. The proposer cannot confirm it." };
    await audit(context.userId, "ashcombe", "confirm_iban", "account", accountId, "issued");
    return { ok: true };
  });

export const recordBranchReceipt = createServerFn({ method: "POST" })
  .validator((input: Record<string, string>) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "ashcombe", MONEY)) return { error: "Operations authority is required." };
    const accountId = text(data.accountId, 80);
    const branchName = text(data.branchName, 120);
    const method = text(data.method, 40);
    const narrative = text(data.narrative, 240);
    const amountCents = Number(data.amountCents);
    if (!accountId || !branchName || !method || !narrative || !Number.isInteger(amountCents) || amountCents <= 0) {
      return { error: "Branch, method, narrative and a whole-cent amount are required." };
    }
    const sql = await getSql();
    const accounts = await sql<{ currency: string }>`select currency from accounts where id = ${accountId} and status = 'active'`;
    if (!accounts[0]) return { error: "Active account not found." };
    const receiptId = id("brn");
    await sql`insert into branch_receipts (id, account_id, amount_cents, currency, branch_name, method, narrative, status, maker_user_id)
      values (${receiptId}, ${accountId}, ${amountCents}, ${accounts[0].currency}, ${branchName}, ${method}, ${narrative}, 'recorded', ${context.userId})`;
    await audit(context.userId, "ashcombe", "record_branch_receipt", "branch_receipt", receiptId, branchName);
    return { ok: true };
  });

export const checkBranchReceipt = createServerFn({ method: "POST" })
  .validator((input: { receiptId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "A second officer must be an executive." };
    const receiptId = text(data.receiptId, 80);
    const sql = await getSql();
    const posted = await postCheckedBranchReceipt(sql, receiptId, context.userId, id("led"));
    if (!posted[0]) return { error: "Receipt was not posted. The recording officer cannot check it." };
    await audit(context.userId, "ashcombe", "post_branch_receipt", "branch_receipt", receiptId, "ledger credit");
    return { ok: true };
  });

export const advancePayment = createServerFn({ method: "POST" })
  .validator((input: { paymentId?: string; step?: string; settlementReference?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    const paymentId = text(data.paymentId, 80);
    const step = text(data.step, 40);
    const sql = await getSql();
    const rows = await sql<{ id: string }>`select id from payment_instructions where id = ${paymentId}`;
    if (!rows[0]) return { error: "Instruction not found." };

    if (step === "validate") {
      if (!activeStaff(mine, "ashcombe", MONEY)) return { error: "Operations authority is required." };
      const updated = await sql<{ id: string }>`
        update payment_instructions set status = 'validated', maker_user_id = ${context.userId}
        where id = ${paymentId} and status = 'submitted' returning id`;
      if (!updated[0]) return { error: "Instruction is not awaiting validation." };
    } else if (step === "authorise") {
      if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "Executive authorisation is required." };
      const updated = await sql<{ id: string }>`
        update payment_instructions set status = 'authorised', checker_user_id = ${context.userId}
        where id = ${paymentId} and status = 'validated' and maker_user_id <> ${context.userId}
        returning id`;
      if (!updated[0]) return { error: "Authorisation needs a different officer from the validator." };
    } else if (step === "process") {
      if (!activeStaff(mine, "ashcombe", MONEY)) return { error: "Operations authority is required." };
      const updated = await sql<{ id: string }>`
        update payment_instructions set status = 'processing'
        where id = ${paymentId} and status = 'authorised' and checker_user_id <> ${context.userId}
        returning id`;
      if (!updated[0]) return { error: "Processing needs an officer other than the authoriser." };
    } else if (step === "settlement") {
      if (!activeStaff(mine, "ashcombe", MONEY)) return { error: "Operations authority is required." };
      const reference = text(data.settlementReference, 160);
      if (!reference) return { error: "A settlement evidence reference is required. Nothing is marked settled without it." };
      const updated = await sql<{ id: string }>`
        update payment_instructions set status = 'awaiting_reconciliation', settlement_reference = ${reference}, settlement_by = ${context.userId}
        where id = ${paymentId} and status = 'processing' and coalesce(checker_user_id, '') <> ${context.userId}
        returning id`;
      if (!updated[0]) return { error: "Settlement evidence was not accepted." };
    } else if (step === "reconcile") {
      if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "Executive reconciliation is required." };
      const posted = await reconcilePayment(sql, paymentId, context.userId, id("led"));
      if (!posted[0]) return { error: "Not reconciled. Funds are insufficient, or you recorded the settlement evidence." };
    } else if (step === "exception") {
      if (!activeStaff(mine, "ashcombe", ["executive", "operations", "compliance"])) return { error: "Not permitted." };
      const updated = await sql<{ id: string }>`
        update payment_instructions set status = 'exception', exception_by = ${context.userId}
        where id = ${paymentId} and status in ('validated', 'authorised', 'processing', 'awaiting_reconciliation')
          and coalesce(maker_user_id, '') <> ${context.userId}
        returning id`;
      if (!updated[0]) return { error: "Exception was not recorded. The validator cannot park their own instruction." };
    } else if (step === "reopen") {
      if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "Executive authority is required." };
      const updated = await reopenException(sql, paymentId, context.userId);
      if (!updated[0]) return { error: "The officer who parked the instruction cannot restart it." };
    } else if (step === "reject") {
      if (!activeStaff(mine, "ashcombe", ["executive", "operations"])) return { error: "Not permitted." };
      const updated = await sql<{ id: string }>`
        update payment_instructions set status = 'rejected'
        where id = ${paymentId} and status in ('submitted', 'validated', 'authorised')
        and coalesce(maker_user_id, '') <> ${context.userId}
        returning id`;
      if (!updated[0]) return { error: "Instruction cannot be rejected by its validator." };
    } else {
      return { error: "Unknown step." };
    }
    await audit(context.userId, "ashcombe", `payment_${step}`, "payment", paymentId, step);
    return { ok: true };
  });

export const fileObligation = createServerFn({ method: "POST" })
  .validator((input: { code?: string; evidence?: string; nextReview?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "ashcombe", COMPLIANCE)) return { error: "Compliance authority is required." };
    const code = text(data.code, 20);
    const evidence = text(data.evidence, 240);
    const nextReview = text(data.nextReview, 20);
    if (!code || !evidence) return { error: "Evidence reference is required. Status stays open until a second officer approves." };
    const sql = await getSql();
    const updated = await sql<{ code: string }>`
      update obligations set evidence_reference = ${evidence}, owner_user_id = ${context.userId},
        approval_status = 'pending_approval', next_review_on = nullif(${nextReview}, '')::date
      where code = ${code} and approval_status <> 'verified'
      returning code`;
    if (!updated[0]) return { error: "Obligation not updated." };
    await sql`insert into obligation_history (id, code, actor_user_id, change)
      values (${id("obh")}, ${code}, ${context.userId}, ${`evidence filed: ${evidence}`})`;
    await audit(context.userId, "ashcombe", "file_obligation_evidence", "obligation", code, evidence);
    return { ok: true };
  });

export const approveObligation = createServerFn({ method: "POST" })
  .validator((input: { code?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "ashcombe", ["executive"])) return { error: "Executive approval is required." };
    const code = text(data.code, 20);
    const sql = await getSql();
    const updated = await sql<{ code: string }>`
      update obligations set status = 'verified', approval_status = 'verified',
        reviewer_user_id = ${context.userId}, last_verified_on = current_date
      where code = ${code} and approval_status = 'pending_approval' and owner_user_id <> ${context.userId}
        and evidence_reference is not null
      returning code`;
    if (!updated[0]) return { error: "Verification refused. Evidence and a different approver are both required." };
    await sql`insert into obligation_history (id, code, actor_user_id, change)
      values (${id("obh")}, ${code}, ${context.userId}, 'marked verified')`;
    await audit(context.userId, "ashcombe", "verify_obligation", "obligation", code, "verified");
    return { ok: true };
  });

export const vantorisHome = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const mine = await profilesOf(context.userId);
    const member = mine.find((profile) => profile.institution === "vantoris" && profile.kind === "member");
    const staff = activeStaff(mine, "vantoris", STAFF_READ);
    const sql = await getSql();
    const requests = member
      ? await sql<{ id: string; title: string; body: string; status: string; created_at: string }>`
          select id, title, body, status, created_at::text as created_at from vantoris_requests
          where user_id = ${context.userId} order by created_at desc`
      : [];
    const thread = await sql<{ id: string; body: string; author_user_id: string; created_at: string }>`
      select id, body, author_user_id, created_at::text as created_at from messages
      where institution = 'vantoris' and thread_user_id = ${context.userId} order by created_at`;
    return { member: member ?? null, staff: Boolean(staff), requests, thread, self: context.userId };
  });

export const createVantorisRequest = createServerFn({ method: "POST" })
  .validator((input: { title?: string; body?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await profilesOf(context.userId);
    if (!mine.some((profile) => profile.institution === "vantoris" && profile.kind === "member" && profile.status === "active")) {
      return { error: "Active institutional access is required." };
    }
    const title = text(data.title, 140);
    const body = text(data.body, 4000);
    if (!title || body.length < 10) return { error: "Title and a short description are required." };
    const sql = await getSql();
    await sql`insert into vantoris_requests (id, user_id, title, body) values (${id("vrq")}, ${context.userId}, ${title}, ${body})`;
    await audit(context.userId, "vantoris", "create_request", "request", title, "");
    return { ok: true };
  });

export const vantorisOffice = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const mine = await profilesOf(context.userId);
    const staff = activeStaff(mine, "vantoris", STAFF_READ);
    if (!staff) return { allowed: false as const, stepUp: null as string | null };
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { allowed: false as const, stepUp: stepped };
    const sql = await getSql();
    const people = await sql<Profile>`select id, user_id, institution, kind, role, status, display_name
      from profiles where institution = 'vantoris' order by created_at desc`;
    const requests = await sql<{ id: string; user_id: string; title: string; body: string; status: string }>`
      select id, user_id, title, body, status from vantoris_requests order by created_at desc limit 40`;
    const risks = await sql<{ id: string; title: string; detail: string; status: string; owner_user_id: string }>`
      select id, title, detail, status, owner_user_id from vantoris_risks order by created_at desc`;
    const enquiries = await sql<{ id: string; reference: string; full_name: string; topic: string; message: string; status: string }>`
      select id, reference, full_name, topic, message, status from enquiries where institution = 'vantoris' order by created_at desc limit 30`;
    const history = await sql<{ id: string; action: string; detail: string; created_at: string }>`
      select id, action, detail, created_at::text as created_at from audit_events
      where institution = 'vantoris' order by created_at desc limit 20`;
    return { allowed: true as const, role: staff.role, self: context.userId, people, requests, risks, enquiries, history };
  });

export const addVantorisRisk = createServerFn({ method: "POST" })
  .validator((input: { title?: string; detail?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "vantoris", ["executive", "compliance"])) return { error: "Compliance authority is required." };
    const title = text(data.title, 140);
    const detail = text(data.detail, 2000);
    if (!title || !detail) return { error: "Title and detail are required." };
    const sql = await getSql();
    const riskId = id("rsk");
    await sql`insert into vantoris_risks (id, title, detail, owner_user_id) values (${riskId}, ${title}, ${detail}, ${context.userId})`;
    await audit(context.userId, "vantoris", "add_risk", "risk", riskId, title);
    return { ok: true };
  });

export const setRequestStatus = createServerFn({ method: "POST" })
  .validator((input: { requestId?: string; status?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!activeStaff(mine, "vantoris", ["executive", "operations", "relationship"])) return { error: "Not permitted." };
    const requestId = text(data.requestId, 80);
    const status = data.status === "in_progress" || data.status === "closed" ? data.status : "";
    if (!requestId || !status) return { error: "Incomplete." };
    const sql = await getSql();
    await sql`update vantoris_requests set status = ${status} where id = ${requestId}`;
    await audit(context.userId, "vantoris", "set_request_status", "request", requestId, status);
    return { ok: true };
  });
