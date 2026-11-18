import { createServerFn } from "@tanstack/react-start";
import { appointmentRefusal } from "@/lib/controls";
import { getSql } from "@/lib/db";
import { confirmDelegationRecord } from "@/lib/ledger.controls";
import { stepUpBlock } from "@/lib/mfa.server";
import { sessionMiddleware } from "@/lib/session.middleware";

type Institution = "ashcombe" | "vantoris";

type Profile = {
  id: string;
  user_id: string;
  institution: Institution;
  kind: string;
  role: string;
  status: string;
  display_name: string;
};

const READ = ["executive", "operations", "compliance", "audit", "relationship"];

function id(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function text(value: unknown, max: number) {
  const next = String(value ?? "").trim();
  if (!next || next.length > max) return "";
  return next;
}

function institutionOf(value: unknown): Institution | "" {
  return value === "vantoris" ? "vantoris" : value === "ashcombe" ? "ashcombe" : "";
}

async function audit(actor: string, institution: string, action: string, entity: string, entityId: string, detail: string) {
  const sql = await getSql();
  await sql`insert into audit_events (id, institution, actor_user_id, action, entity, entity_id, detail)
    values (${id("aud")}, ${institution}, ${actor}, ${action}, ${entity}, ${entityId}, ${detail})`;
}

async function profilesOf(userId: string) {
  const sql = await getSql();
  return sql<Profile>`select id, user_id, institution, kind, role, status, display_name from profiles where user_id = ${userId}`;
}

function staff(profiles: Profile[], institution: Institution, roles: string[]) {
  return profiles.find(
    (profile) =>
      profile.institution === institution &&
      profile.kind === "staff" &&
      profile.status === "active" &&
      roles.includes(profile.role),
  );
}

async function notify(userId: string, institution: Institution, body: string) {
  const sql = await getSql();
  await sql`insert into notifications (id, user_id, institution, body) values (${id("ntf")}, ${userId}, ${institution}, ${body})`;
}

export const publicPublications = createServerFn({ method: "GET" })
  .validator((institution: string) => institution)
  .handler(async ({ data }) => {
    const institution = institutionOf(data);
    if (!institution) return [];
    const sql = await getSql();
    return sql<{ title: string; summary: string; created_at: string }>`
      select title, summary, created_at::text as created_at from publications
      where institution = ${institution} and status = 'published'
      order by created_at desc limit 20`;
  });

export const clientDesk = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const mine = await profilesOf(context.userId);
    const client = mine.find((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active");
    if (!client) return { allowed: false as const };
    const sql = await getSql();
    const cards = await sql<{ id: string; label: string; status: string; note: string; created_at: string }>`
      select id, label, status, note, created_at::text as created_at from cards
      where client_user_id = ${context.userId} order by created_at desc`;
    const documents = await sql<{ id: string; title: string; kind: string; body: string; created_at: string }>`
      select id, title, kind, body, created_at::text as created_at from documents
      where institution = 'ashcombe' and classification = 'client' and owner_user_id = ${context.userId}
      order by created_at desc`;
    const statements = await sql<{
      id: string; period_label: string; opening_cents: number; closing_cents: number; line_count: number; created_at: string; currency: string;
    }>`
      select s.id, s.period_label, s.opening_cents, s.closing_cents, s.line_count, s.created_at::text as created_at, a.currency
      from statement_issues s join accounts a on a.id = s.account_id
      where a.client_user_id = ${context.userId} order by s.created_at desc`;
    const complaints = await sql<{ id: string; reference: string; subject: string; status: string }>`
      select id, reference, subject, status from complaints
      where institution = 'ashcombe' and created_by = ${context.userId} order by created_at desc`;
    const limits = await sql<{ currency: string; max_cents: number }>`
      select currency, max_cents from approval_limits where institution = 'ashcombe' and status = 'active'`;
    const sessions = await sql<{ id: string; created_at: string; expires_at: string; ip: string; agent: string }>`
      select "id", "createdAt"::text as created_at, "expiresAt"::text as expires_at,
        coalesce("ipAddress", '') as ip, coalesce("userAgent", '') as agent
      from "session" where "userId" = ${context.userId} order by "createdAt" desc`;
    return { allowed: true as const, cards, documents, statements, complaints, limits, sessions };
  });

export const requestCard = createServerFn({ method: "POST" })
  .validator((input: { accountId?: string; label?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await profilesOf(context.userId);
    if (!mine.some((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active")) {
      return { error: "An active private-client profile is required." };
    }
    const accountId = text(data.accountId, 80);
    const label = text(data.label, 80);
    if (!accountId || !label) return { error: "Choose an account and a label." };
    const sql = await getSql();
    const owned = await sql<{ id: string }>`
      select id from accounts where id = ${accountId} and client_user_id = ${context.userId} and status = 'active'`;
    if (!owned[0]) return { error: "Account not available." };
    const cardId = id("crd");
    await sql`insert into cards (id, account_id, client_user_id, label, status, maker_user_id, note)
      values (${cardId}, ${accountId}, ${context.userId}, ${label}, 'requested', ${context.userId},
        'Internal request only. No PAN and no scheme issuance.')`;
    await audit(context.userId, "ashcombe", "request_card", "card", cardId, label);
    return { ok: true };
  });

export const decideCard = createServerFn({ method: "POST" })
  .validator((input: { cardId?: string; decision?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, "ashcombe", ["executive"])) return { error: "Executive approval is required." };
    const cardId = text(data.cardId, 80);
    const decision = data.decision === "approved_internal" || data.decision === "declined" ? data.decision : "";
    if (!cardId || !decision) return { error: "Incomplete decision." };
    const sql = await getSql();
    const updated = await sql<{ client_user_id: string }>`
      update cards set status = ${decision}, checker_user_id = ${context.userId}
      where id = ${cardId} and status = 'requested' and maker_user_id <> ${context.userId}
      returning client_user_id`;
    if (!updated[0]) return { error: "Card request was not decided. You cannot approve your own request, and nothing is sent to a card scheme." };
    await notify(updated[0].client_user_id, "ashcombe", `Card request ${decision.replace("_", " ")}. No card has been issued to a network.`);
    await audit(context.userId, "ashcombe", "decide_card", "card", cardId, decision);
    return { ok: true };
  });

export const issueStatement = createServerFn({ method: "POST" })
  .validator((input: { accountId?: string; periodLabel?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const mine = await profilesOf(context.userId);
    const accountId = text(data.accountId, 80);
    const periodLabel = text(data.periodLabel, 40);
    if (!accountId || !periodLabel) return { error: "Account and period label are required." };
    const client = mine.some((profile) => profile.institution === "ashcombe" && profile.kind === "client" && profile.status === "active");
    const officer = staff(mine, "ashcombe", ["executive", "operations", "relationship"]);
    if (!client && !officer) return { error: "Not permitted." };
    const sql = await getSql();
    const accounts = await sql<{ id: string; client_user_id: string }>`
      select id, client_user_id from accounts where id = ${accountId} and status = 'active'`;
    const account = accounts[0];
    if (!account) return { error: "Active account not found." };
    if (!officer && account.client_user_id !== context.userId) return { error: "That account is not yours." };
    const lines = await sql<{ closing_cents: number; line_count: number }>`
      select coalesce(sum(case when direction = 'credit' then amount_cents else -amount_cents end), 0) as closing_cents,
        count(*) as line_count
      from ledger_entries where account_id = ${accountId}`;
    const prior = await sql<{ closing_cents: number }>`
      select closing_cents from statement_issues where account_id = ${accountId} order by created_at desc limit 1`;
    const closing = Number(lines[0]?.closing_cents ?? 0);
    const opening = prior[0] ? Number(prior[0].closing_cents) : 0;
    const statementId = id("stm");
    await sql`insert into statement_issues (id, account_id, period_label, opening_cents, closing_cents, line_count, issued_by)
      values (${statementId}, ${accountId}, ${periodLabel}, ${opening}, ${closing}, ${Number(lines[0]?.line_count ?? 0)}, ${context.userId})`;
    await audit(context.userId, "ashcombe", "issue_statement", "statement", statementId, periodLabel);
    return { ok: true };
  });

export const fileComplaint = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; subject?: string; detail?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const institution = institutionOf(data.institution);
    const subject = text(data.subject, 160);
    const detail = text(data.detail, 4000);
    if (!institution || !subject || detail.length < 20) return { error: "Institution, subject and a full account are required." };
    const mine = await profilesOf(context.userId);
    const holder = mine.find((profile) => profile.institution === institution && profile.status === "active");
    if (!holder) return { error: "An active profile at that institution is required." };
    const sql = await getSql();
    const reference = `${institution === "ashcombe" ? "APB-C" : "VPI-C"}-${Date.now().toString(36).toUpperCase()}`;
    const complaintId = id("cmp");
    await sql`insert into complaints (id, institution, reference, complainant, subject, detail, created_by)
      values (${complaintId}, ${institution}, ${reference}, ${holder.display_name}, ${subject}, ${detail}, ${context.userId})`;
    await audit(context.userId, institution, "file_complaint", "complaint", complaintId, reference);
    return { reference };
  });

export const closeComplaint = createServerFn({ method: "POST" })
  .validator((input: { complaintId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const complaintId = text(data.complaintId, 80);
    const sql = await getSql();
    const rows = await sql<{ institution: Institution; created_by: string }>`
      select institution, created_by from complaints where id = ${complaintId} and status = 'open'`;
    const row = rows[0];
    if (!row) return { error: "Open complaint not found." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, row.institution, ["executive", "compliance"])) return { error: "Compliance authority is required." };
    if (row.created_by === context.userId) return { error: "You cannot close a complaint you filed." };
    const updated = await sql<{ id: string }>`
      update complaints set status = 'closed', owner_user_id = ${context.userId}
      where id = ${complaintId} and status = 'open' and created_by <> ${context.userId}
      returning id`;
    if (!updated[0]) return { error: "Complaint was not closed." };
    await audit(context.userId, row.institution, "close_complaint", "complaint", complaintId, "closed");
    return { ok: true };
  });

export const revokeSession = createServerFn({ method: "POST" })
  .validator((input: { sessionId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const sessionId = text(data.sessionId, 80);
    if (!sessionId) return { error: "Session not found." };
    const sql = await getSql();
    const removed = await sql<{ id: string }>`
      delete from "session" where "id" = ${sessionId} and "userId" = ${context.userId} returning "id"`;
    if (!removed[0]) return { error: "That session is not yours." };
    await sql`delete from mfa_step_up where session_id = ${sessionId} and user_id = ${context.userId}`;
    await audit(context.userId, "ashcombe", "revoke_session", "session", sessionId, "Ended one own session.");
    return { ok: true };
  });

export const ashcombeRegisters = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const mine = await profilesOf(context.userId);
    const officer = staff(mine, "ashcombe", READ);
    if (!officer) return { allowed: false as const, stepUp: null as string | null };
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { allowed: false as const, stepUp: stepped };
    const sql = await getSql();
    const limits = await sql<{ id: string; currency: string; max_cents: number; status: string; maker_user_id: string }>`
      select id, currency, max_cents, status, maker_user_id from approval_limits
      where institution = 'ashcombe' order by created_at desc`;
    const cards = await sql<{ id: string; label: string; status: string; client_user_id: string; maker_user_id: string }>`
      select id, label, status, client_user_id, maker_user_id from cards order by created_at desc limit 40`;
    const documents = await sql<{ id: string; title: string; kind: string; classification: string; owner_user_id: string }>`
      select id, title, kind, classification, owner_user_id from documents
      where institution = 'ashcombe' order by created_at desc limit 40`;
    const complaints = await sql<{ id: string; reference: string; subject: string; status: string; created_by: string }>`
      select id, reference, subject, status, created_by from complaints
      where institution = 'ashcombe' order by created_at desc limit 40`;
    const risks = await sql<{ id: string; title: string; status: string }>`
      select id, title, status from institution_risks where institution = 'ashcombe' order by created_at desc`;
    const incidents = await sql<{ id: string; title: string; severity: string; status: string; reported_by: string }>`
      select id, title, severity, status, reported_by from incidents where institution = 'ashcombe' order by created_at desc`;
    const policies = await sql<{ id: string; title: string; status: string; owner_user_id: string }>`
      select id, title, status, owner_user_id from policies where institution = 'ashcombe' order by created_at desc`;
    const publications = await sql<{ id: string; title: string; status: string; author_user_id: string }>`
      select id, title, status, author_user_id from publications where institution = 'ashcombe' order by created_at desc`;
    const departments = await sql<{ id: string; name: string; purpose: string }>`
      select id, name, purpose from departments where institution = 'ashcombe' order by name`;
    const delegations = await sql<{ id: string; from_user_id: string; to_user_id: string; scope: string; status: string; maker_user_id: string }>`
      select id, from_user_id, to_user_id, scope, status, maker_user_id from delegations
      where institution = 'ashcombe' order by created_at desc`;
    const counts = await sql<{
      open_obligations: number; verified_obligations: number; open_complaints: number; open_incidents: number;
      payments_open: number; client_funds_cents: number;
    }>`
      select
        (select count(*) from obligations where status <> 'verified') as open_obligations,
        (select count(*) from obligations where status = 'verified') as verified_obligations,
        (select count(*) from complaints where institution = 'ashcombe' and status = 'open') as open_complaints,
        (select count(*) from incidents where institution = 'ashcombe' and status = 'open') as open_incidents,
        (select count(*) from payment_instructions where status not in ('settled', 'rejected')) as payments_open,
        (select coalesce(sum(case when direction = 'credit' then amount_cents else -amount_cents end), 0) from ledger_entries) as client_funds_cents`;
    return {
      allowed: true as const,
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
      counts: counts[0],
    };
  });

export const appointOfficer = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; userId?: string; displayName?: string; role?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const institution = institutionOf(data.institution);
    const userId = text(data.userId, 80);
    const displayName = text(data.displayName, 80);
    const role = text(data.role, 40);
    if (!institution || !userId || !displayName || !role) return { error: "Institution, person, name and role are required." };
    const mine = await profilesOf(context.userId);
    const actor = staff(mine, institution, ["executive"]);
    const refusal = appointmentRefusal(actor?.role ?? "", role, userId === context.userId);
    if (refusal) return { error: refusal };
    const sql = await getSql();
    const known = await sql<{ id: string }>`select id from "user" where id = ${userId}`;
    if (!known[0]) return { error: "That person has no sign-in identity yet." };
    const inserted = await sql<{ id: string }>`
      insert into profiles (id, user_id, institution, kind, role, status, display_name)
      values (${id("prf")}, ${userId}, ${institution}, 'staff', ${role}, 'active', ${displayName})
      on conflict (user_id, institution, kind) do nothing
      returning id`;
    if (!inserted[0]) return { error: "This person already has a staff profile at that institution." };
    await notify(userId, institution, `You have been appointed ${role}. This does not grant the other institution's authority.`);
    await audit(context.userId, institution, "appoint_officer", "profile", inserted[0].id, role);
    return { ok: true };
  });

