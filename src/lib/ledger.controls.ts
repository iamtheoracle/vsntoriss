type Sql = <T>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>;

export async function approveProposedAccount(sql: Sql, accountId: string, actorId: string) {
  return sql<{ id: string }>`
    update accounts set status = 'active', checker_user_id = ${actorId}
    where id = ${accountId} and status = 'proposed' and maker_user_id <> ${actorId}
    returning id`;
}

export async function postCheckedBranchReceipt(sql: Sql, receiptId: string, actorId: string, ledgerId: string) {
  return sql<{ id: string }>`
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

export async function reconcilePayment(sql: Sql, paymentId: string, actorId: string, ledgerId: string) {
  return sql<{ id: string }>`
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

export async function reopenException(sql: Sql, paymentId: string, actorId: string) {
  return sql<{ id: string }>`
    update payment_instructions
    set status = 'submitted', maker_user_id = null, checker_user_id = null,
        settlement_reference = null, settlement_by = null, exception_by = null
    where id = ${paymentId} and status = 'exception' and coalesce(exception_by, '') <> ${actorId}
    returning id`;
}

export async function confirmDelegationRecord(sql: Sql, delegationId: string, actorId: string) {
  return sql<{ id: string; to_user_id: string }>`
    update delegations set status = 'confirmed', checker_user_id = ${actorId}
    where id = ${delegationId} and status = 'proposed' and maker_user_id <> ${actorId}
    returning id, to_user_id`;
}
