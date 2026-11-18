import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  addDepartment,
  addRisk,
  adoptPolicy,
  appointOfficer,
  approveVantorisObligation,
  closeComplaint,
  closeIncident,
  confirmDelegation,
  draftPolicy,
  draftPublication,
  fileDocument,
  fileVantorisObligation,
  proposeDelegation,
  publishWork,
  reportIncident,
  vantorisRegisters,
} from "@/lib/registers.functions";

export const Route = createFileRoute("/vantoris/registers")({ component: Registers });

type Desk = Awaited<ReturnType<typeof vantorisRegisters>>;

function Registers() {
  const [desk, setDesk] = useState<Desk | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    setDesk(await vantorisRegisters());
  }

  useEffect(() => {
    refresh().catch(() => {
      window.location.assign("/login?institution=vantoris&next=/vantoris/registers");
    });
  }, []);

  async function run(action: () => Promise<{ error?: string }>) {
    const result = await action();
    setError(result.error ?? "");
    await refresh();
  }

  return (
    <main className="min-h-screen bg-navy px-5 py-12 text-ivory">
      <div className="mx-auto max-w-3xl">
        <Link to="/vantoris/office" className="text-sm text-brass">Office</Link>
        <h1 className="mt-3 font-display text-4xl">Institutional registers</h1>
        <p className="mt-3 text-sm text-slate">Vantoris only. No accounts, IBANs, cards or Ashcombe ledger. Germany obligations are not on this desk.</p>
        {error ? <p className="mt-4 text-sm text-brass">{error}</p> : null}
        {!desk ? <p className="mt-6 text-sm">Opening the registers…</p> : null}
        {desk && !desk.allowed ? <p className="mt-6 text-sm">{desk.stepUp ? <>{desk.stepUp} <Link to="/security" className="text-brass">Security</Link></> : <>No Vantoris staff profile. <Link to="/access" className="text-brass">Access</Link></>}</p> : null}
        {desk && desk.allowed ? (
          <div className="mt-8 space-y-10 text-sm">
            <p className="text-slate">Role {desk.role}. Active officers recorded: {desk.staffCount}.</p>
            <section>
              <h2 className="font-display text-2xl">Appoint</h2>
              <form className="mt-3 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => appointOfficer({ data: { institution: "vantoris", userId: String(form.get("userId")), displayName: String(form.get("displayName")), role: String(form.get("role")) } }));
              }}>
                <input className="field text-ivory" name="userId" placeholder="Sign-in user id" required />
                <input className="field text-ivory" name="displayName" placeholder="Name" required />
                <select className="field text-ivory" name="role" defaultValue="operations">
                  <option value="operations">Operations</option>
                  <option value="compliance">Compliance</option>
                  <option value="audit">Audit</option>
                  <option value="relationship">Relationship</option>
                </select>
                <button className="min-h-11 bg-brass text-navy" type="submit">Appoint</button>
              </form>
            </section>
            <section>
              <h2 className="font-display text-2xl">Institutional obligations</h2>
              {desk.obligations.map((item) => (
                <article key={item.code} className="mt-4 border-t border-brass/40 pt-3">
                  <p>{item.code} · {item.title}</p>
                  <p className="text-slate">{item.description}</p>
                  <p className="mt-1">{item.status} · {item.approval_status}</p>
                  <form className="mt-2 flex gap-2" onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    void run(() => fileVantorisObligation({ data: { code: item.code, evidence: String(form.get("evidence")) } }));
                  }}>
                    <input className="field text-ivory" name="evidence" placeholder="Evidence reference" />
                    <button className="min-h-11 border border-brass px-3 text-brass" type="submit">File</button>
                  </form>
                  <button type="button" className="mt-2 text-brass" onClick={() => run(() => approveVantorisObligation({ data: { code: item.code } }))}>Approve</button>
                </article>
              ))}
            </section>
            <section>
              <h2 className="font-display text-2xl">Documents</h2>
              <form className="mt-3 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => fileDocument({ data: {
                  institution: "vantoris",
                  ownerUserId: String(form.get("ownerUserId")),
                  title: String(form.get("title")),
                  kind: String(form.get("kind")),
                  classification: String(form.get("classification")),
                  body: String(form.get("body")),
                } }));
              }}>
                <input className="field text-ivory" name="ownerUserId" placeholder="Member user id" required />
                <input className="field text-ivory" name="title" placeholder="Title" required />
                <input className="field text-ivory" name="kind" placeholder="Kind" required />
                <select className="field text-ivory" name="classification" defaultValue="internal"><option value="internal">Internal</option><option value="client">Visible to that member</option></select>
                <textarea className="field text-ivory" name="body" rows={3} placeholder="Record text. Not scanned." required />
                <button className="min-h-11 bg-brass text-navy" type="submit">File</button>
              </form>
              {desk.documents.map((document) => <p key={document.id} className="mt-2">{document.title} · {document.classification}</p>)}
            </section>
            <section>
              <h2 className="font-display text-2xl">Complaints, risk, incidents</h2>
              {desk.complaints.map((complaint) => (
                <p key={complaint.id} className="mt-2 flex justify-between">
                  <span>{complaint.reference} · {complaint.subject} · {complaint.status}</span>
                  {complaint.status === "open" ? <button type="button" className="text-brass" onClick={() => run(() => closeComplaint({ data: { complaintId: complaint.id } }))}>Close</button> : null}
                </p>
              ))}
              <form className="mt-4 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => addRisk({ data: { institution: "vantoris", title: String(form.get("title")), detail: String(form.get("detail")) } }));
              }}>
                <input className="field text-ivory" name="title" placeholder="Risk" required />
                <textarea className="field text-ivory" name="detail" rows={2} required />
                <button className="min-h-11 border border-brass text-brass" type="submit">Add risk</button>
              </form>
              {desk.risks.map((risk) => <p key={risk.id} className="mt-2">{risk.title} · {risk.status}</p>)}
              <form className="mt-4 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => reportIncident({ data: { institution: "vantoris", title: String(form.get("title")), detail: String(form.get("detail")), severity: String(form.get("severity")) } }));
              }}>
                <input className="field text-ivory" name="title" placeholder="Incident" required />
                <select className="field text-ivory" name="severity" defaultValue="low"><option value="low">Low</option><option value="high">High</option></select>
                <textarea className="field text-ivory" name="detail" rows={2} required />
                <button className="min-h-11 border border-brass text-brass" type="submit">Report</button>
              </form>
              {desk.incidents.map((incident) => (
                <p key={incident.id} className="mt-2 flex justify-between">
                  <span>{incident.title} · {incident.status}</span>
                  {incident.status === "open" ? <button type="button" className="text-brass" onClick={() => run(() => closeIncident({ data: { incidentId: incident.id } }))}>Close</button> : null}
                </p>
              ))}
            </section>
            <section>
              <h2 className="font-display text-2xl">Policy, research, departments</h2>
              <form className="mt-3 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => draftPolicy({ data: { institution: "vantoris", title: String(form.get("title")), body: String(form.get("body")) } }));
              }}>
                <input className="field text-ivory" name="title" placeholder="Policy" required />
                <textarea className="field text-ivory" name="body" rows={2} required />
                <button className="min-h-11 border border-brass text-brass" type="submit">Draft policy</button>
              </form>
              {desk.policies.map((policy) => (
                <p key={policy.id} className="mt-2 flex justify-between">
                  <span>{policy.title} · {policy.status}</span>
                  {policy.status === "draft" ? <button type="button" className="text-brass" onClick={() => run(() => adoptPolicy({ data: { policyId: policy.id } }))}>Adopt</button> : null}
                </p>
              ))}
              <form className="mt-4 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => draftPublication({ data: { institution: "vantoris", title: String(form.get("title")), summary: String(form.get("summary")) } }));
              }}>
                <input className="field text-ivory" name="title" placeholder="Research title" required />
                <textarea className="field text-ivory" name="summary" rows={2} required />
                <button className="min-h-11 border border-brass text-brass" type="submit">Draft publication</button>
              </form>
              {desk.publications.map((item) => (
                <p key={item.id} className="mt-2 flex justify-between">
                  <span>{item.title} · {item.status}</span>
                  {item.status === "draft" ? <button type="button" className="text-brass" onClick={() => run(() => publishWork({ data: { publicationId: item.id } }))}>Release</button> : null}
                </p>
              ))}
              <form className="mt-4 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => addDepartment({ data: { institution: "vantoris", name: String(form.get("name")), purpose: String(form.get("purpose")) } }));
              }}>
                <input className="field text-ivory" name="name" placeholder="Department" required />
                <input className="field text-ivory" name="purpose" placeholder="Purpose" required />
                <button className="min-h-11 border border-brass text-brass" type="submit">Add department</button>
              </form>
              {desk.departments.map((department) => <p key={department.id} className="mt-2">{department.name} — {department.purpose}</p>)}
              <form className="mt-4 grid gap-3" onSubmit={(event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                void run(() => proposeDelegation({ data: { institution: "vantoris", toUserId: String(form.get("toUserId")), scope: String(form.get("scope")) } }));
              }}>
                <input className="field text-ivory" name="toUserId" placeholder="Delegate user id" required />
                <textarea className="field text-ivory" name="scope" rows={2} placeholder="Scope. Confirmation does not copy a role." required />
                <button className="min-h-11 border border-brass text-brass" type="submit">Propose delegation</button>
              </form>
              {desk.delegations.map((item) => (
                <p key={item.id} className="mt-2 flex justify-between">
                  <span>To {item.to_user_id} · {item.status}</span>
                  {item.status === "proposed" ? <button type="button" className="text-brass" onClick={() => run(() => confirmDelegation({ data: { delegationId: item.id } }))}>Confirm</button> : null}
                </p>
              ))}
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