export const proposeLimit = createServerFn({ method: "POST" })
  .validator((input: { currency?: string; maxCents?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, "ashcombe", ["executive", "operations"])) return { error: "Operations authority is required." };
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

export const approveLimit = createServerFn({ method: "POST" })
  .validator((input: { limitId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, "ashcombe", ["executive"])) return { error: "Executive approval is required." };
    const limitId = text(data.limitId, 80);
    const sql = await getSql();
    const approved = await sql<{ id: string }>`
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
      select id from approved`;
    if (!approved[0]) return { error: "Limit was not approved. The officer who proposed it cannot approve it." };
    await audit(context.userId, "ashcombe", "approve_limit", "limit", limitId, "active");
    return { ok: true };
  });

export const fileDocument = createServerFn({ method: "POST" })
  .validator((input: Record<string, string>) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const institution = institutionOf(data.institution);
    const ownerUserId = text(data.ownerUserId, 80);
    const title = text(data.title, 160);
    const kind = text(data.kind, 40);
    const body = text(data.body, 8000);
    const classification = data.classification === "client" || data.classification === "internal" ? data.classification : "";
    if (!institution || !ownerUserId || !title || !kind || body.length < 10 || !classification) {
      return { error: "A complete document record is required. Paste the text or a storage reference. Nothing is virus-scanned here." };
    }
    const mine = await profilesOf(context.userId);
    if (!staff(mine, institution, ["executive", "compliance", "relationship", "operations"])) return { error: "Not permitted." };
    const sql = await getSql();
    const docId = id("doc");
    await sql`insert into documents (id, institution, owner_user_id, title, kind, body, classification, created_by)
      values (${docId}, ${institution}, ${ownerUserId}, ${title}, ${kind}, ${body}, ${classification}, ${context.userId})`;
    await audit(context.userId, institution, "file_document", "document", docId, title);
    return { ok: true };
  });

