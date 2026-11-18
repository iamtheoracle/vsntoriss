import { r as getSql } from "./db-DGfkxNi8.mjs";
import { o as readStepUp } from "./mfa.store-DGQAIV_c.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/mfa.server-Bd82LlpG.js
var APPOINTABLE = [
	"operations",
	"compliance",
	"audit",
	"relationship"
];
function instructionBlockedByLimit(amountCents, limitCents) {
	if (limitCents == null) return null;
	if (!Number.isInteger(limitCents) || limitCents <= 0) return null;
	if (amountCents > limitCents) return "This instruction is above the approved single-payment limit. It was not submitted.";
	return null;
}
function appointmentRefusal(actorRole, targetRole, samePerson) {
	if (samePerson) return "You cannot change your own role.";
	if (actorRole !== "executive") return "Executive authority is required.";
	if (!APPOINTABLE.includes(targetRole)) return "That role is not granted from this desk. Executive authority stays on the founding path.";
	return null;
}
async function approveProposedAccount(sql, accountId, actorId) {
	return sql`
    update accounts set status = 'active', checker_user_id = ${actorId}
    where id = ${accountId} and status = 'proposed' and maker_user_id <> ${actorId}
    returning id`;
}
async function postCheckedBranchReceipt(sql, receiptId, actorId, ledgerId) {
	return sql`
    with upd as (
      update branch_receipts
      set status = 'posted', checker_user_id = ${actorId}
      where id = ${receiptId} and status = 'recorded' and maker_user_id <> ${actorId}
      returning id, account_id, amount_cents, currency, narrative, maker_user_id
    )
    insert into ledger_entries (id, account_id, direction, amount_cents, currency, narrative, source, source_id, posted_by, checked_by)
    select ${ledgerId}, account_id, 'credit', amount_cents, currency, narrative, 'branch_receipt', id, maker_user_id, ${actorId}
    from upd
    returning id`;
}
async function reconcilePayment(sql, paymentId, actorId, ledgerId) {
	return sql`
    with candidate as (
      select id, account_id, amount_cents, currency, reference_text, maker_user_id
      from payment_instructions
      where id = ${paymentId} and status = 'awaiting_reconciliation' and settlement_by <> ${actorId}
    ),
    funded as (
      select c.id, c.account_id, c.amount_cents, c.currency, c.reference_text, c.maker_user_id
      from candidate c
      where (
        select coalesce(sum(case when direction = 'credit' then amount_cents else -amount_cents end), 0)
        from ledger_entries where account_id = c.account_id
      ) >= c.amount_cents
    ),
    upd as (
      update payment_instructions p
      set status = 'settled', reconciled_by = ${actorId}
      from funded f where p.id = f.id
      returning p.id
    )
    insert into ledger_entries (id, account_id, direction, amount_cents, currency, narrative, source, source_id, posted_by, checked_by)
    select ${ledgerId}, f.account_id, 'debit', f.amount_cents, f.currency, f.reference_text, 'payment', f.id, coalesce(f.maker_user_id, ${actorId}), ${actorId}
    from funded f join upd u on u.id = f.id
    returning id`;
}
async function reopenException(sql, paymentId, actorId) {
	return sql`
    update payment_instructions
    set status = 'submitted', maker_user_id = null, checker_user_id = null,
        settlement_reference = null, settlement_by = null, exception_by = null
    where id = ${paymentId} and status = 'exception' and coalesce(exception_by, '') <> ${actorId}
    returning id`;
}
async function confirmDelegationRecord(sql, delegationId, actorId) {
	return sql`
    update delegations set status = 'confirmed', checker_user_id = ${actorId}
    where id = ${delegationId} and status = 'proposed' and maker_user_id <> ${actorId}
    returning id, to_user_id`;
}
async function stepUpBlock(userId, sessionId) {
	const sql = await getSql();
	return readStepUp(sql, userId, sessionId);
}
//#endregion
export { postCheckedBranchReceipt as a, stepUpBlock as c, instructionBlockedByLimit as i, approveProposedAccount as n, reconcilePayment as o, confirmDelegationRecord as r, reopenException as s, appointmentRefusal as t };
