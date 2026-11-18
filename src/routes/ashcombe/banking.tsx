import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { money } from "@/components/money";
import { PublicShell } from "@/components/public-shell";
import { ashcombeClientHome, createPayment, postMessage } from "@/lib/platform.functions";
import { clientDesk, fileComplaint, issueStatement, requestCard, revokeSession } from "@/lib/registers.functions";

export const Route = createFileRoute("/ashcombe/banking")({ component: Banking });

type Home = Awaited<ReturnType<typeof ashcombeClientHome>>;
type Desk = Awaited<ReturnType<typeof clientDesk>>;

function Banking() {
  const [home, setHome] = useState<Home | null>(null);
  const [desk, setDesk] = useState<Desk | null>(null);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  async function refresh() {
    const next = await ashcombeClientHome();
    setHome(next);
    if (next.allowed) setDesk(await clientDesk());
  }

  useEffect(() => {
    refresh().catch(() => {
      window.location.assign("/login?institution=ashcombe&next=/ashcombe/banking");
    });
  }, []);

  async function pay(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!home || !home.allowed) return;
    const form = new FormData(event.currentTarget);
    const result = await createPayment({
      data: {
        accountId: String(form.get("accountId") ?? ""),
        beneficiaryName: String(form.get("beneficiaryName") ?? ""),
        beneficiaryIban: String(form.get("beneficiaryIban") ?? ""),
        referenceText: String(form.get("referenceText") ?? ""),
        amountCents: String(form.get("amountCents") ?? ""),
        idempotencyKey: crypto.randomUUID(),
      },
    });
    if ("error" in result && result.error) setError(result.error);
    else {
      setError("");
      event.currentTarget.reset();
      await refresh();
    }
  }

  async function send(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await postMessage({ data: { institution: "ashcombe", body: String(form.get("body") ?? "") } });
    event.currentTarget.reset();
    await refresh();
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-4xl px-5 py-12">
        <p className="text-xs uppercase tracking-widest text-forest">Private banking</p>
        <h1 className="mt-3 font-serif text-4xl">Accounts</h1>
        {!home ? <p className="mt-6 text-sm">Opening the ledger…</p> : null}
        {home && !home.allowed ? (
          <p className="mt-6 text-sm leading-relaxed">
            This identity has no active Ashcombe client profile. <Link to="/access" className="text-forest">Request access</Link>. An account is not created here.
          </p>
        ) : null}
        {home && home.allowed ? (
          <div className="mt-8 space-y-10">
            <div className="grid gap-4 md:grid-cols-2">
              {home.accounts.length === 0 ? <p className="text-sm text-charcoal">No active account. Balances are not invented.</p> : null}
              {home.accounts.map((account) => (
                <article key={account.id} className="border border-line p-5">
                  <p className="text-xs uppercase tracking-widest text-charcoal">{account.currency}</p>
                  <h2 className="mt-2 font-serif text-2xl">{account.name}</h2>
                  <p className="mt-4 font-serif text-3xl">{money(account.balance_cents, account.currency)}</p>
                  <p className="mt-3 text-xs text-charcoal">
                    {account.iban_status === "issued" && account.iban ? `IBAN ${account.iban}` : "IBAN not issued"}
                  </p>
                </article>
              ))}
            </div>
            <div>
              <h2 className="font-serif text-2xl">Posted activity</h2>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {home.activity.length === 0 ? <li className="py-3 text-sm text-charcoal">No posted entries.</li> : null}
                {home.activity.map((entry) => (
                  <li key={entry.id} className="flex justify-between py-3 text-sm">
                    <span>{entry.narrative}</span>
                    <span>{entry.direction === "credit" ? "+" : "−"}{money(entry.amount_cents, entry.currency)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <form onSubmit={pay} className="space-y-3 border border-line p-5">
              <h2 className="font-serif text-2xl">Payment instruction</h2>
              <p className="text-xs text-charcoal">Submitting does not settle. Officers must validate, authorise, evidence and reconcile. An approved single-instruction limit, if one exists, is enforced. None is invented.</p>
              <select className="field" name="accountId" required>
                {home.accounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name} · {account.currency}</option>
                ))}
              </select>
              <input className="field" name="beneficiaryName" placeholder="Beneficiary name" required />
              <input className="field" name="beneficiaryIban" placeholder="Beneficiary IBAN" required />
              <input className="field" name="amountCents" inputMode="numeric" placeholder="Amount in cents" required />
              <input className="field" name="referenceText" placeholder="Reference" required />
              {error ? <p className="text-sm text-amber">{error}</p> : null}
              <button className="min-h-11 bg-forest px-5 text-sm text-paper" type="submit" disabled={home.accounts.length === 0}>Submit instruction</button>
            </form>
            <form onSubmit={send} className="space-y-3">
              <h2 className="font-serif text-2xl">Secure note</h2>
              <ul className="space-y-2 text-sm">
                {home.thread.map((message) => <li key={message.id}>{message.body}</li>)}
              </ul>
              <textarea className="field" name="body" rows={3} placeholder="Message your relationship team" required />
              <button className="min-h-11 border border-line-strong px-5 text-sm" type="submit">Send</button>
            </form>
            {desk && desk.allowed ? (
              <>
                <section>
                  <h2 className="font-serif text-2xl">Statements</h2>
                  <p className="mt-2 text-sm text-charcoal">Issued from posted entries only. Opening is the previous closing, or zero.</p>
                  {desk.statements.length === 0 ? <p className="mt-3 text-sm">None issued.</p> : null}
                  <ul className="mt-3 text-sm">
                    {desk.statements.map((statement) => (
                      <li key={statement.id} className="border-b border-line py-2">
                        {statement.period_label} · open {money(Number(statement.opening_cents), statement.currency)} · close {money(Number(statement.closing_cents), statement.currency)} · {Number(statement.line_count)} lines
                      </li>
                    ))}
                  </ul>
                  <form className="mt-3 grid gap-3 md:grid-cols-3" onSubmit={async (event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const result = await issueStatement({ data: { accountId: String(form.get("accountId")), periodLabel: String(form.get("periodLabel")) } });
                    setNote("error" in result && result.error ? result.error : "Statement issued from the posted ledger.");
                    await refresh();
                  }}>
                    <select className="field" name="accountId" required>
                      {home.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                    </select>
                    <input className="field" name="periodLabel" placeholder="Period, for example 2026-11" required />
                    <button className="min-h-11 border border-line-strong text-sm" type="submit" disabled={home.accounts.length === 0}>Issue statement</button>
                  </form>
                </section>
                <section>
                  <h2 className="font-serif text-2xl">Card request</h2>
                  <p className="mt-2 text-sm text-charcoal">This asks the bank to consider a card. It does not create a number or contact a scheme.</p>
                  <form className="mt-3 grid gap-3 md:grid-cols-3" onSubmit={async (event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const result = await requestCard({ data: { accountId: String(form.get("accountId")), label: String(form.get("label")) } });
                    setNote("error" in result && result.error ? result.error : "Request recorded. It is not a live card.");
                    event.currentTarget.reset();
                    await refresh();
                  }}>
                    <select className="field" name="accountId" required>
                      {home.accounts.map((account) => <option key={account.id} value={account.id}>{account.name}</option>)}
                    </select>
                    <input className="field" name="label" placeholder="Label, for example Travel" required />
                    <button className="min-h-11 border border-line-strong text-sm" type="submit" disabled={home.accounts.length === 0}>Request</button>
                  </form>
                  <ul className="mt-3 text-sm">
                    {desk.cards.map((card) => <li key={card.id} className="border-b border-line py-2">{card.label} · {card.status}</li>)}
                  </ul>
                </section>
                <section>
                  <h2 className="font-serif text-2xl">Documents</h2>
                  {desk.documents.length === 0 ? <p className="mt-3 text-sm text-charcoal">None filed for you.</p> : null}
                  {desk.documents.map((document) => (
                    <article key={document.id} className="mt-3 border border-line p-4 text-sm">
                      <h3 className="font-medium">{document.title}</h3>
                      <p className="mt-1 text-charcoal">{document.kind}</p>
                      <p className="mt-2 whitespace-pre-wrap">{document.body}</p>
                    </article>
                  ))}
                </section>
                <section>
                  <h2 className="font-serif text-2xl">Complaint</h2>
                  <form className="mt-3 space-y-3" onSubmit={async (event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    const result = await fileComplaint({ data: { institution: "ashcombe", subject: String(form.get("subject")), detail: String(form.get("detail")) } });
                    setNote("reference" in result && result.reference ? `Recorded ${result.reference}. It does not move money.` : result.error ?? "");
                    if ("reference" in result && result.reference) event.currentTarget.reset();
                    await refresh();
                  }}>
                    <input className="field" name="subject" placeholder="Subject" required />
                    <textarea className="field" name="detail" rows={3} placeholder="What should be looked at" required />
                    <button className="min-h-11 border border-line-strong px-5 text-sm" type="submit">File complaint</button>
                  </form>
                  <ul className="mt-3 text-sm">
                    {desk.complaints.map((complaint) => <li key={complaint.id}>{complaint.reference} · {complaint.subject} · {complaint.status}</li>)}
                  </ul>
                </section>
                <section>
                  <h2 className="font-serif text-2xl">Sessions</h2>
                  <p className="mt-2 text-sm text-charcoal">You can end one of your own sessions. A second factor is not offered by this sign-in.</p>
                  <ul className="mt-3 text-sm">
                    {desk.sessions.map((session) => (
                      <li key={session.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
                        <span className="break-all">{session.agent || "Session"} · {session.ip || "address not recorded"}</span>
                        <button type="button" className="text-forest" onClick={async () => {
                          const result = await revokeSession({ data: { sessionId: session.id } });
                          setNote(result.error ?? "Session ended.");
                          await refresh();
                        }}>End</button>
                      </li>
                    ))}
                  </ul>
                </section>
                {note ? <p className="text-sm text-amber">{note}</p> : null}
              </>
            ) : null}
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