export const addRisk = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; title?: string; detail?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const institution = institutionOf(data.institution);
    const title = text(data.title, 160);
    const detail = text(data.detail, 4000);
    if (!institution || !title || !detail) return { error: "Title and detail are required." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, institution, ["executive", "compliance"])) return { error: "Compliance authority is required." };
    const sql = await getSql();
    const riskId = id("irk");
    await sql`insert into institution_risks (id, institution, title, detail, owner_user_id)
      values (${riskId}, ${institution}, ${title}, ${detail}, ${context.userId})`;
    await audit(context.userId, institution, "add_institution_risk", "risk", riskId, title);
    return { ok: true };
  });

export const reportIncident = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; title?: string; detail?: string; severity?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const institution = institutionOf(data.institution);
    const title = text(data.title, 160);
    const detail = text(data.detail, 4000);
    const severity = data.severity === "low" || data.severity === "high" ? data.severity : "";
    if (!institution || !title || !detail || !severity) return { error: "Title, detail and severity are required." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, institution, READ)) return { error: "Staff authority is required." };
    const sql = await getSql();
    const incidentId = id("inc");
    await sql`insert into incidents (id, institution, title, detail, severity, reported_by)
      values (${incidentId}, ${institution}, ${title}, ${detail}, ${severity}, ${context.userId})`;
    await audit(context.userId, institution, "report_incident", "incident", incidentId, severity);
    return { ok: true };
  });

