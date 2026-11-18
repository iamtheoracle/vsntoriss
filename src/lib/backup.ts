type Sql = <T>(strings: TemplateStringsArray, ...values: unknown[]) => Promise<T[]>;

export type AshcombeSnapshot = {
  institution: "ashcombe";
  accounts: Record<string, unknown>[];
  ledger: Record<string, unknown>[];
};

export async function exportAshcombeLedger(sql: Sql): Promise<AshcombeSnapshot> {
  const accounts = await sql<Record<string, unknown>>`select id, client_user_id, name, currency, status, iban, iban_status, iban_proposed_by, maker_user_id, checker_user_id from accounts order by id`;
  const ledger = await sql<Record<string, unknown>>`select id, account_id, direction, amount_cents, currency, narrative, source, source_id, posted_by, checked_by from ledger_entries order by id`;
  return { institution: "ashcombe", accounts, ledger };
}

export async function restoreAshcombeLedger(sql: Sql, snapshot: AshcombeSnapshot) {
  if (snapshot.institution !== "ashcombe") throw new Error("Refusing a snapshot that is not Ashcombe's ledger.");
  await sql`update maintenance_flags set enabled = true where name = 'allow_restore'`;
  try {
    await sql`delete from ledger_entries`;
    await sql`delete from payment_instructions`;
    await sql`delete from branch_receipts`;
    await sql`delete from cards`;
    await sql`delete from statement_issues`;
    await sql`delete from accounts`;
    for (const row of snapshot.accounts) {
      await sql`insert into accounts (id, client_user_id, name, currency, status, iban, iban_status, iban_proposed_by, maker_user_id, checker_user_id)
        values (${row.id}, ${row.client_user_id}, ${row.name}, ${row.currency}, ${row.status}, ${row.iban}, ${row.iban_status}, ${row.iban_proposed_by}, ${row.maker_user_id}, ${row.checker_user_id})`;
    }
    for (const row of snapshot.ledger) {
      await sql`insert into ledger_entries (id, account_id, direction, amount_cents, currency, narrative, source, source_id, posted_by, checked_by)
        values (${row.id}, ${row.account_id}, ${row.direction}, ${row.amount_cents}, ${row.currency}, ${row.narrative}, ${row.source}, ${row.source_id}, ${row.posted_by}, ${row.checked_by})`;
    }
  } finally {
    await sql`update maintenance_flags set enabled = false where name = 'allow_restore'`;
  }
}

export async function postedBalance(sql: Sql, accountId: string) {
  const rows = await sql<{ cents: number }>`
    select coalesce(sum(case when direction = 'credit' then amount_cents else -amount_cents end), 0) as cents
    from ledger_entries where account_id = ${accountId}`;
  return Number(rows[0]?.cents ?? 0);
}
