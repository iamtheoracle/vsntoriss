import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { money } from "@/components/money";
import { PublicShell } from "@/components/public-shell";
import {
  advancePayment,
  approveAccount,
  approveObligation,
  ashcombeOffice,
  checkBranchReceipt,
  confirmIban,
  decideProfile,
  fileObligation,
  issueKycLink,
  proposeAccount,
  proposeIban,
  recordBranchReceipt,
} from "@/lib/platform.functions";

export const Route = createFileRoute("/ashcombe/office")({ component: Office });

type OfficeState = Awaited<ReturnType<typeof ashcombeOffice>>;

function Office() {
  const [office, setOffice] = useState<OfficeState | null>(null);
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  async function refresh() {
    setOffice(await ashcombeOffice());
  }

  useEffect(() => {
    refresh().catch(() => {
      window.location.assign("/login?institution=ashcombe&next=/ashcombe/office");
    });
  }, []);

  async function run(action: () => Promise<{ error?: string; token?: string; ok?: boolean }>) {
    setError("");
    const result = await action();
    if (result.error) setError(result.error);
    if (result.token) setLink(`${window.location.origin}/kyc/${result.token}`);
    await refresh();
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-xs uppercase tracking-widest text-forest">Ashcombe office</p>
        <h1 className="mt-3 font-serif text-4xl">Operations</h1>
        {error ? <p className="mt-4 text-sm text-amber">{error}</p> : null}
        {link ? <p className="mt-3 break-all text-sm">KYC link, send privately: {link}</p> : null}
        {!office ? <p className="mt-6 text-sm">Opening the office…</p> : null}
        {office && !office.allowed ? (
          <p className="mt-6 text-sm">
            {office.stepUp ? <>{office.stepUp} <Link to="/security" className="text-forest">Security</Link></> : <>No Ashcombe staff profile. <Link to="/access" className="text-forest">Access register</Link></>}
          </p>
        ) : null}
        {office && office.allowed ? (
          <div className="mt-8 space-y-12">
            <p className="text-sm text-charcoal">Signed in as {office.role}. The server refuses actions outside that role, including your own approvals. Governance registers live on the <Link to="/ashcombe/registers" className="text-forest">registers desk</Link>.</p>
            <section>
              <h2 className="font-serif text-2xl">Enquiries</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {office.enquiries.map((enquiry) => (
                  <li key={enquiry.id} className="py-4 text-sm">
                    <p className="font-medium">{enquiry.reference} · {enquiry.full_name} · {enquiry.topic}</p>
                    <p className="mt-1 text-charcoal">{enquiry.message}</p>
                    <button type="button" className="mt-2 text-forest" onClick={() => run(() => issueKycLink({ data: { enquiryId: enquiry.id } }))}>Issue KYC link</button>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Profiles</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line text-sm">
                {office.people.map((person) => (
                  <li key={person.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                    <span>{person.display_name} · {person.kind} · {person.role} · {person.status}</span>
                    {person.status === "pending" && person.user_id !== office.self ? (
                      <button type="button" className="text-forest" onClick={() => run(() => decideProfile({ data: { profileId: person.id, decision: "active" } }))}>Activate</button>
                    ) : null}
                  </li>
                ))}
              </ul>
              <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => proposeAccount({ data: { clientUserId: String(form.get("clientUserId")), name: String(form.get("name")), currency: String(form.get("currency")) } }));
              }}>
                <input className="field" name="clientUserId" placeholder="Client user id" />
                <input className="field" name="name" placeholder="Account name" />
                <select className="field" name="currency" defaultValue="EUR"><option>EUR</option><option>GBP</option><option>USD</option></select>
                <button className="min-h-11 bg-forest text-sm text-paper" type="submit">Propose account</button>
              </form>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Accounts, IBAN, branch</h2>
              {office.accounts.map((account) => (
                <article key={account.id} className="mt-4 border border-line p-4 text-sm">
                  <p>{account.name} · {account.currency} · {account.status} · {money(account.balance_cents, account.currency)}</p>
                  <p className="text-charcoal">Client {account.client_user_id} · IBAN {account.iban_status} {account.iban ?? ""}</p>
                  <div className="mt-2 flex flex-wrap gap-3">
                    {account.status === "proposed" ? <button type="button" className="text-forest" onClick={() => run(() => approveAccount({ data: { accountId: account.id } }))}>Approve opening</button> : null}
                    {account.iban_status === "proposed" ? <button type="button" className="text-forest" onClick={() => run(() => confirmIban({ data: { accountId: account.id } }))}>Confirm IBAN</button> : null}
                  </div>
                  {account.status === "active" && account.iban_status === "not_issued" ? (
                    <form className="mt-3 flex gap-2" onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      void run(() => proposeIban({ data: { accountId: account.id, iban: String(form.get("iban")) } }));
                    }}>
                      <input className="field" name="iban" placeholder="IBAN to assign" />
                      <button className="min-h-11 border border-line-strong px-3 text-sm" type="submit">Propose</button>
                    </form>
                  ) : null}
                </article>
              ))}
              <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => recordBranchReceipt({
                  data: {
                    accountId: String(form.get("accountId")),
                    amountCents: String(form.get("amountCents")),
                    branchName: String(form.get("branchName")),
                    method: String(form.get("method")),
                    narrative: String(form.get("narrative")),
                  },
                }));
              }}>
                <input className="field" name="accountId" placeholder="Account id" />
                <input className="field" name="amountCents" placeholder="Cents received" />
                <input className="field" name="branchName" placeholder="Branch" />
                <input className="field" name="method" placeholder="Cash or cheque" />
                <input className="field md:col-span-2" name="narrative" placeholder="Narrative" />
                <button className="min-h-11 bg-forest text-sm text-paper md:col-span-2" type="submit">Record branch receipt</button>
              </form>
              <ul className="mt-4 text-sm">
                {office.receipts.map((receipt) => (
                  <li key={receipt.id} className="flex justify-between border-b border-line py-2">
                    <span>{receipt.branch_name} · {receipt.method} · {money(receipt.amount_cents, receipt.currency)} · {receipt.status}</span>
                    {receipt.status === "recorded" ? <button type="button" className="text-forest" onClick={() => run(() => checkBranchReceipt({ data: { receiptId: receipt.id } }))}>Check and post</button> : null}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Payments</h2>
              <ul className="mt-3 space-y-3 text-sm">
                {office.payments.map((payment) => (
                  <li key={payment.id} className="border border-line p-3">
                    <p>{payment.beneficiary_name} · {money(payment.amount_cents, payment.currency)} · {payment.status}</p>
                    <p className="text-charcoal">{payment.reference_text}</p>
                    <div className="mt-2 flex flex-wrap gap-3">
                      <button type="button" onClick={() => run(() => advancePayment({ data: { paymentId: payment.id, step: "validate" } }))}>Validate</button>
                      <button type="button" onClick={() => run(() => advancePayment({ data: { paymentId: payment.id, step: "authorise" } }))}>Authorise</button>
                      <button type="button" onClick={() => run(() => advancePayment({ data: { paymentId: payment.id, step: "process" } }))}>Process</button>
                      <button type="button" onClick={() => run(() => advancePayment({ data: { paymentId: payment.id, step: "reject" } }))}>Reject</button>
                      <button type="button" onClick={() => run(() => advancePayment({ data: { paymentId: payment.id, step: "exception" } }))}>Park as exception</button>
                      <button type="button" onClick={() => run(() => advancePayment({ data: { paymentId: payment.id, step: "reopen" } }))}>Reopen</button>
                    </div>
                    <form className="mt-2 flex gap-2" onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      void run(() => advancePayment({ data: { paymentId: payment.id, step: "settlement", settlementReference: String(form.get("settlementReference")) } }));
                    }}>
                      <input className="field" name="settlementReference" placeholder="Settlement evidence reference" />
                      <button className="min-h-11 border border-line-strong px-3" type="submit">Record evidence</button>
                    </form>
                    <button type="button" className="mt-2 text-forest" onClick={() => run(() => advancePayment({ data: { paymentId: payment.id, step: "reconcile" } }))}>Reconcile and post debit</button>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Germany readiness</h2>
              <ul className="mt-3 space-y-4">
                {office.obligations.map((item) => (
                  <li key={item.code} className="border border-line p-4 text-sm">
                    <p className="font-medium">{item.code} · {item.title}</p>
                    <p className="mt-1 text-charcoal">{item.description}</p>
                    <p className="mt-1">{item.status} · {item.approval_status} {item.evidence_reference ? `· ${item.evidence_reference}` : ""}</p>
                    <form className="mt-2 flex gap-2" onSubmit={(event) => {
                      event.preventDefault();
                      const form = new FormData(event.currentTarget);
                      void run(() => fileObligation({ data: { code: item.code, evidence: String(form.get("evidence")), nextReview: String(form.get("nextReview") ?? "") } }));
                    }}>
                      <input className="field" name="evidence" placeholder="Evidence reference" />
                      <input className="field" name="nextReview" placeholder="YYYY-MM-DD" />
                      <button className="min-h-11 border border-line-strong px-3" type="submit">File</button>
                    </form>
                    <button type="button" className="mt-2 text-forest" onClick={() => run(() => approveObligation({ data: { code: item.code } }))}>Approve verification</button>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Audit</h2>
              <ul className="mt-3 text-sm">
                {office.history.map((event) => (
                  <li key={event.id} className="border-b border-line py-2">{event.action} · {event.entity} · {event.detail}</li>
                ))}
              </ul>
            </section>
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