export const closeIncident = createServerFn({ method: "POST" })
  .validator((input: { incidentId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const incidentId = text(data.incidentId, 80);
    const sql = await getSql();
    const rows = await sql<{ institution: Institution; reported_by: string }>`
      select institution, reported_by from incidents where id = ${incidentId} and status = 'open'`;
    const row = rows[0];
    if (!row) return { error: "Open incident not found." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, row.institution, ["executive"])) return { error: "Executive closure is required." };
    if (row.reported_by === context.userId) return { error: "You cannot close an incident you reported." };
    const updated = await sql<{ id: string }>`
      update incidents set status = 'closed', closed_by = ${context.userId}
      where id = ${incidentId} and status = 'open' and reported_by <> ${context.userId}
      returning id`;
    if (!updated[0]) return { error: "Incident was not closed." };
    await audit(context.userId, row.institution, "close_incident", "incident", incidentId, "closed");
    return { ok: true };
  });

export const draftPolicy = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; title?: string; body?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const institution = institutionOf(data.institution);
    const title = text(data.title, 160);
    const body = text(data.body, 8000);
    if (!institution || !title || body.length < 20) return { error: "A policy needs a title and text." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, institution, ["executive", "compliance"])) return { error: "Compliance authority is required." };
    const sql = await getSql();
    const policyId = id("pol");
    await sql`insert into policies (id, institution, title, body, owner_user_id)
      values (${policyId}, ${institution}, ${title}, ${body}, ${context.userId})`;
    await audit(context.userId, institution, "draft_policy", "policy", policyId, title);
    return { ok: true };
  });

