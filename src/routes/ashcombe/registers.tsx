import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { money } from "@/components/money";
import { PublicShell } from "@/components/public-shell";
import {
  addDepartment,
  addRisk,
  adoptPolicy,
  appointOfficer,
  approveLimit,
  ashcombeRegisters,
  closeComplaint,
  closeIncident,
  confirmDelegation,
  decideCard,
  draftPolicy,
  draftPublication,
  fileDocument,
  proposeDelegation,
  proposeLimit,
  publishWork,
  reportIncident,
} from "@/lib/registers.functions";

export const Route = createFileRoute("/ashcombe/registers")({ component: Registers });

type Desk = Awaited<ReturnType<typeof ashcombeRegisters>>;

function Registers() {
  const [desk, setDesk] = useState<Desk | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    setDesk(await ashcombeRegisters());
  }

  useEffect(() => {
    refresh().catch(() => {
      window.location.assign("/login?institution=ashcombe&next=/ashcombe/registers");
    });
  }, []);

  async function run(action: () => Promise<{ error?: string; ok?: boolean }>) {
    const result = await action();
    setError(result.error ?? "");
    await refresh();
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-5xl px-5 py-12">
        <p className="text-xs uppercase tracking-widest text-forest">Ashcombe registers</p>
        <h1 className="mt-3 font-serif text-4xl">Governance desk</h1>
        <p className="mt-3 max-w-2xl text-sm text-charcoal">
          Germany readiness stays on the <Link to="/ashcombe/office" className="text-forest">operations desk</Link>.
          Nothing here issues a card to a scheme, moves the ledger, or copies Vantoris authority.
        </p>
        {error ? <p className="mt-4 text-sm text-amber">{error}</p> : null}
        {!desk ? <p className="mt-6 text-sm">Opening the registers…</p> : null}
        {desk && !desk.allowed ? <p className="mt-6 text-sm">{desk.stepUp ? <>{desk.stepUp} <Link to="/security" className="text-forest">Security</Link></> : <>No Ashcombe staff profile. <Link to="/access" className="text-forest">Access register</Link></>}</p> : null}
        {desk && desk.allowed ? (
          <div className="mt-8 space-y-12">
            <p className="text-sm">Signed in as {desk.role}.</p>
            <section>
              <h2 className="font-serif text-2xl">Position</h2>
              <ul className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                <li className="border border-line p-4">Open Germany items<br />{Number(desk.counts?.open_obligations ?? 0)} · verified {Number(desk.counts?.verified_obligations ?? 0)}</li>
                <li className="border border-line p-4">Open instructions<br />{Number(desk.counts?.payments_open ?? 0)}</li>
                <li className="border border-line p-4">Posted client funds<br />{money(Number(desk.counts?.client_funds_cents ?? 0), "EUR")}<span className="mt-1 block text-xs text-charcoal">Sum of the ledger. Not a house balance, and not converted.</span></li>
                <li className="border border-line p-4">Open complaints<br />{Number(desk.counts?.open_complaints ?? 0)}</li>
                <li className="border border-line p-4">Open incidents<br />{Number(desk.counts?.open_incidents ?? 0)}</li>
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Appoint an officer</h2>
              <p className="mt-2 text-sm text-charcoal">Executive only. You cannot appoint yourself, and you cannot create another executive from here.</p>
              <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => appointOfficer({ data: { institution: "ashcombe", userId: String(form.get("userId")), displayName: String(form.get("displayName")), role: String(form.get("role")) } }));
              }}>
                <input className="field" name="userId" placeholder="Sign-in user id" required />
                <input className="field" name="displayName" placeholder="Name on the register" required />
                <select className="field" name="role" defaultValue="operations">
                  <option value="operations">Operations</option>
                  <option value="compliance">Compliance</option>
                  <option value="audit">Audit</option>
                  <option value="relationship">Relationship</option>
                </select>
                <button className="min-h-11 bg-forest text-sm text-paper" type="submit">Appoint</button>
              </form>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Single-instruction limits</h2>
              <p className="mt-2 text-sm text-charcoal">Until a limit is approved, none is invented. Client instructions above an active limit are refused.</p>
              <form className="mt-3 grid gap-3 md:grid-cols-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => proposeLimit({ data: { currency: String(form.get("currency")), maxCents: String(form.get("maxCents")) } }));
              }}>
                <select className="field" name="currency" defaultValue="EUR"><option>EUR</option><option>GBP</option><option>USD</option></select>
                <input className="field" name="maxCents" placeholder="Ceiling in cents" required />
                <button className="min-h-11 border border-line-strong text-sm" type="submit">Propose</button>
              </form>
              <ul className="mt-3 text-sm">
                {desk.limits.map((limit) => (
                  <li key={limit.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-line py-2">
                    <span>{limit.currency} · {money(Number(limit.max_cents), limit.currency)} · {limit.status}</span>
                    {limit.status === "proposed" ? <button type="button" className="text-forest" onClick={() => run(() => approveLimit({ data: { limitId: limit.id } }))}>Approve</button> : null}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Card requests</h2>
              <p className="mt-2 text-sm text-charcoal">Approval is internal. No PAN is stored and no scheme is contacted.</p>
              {desk.cards.length === 0 ? <p className="mt-3 text-sm">None.</p> : null}
              <ul className="mt-2 text-sm">
                {desk.cards.map((card) => (
                  <li key={card.id} className="flex flex-wrap justify-between gap-2 border-b border-line py-2">
                    <span>{card.label} · {card.status}</span>
                    {card.status === "requested" ? (
                      <span className="flex gap-3">
                        <button type="button" className="text-forest" onClick={() => run(() => decideCard({ data: { cardId: card.id, decision: "approved_internal" } }))}>Approve internally</button>
                        <button type="button" onClick={() => run(() => decideCard({ data: { cardId: card.id, decision: "declined" } }))}>Decline</button>
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Documents</h2>
              <form className="mt-3 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => fileDocument({ data: {
                  institution: "ashcombe",
                  ownerUserId: String(form.get("ownerUserId")),
                  title: String(form.get("title")),
                  kind: String(form.get("kind")),
                  classification: String(form.get("classification")),
                  body: String(form.get("body")),
                } }));
              }}>
                <input className="field" name="ownerUserId" placeholder="Owner user id, or institution" required />
                <input className="field" name="title" placeholder="Title" required />
                <input className="field" name="kind" placeholder="Kind, for example correspondence" required />
                <select className="field" name="classification" defaultValue="internal"><option value="internal">Internal</option><option value="client">Visible to that client</option></select>
                <textarea className="field" name="body" rows={4} placeholder="Text of the record, or a storage reference. Files are not scanned here." required />
                <button className="min-h-11 bg-forest text-sm text-paper" type="submit">File record</button>
              </form>
              <ul className="mt-3 text-sm">
                {desk.documents.map((document) => <li key={document.id} className="border-b border-line py-2">{document.title} · {document.classification} · {document.kind}</li>)}
              </ul>
            </section>
            <section>
              <h2 className="font-serif text-2xl">Complaints</h2>
              {desk.complaints.length === 0 ? <p className="mt-3 text-sm">None filed.</p> : null}
              {desk.complaints.map((complaint) => (
                <p key={complaint.id} className="flex flex-wrap justify-between gap-2 border-b border-line py-2 text-sm">
                  <span>{complaint.reference} · {complaint.subject} · {complaint.status}</span>
                  {complaint.status === "open" ? <button type="button" className="text-forest" onClick={() => run(() => closeComplaint({ data: { complaintId: complaint.id } }))}>Close</button> : null}
                </p>
              ))}
            </section>
            <section>
              <h2 className="font-serif text-2xl">Risk and incidents</h2>
              <form className="mt-3 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => addRisk({ data: { institution: "ashcombe", title: String(form.get("title")), detail: String(form.get("detail")) } }));
              }}>
                <input className="field" name="title" placeholder="Risk" required />
                <textarea className="field" name="detail" rows={3} placeholder="Exposure" required />
                <button className="min-h-11 border border-line-strong text-sm" type="submit">Add risk</button>
              </form>
              {desk.risks.map((risk) => <p key={risk.id} className="mt-2 text-sm">{risk.title} · {risk.status}</p>)}
              <form className="mt-6 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => reportIncident({ data: { institution: "ashcombe", title: String(form.get("title")), detail: String(form.get("detail")), severity: String(form.get("severity")) } }));
              }}>
                <input className="field" name="title" placeholder="Incident" required />
                <select className="field" name="severity" defaultValue="low"><option value="low">Low</option><option value="high">High</option></select>
                <textarea className="field" name="detail" rows={3} placeholder="What happened" required />
                <button className="min-h-11 border border-line-strong text-sm" type="submit">Report incident</button>
              </form>
              {desk.incidents.map((incident) => (
                <p key={incident.id} className="mt-2 flex justify-between text-sm">
                  <span>{incident.title} · {incident.severity} · {incident.status}</span>
                  {incident.status === "open" ? <button type="button" className="text-forest" onClick={() => run(() => closeIncident({ data: { incidentId: incident.id } }))}>Close</button> : null}
                </p>
              ))}
            </section>
            <section>
              <h2 className="font-serif text-2xl">Policy and publication</h2>
              <form className="mt-3 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => draftPolicy({ data: { institution: "ashcombe", title: String(form.get("title")), body: String(form.get("body")) } }));
              }}>
                <input className="field" name="title" placeholder="Policy title" required />
                <textarea className="field" name="body" rows={3} placeholder="Policy text" required />
                <button className="min-h-11 border border-line-strong text-sm" type="submit">Draft policy</button>
              </form>
              {desk.policies.map((policy) => (
                <p key={policy.id} className="mt-2 flex justify-between text-sm">
                  <span>{policy.title} · {policy.status}</span>
                  {policy.status === "draft" ? <button type="button" className="text-forest" onClick={() => run(() => adoptPolicy({ data: { policyId: policy.id } }))}>Adopt</button> : null}
                </p>
              ))}
              <form className="mt-6 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => draftPublication({ data: { institution: "ashcombe", title: String(form.get("title")), summary: String(form.get("summary")) } }));
              }}>
                <input className="field" name="title" placeholder="Publication title" required />
                <textarea className="field" name="summary" rows={3} placeholder="Summary that may be released" required />
                <button className="min-h-11 border border-line-strong text-sm" type="submit">Draft publication</button>
              </form>
              {desk.publications.map((item) => (
                <p key={item.id} className="mt-2 flex justify-between text-sm">
                  <span>{item.title} · {item.status}</span>
                  {item.status === "draft" ? <button type="button" className="text-forest" onClick={() => run(() => publishWork({ data: { publicationId: item.id } }))}>Release</button> : null}
                </p>
              ))}
            </section>
            <section>
              <h2 className="font-serif text-2xl">Departments and delegation</h2>
              <form className="mt-3 grid gap-3 md:grid-cols-2" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => addDepartment({ data: { institution: "ashcombe", name: String(form.get("name")), purpose: String(form.get("purpose")) } }));
              }}>
                <input className="field" name="name" placeholder="Department" required />
                <input className="field" name="purpose" placeholder="Purpose" required />
                <button className="min-h-11 border border-line-strong text-sm md:col-span-2" type="submit">Add department</button>
              </form>
              {desk.departments.map((department) => <p key={department.id} className="mt-2 text-sm">{department.name} — {department.purpose}</p>)}
              <form className="mt-6 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => proposeDelegation({ data: { institution: "ashcombe", toUserId: String(form.get("toUserId")), scope: String(form.get("scope")) } }));
              }}>
                <input className="field" name="toUserId" placeholder="Delegate user id" required />
                <textarea className="field" name="scope" rows={2} placeholder="What the note covers. Confirming it does not copy your role." required />
                <button className="min-h-11 border border-line-strong text-sm" type="submit">Propose delegation</button>
              </form>
              {desk.delegations.map((item) => (
                <p key={item.id} className="mt-2 flex justify-between text-sm">
                  <span>To {item.to_user_id} · {item.status}</span>
                  {item.status === "proposed" ? <button type="button" className="text-forest" onClick={() => run(() => confirmDelegation({ data: { delegationId: item.id } }))}>Confirm record</button> : null}
                </p>
              ))}
            </section>
          </div>
        ) : null}
      </section>
    </PublicShell>
  );
}