export const adoptPolicy = createServerFn({ method: "POST" })
  .validator((input: { policyId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const policyId = text(data.policyId, 80);
    const sql = await getSql();
    const rows = await sql<{ institution: Institution }>`
      select institution from policies where id = ${policyId} and status = 'draft' and owner_user_id <> ${context.userId}`;
    const row = rows[0];
    if (!row) return { error: "Draft not available to you. The author cannot adopt it." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, row.institution, ["executive"])) return { error: "Executive adoption is required." };
    const updated = await sql<{ id: string }>`
      update policies set status = 'adopted', approved_by = ${context.userId}
      where id = ${policyId} and status = 'draft' and owner_user_id <> ${context.userId}
      returning id`;
    if (!updated[0]) return { error: "Policy was not adopted." };
    await audit(context.userId, row.institution, "adopt_policy", "policy", policyId, "adopted");
    return { ok: true };
  });

export const draftPublication = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; title?: string; summary?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const institution = institutionOf(data.institution);
    const title = text(data.title, 160);
    const summary = text(data.summary, 2000);
    if (!institution || !title || summary.length < 20) return { error: "Title and summary are required." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, institution, ["executive", "compliance", "relationship"])) return { error: "Not permitted." };
    const sql = await getSql();
    const publicationId = id("pub");
    await sql`insert into publications (id, institution, title, summary, author_user_id)
      values (${publicationId}, ${institution}, ${title}, ${summary}, ${context.userId})`;
    await audit(context.userId, institution, "draft_publication", "publication", publicationId, title);
    return { ok: true };
  });

export const publishWork = createServerFn({ method: "POST" })
  .validator((input: { publicationId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const publicationId = text(data.publicationId, 80);
    const sql = await getSql();
    const rows = await sql<{ institution: Institution }>`
      select institution from publications where id = ${publicationId} and status = 'draft' and author_user_id <> ${context.userId}`;
    const row = rows[0];
    if (!row) return { error: "The author cannot publish their own draft." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, row.institution, ["executive"])) return { error: "Executive release is required." };
    const updated = await sql<{ id: string }>`
      update publications set status = 'published', published_by = ${context.userId}
      where id = ${publicationId} and status = 'draft' and author_user_id <> ${context.userId}
      returning id`;
    if (!updated[0]) return { error: "Publication was not released." };
    await audit(context.userId, row.institution, "publish", "publication", publicationId, "published");
    return { ok: true };
  });

export const addDepartment = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; name?: string; purpose?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const institution = institutionOf(data.institution);
    const name = text(data.name, 80);
    const purpose = text(data.purpose, 400);
    if (!institution || !name || !purpose) return { error: "Name and purpose are required." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, institution, ["executive"])) return { error: "Executive authority is required." };
    const sql = await getSql();
    await sql`insert into departments (id, institution, name, purpose, created_by)
      values (${id("dep")}, ${institution}, ${name}, ${purpose}, ${context.userId})
      on conflict (institution, name) do nothing`;
    await audit(context.userId, institution, "add_department", "department", name, purpose);
    return { ok: true };
  });

export const proposeDelegation = createServerFn({ method: "POST" })
  .validator((input: { institution?: string; toUserId?: string; scope?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const institution = institutionOf(data.institution);
    const toUserId = text(data.toUserId, 80);
    const scope = text(data.scope, 400);
    if (!institution || !toUserId || scope.length < 10) return { error: "Name the person and the scope." };
    if (toUserId === context.userId) return { error: "You cannot delegate to yourself." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, institution, ["executive"])) return { error: "Executive authority is required." };
    const sql = await getSql();
    const delegationId = id("del");
    await sql`insert into delegations (id, institution, from_user_id, to_user_id, scope, maker_user_id)
      values (${delegationId}, ${institution}, ${context.userId}, ${toUserId}, ${scope}, ${context.userId})`;
    await audit(context.userId, institution, "propose_delegation", "delegation", delegationId, "Record only. Authority is unchanged.");
    return { ok: true };
  });

export const confirmDelegation = createServerFn({ method: "POST" })
  .validator((input: { delegationId?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const delegationId = text(data.delegationId, 80);
    const sql = await getSql();
    const rows = await sql<{ institution: Institution }>`
      select institution from delegations where id = ${delegationId} and status = 'proposed' and maker_user_id <> ${context.userId}`;
    const row = rows[0];
    if (!row) return { error: "The proposer cannot confirm their own delegation." };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, row.institution, ["executive"])) return { error: "A different executive must confirm it." };
    const updated = await confirmDelegationRecord(sql, delegationId, context.userId);
    if (!updated[0]) return { error: "Delegation was not confirmed. Roles are unchanged either way." };
    await audit(context.userId, row.institution, "confirm_delegation", "delegation", delegationId, "confirmed record; no role copied");
    return { ok: true };
  });

export const fileVantorisObligation = createServerFn({ method: "POST" })
  .validator((input: { code?: string; evidence?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, "vantoris", ["executive", "compliance"])) return { error: "Compliance authority is required." };
    const code = text(data.code, 20);
    const evidence = text(data.evidence, 240);
    if (!code.startsWith("VP-") || !evidence) return { error: "Evidence is required. This register is not the German banking tracker." };
    const sql = await getSql();
    const updated = await sql<{ code: string }>`
      update institution_obligations set evidence_reference = ${evidence}, owner_user_id = ${context.userId}, approval_status = 'pending_approval'
      where code = ${code} and institution = 'vantoris' and approval_status <> 'verified'
      returning code`;
    if (!updated[0]) return { error: "Obligation not updated." };
    await audit(context.userId, "vantoris", "file_institution_obligation", "obligation", code, evidence);
    return { ok: true };
  });

export const approveVantorisObligation = createServerFn({ method: "POST" })
  .validator((input: { code?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { error: stepped };
    const mine = await profilesOf(context.userId);
    if (!staff(mine, "vantoris", ["executive"])) return { error: "Executive approval is required." };
    const code = text(data.code, 20);
    const sql = await getSql();
    const updated = await sql<{ code: string }>`
      update institution_obligations set status = 'verified', approval_status = 'verified', reviewer_user_id = ${context.userId}
      where code = ${code} and institution = 'vantoris' and approval_status = 'pending_approval'
        and owner_user_id <> ${context.userId} and evidence_reference is not null
      returning code`;
    if (!updated[0]) return { error: "Verification refused. A different officer and evidence are both required." };
    await audit(context.userId, "vantoris", "verify_institution_obligation", "obligation", code, "verified");
    return { ok: true };
  });

export const vantorisRegisters = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const mine = await profilesOf(context.userId);
    const officer = staff(mine, "vantoris", READ);
    if (!officer) return { allowed: false as const, stepUp: null as string | null };
    const stepped = await stepUpBlock(context.userId, context.sessionId);
    if (stepped) return { allowed: false as const, stepUp: stepped };
    const sql = await getSql();
    const obligations = await sql<{ code: string; title: string; description: string; status: string; approval_status: string; evidence_reference: string | null }>`
      select code, title, description, status, approval_status, evidence_reference
      from institution_obligations where institution = 'vantoris' order by code`;
    const documents = await sql<{ id: string; title: string; classification: string; owner_user_id: string }>`
      select id, title, classification, owner_user_id from documents where institution = 'vantoris' order by created_at desc limit 30`;
    const complaints = await sql<{ id: string; reference: string; subject: string; status: string; created_by: string }>`
      select id, reference, subject, status, created_by from complaints where institution = 'vantoris' order by created_at desc limit 30`;
    const risks = await sql<{ id: string; title: string; status: string }>`
      select id, title, status from institution_risks where institution = 'vantoris' order by created_at desc`;
    const incidents = await sql<{ id: string; title: string; severity: string; status: string; reported_by: string }>`
      select id, title, severity, status, reported_by from incidents where institution = 'vantoris' order by created_at desc`;
    const policies = await sql<{ id: string; title: string; status: string; owner_user_id: string }>`
      select id, title, status, owner_user_id from policies where institution = 'vantoris' order by created_at desc`;
    const publications = await sql<{ id: string; title: string; status: string; author_user_id: string }>`
      select id, title, status, author_user_id from publications where institution = 'vantoris' order by created_at desc`;
    const departments = await sql<{ id: string; name: string; purpose: string }>`
      select id, name, purpose from departments where institution = 'vantoris' order by name`;
    const delegations = await sql<{ id: string; to_user_id: string; scope: string; status: string; maker_user_id: string }>`
      select id, to_user_id, scope, status, maker_user_id from delegations where institution = 'vantoris' order by created_at desc`;
    const people = await sql<{ n: number }>`
      select count(*) as n from profiles where institution = 'vantoris' and kind = 'staff' and status = 'active'`;
    return {
      allowed: true as const,
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
      staffCount: Number(people[0]?.n ?? 0),
    };
  });

export const memberDesk = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const mine = await profilesOf(context.userId);
    const member = mine.find((profile) => profile.institution === "vantoris" && profile.kind === "member" && profile.status === "active");
    if (!member) return { allowed: false as const };
    const sql = await getSql();
    const documents = await sql<{ id: string; title: string; kind: string; body: string }>`
      select id, title, kind, body from documents
      where institution = 'vantoris' and classification = 'client' and owner_user_id = ${context.userId}
      order by created_at desc`;
    const publications = await sql<{ id: string; title: string; summary: string }>`
      select id, title, summary from publications where institution = 'vantoris' and status = 'published' order by created_at desc`;
    return { allowed: true as const, documents, publications };
  });
