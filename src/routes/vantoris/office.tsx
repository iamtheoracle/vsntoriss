import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { addVantorisRisk, decideProfile, setRequestStatus, vantorisOffice } from "@/lib/platform.functions";

export const Route = createFileRoute("/vantoris/office")({ component: Office });

type OfficeState = Awaited<ReturnType<typeof vantorisOffice>>;

function Office() {
  const [office, setOffice] = useState<OfficeState | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    setOffice(await vantorisOffice());
  }

  useEffect(() => {
    refresh().catch(() => {
      window.location.assign("/login?institution=vantoris&next=/vantoris/office");
    });
  }, []);

  async function run(action: () => Promise<{ error?: string }>) {
    const result = await action();
    setError(result.error ?? "");
    await refresh();
  }

  return (
    <main className="min-h-screen bg-navy px-5 py-12 text-ivory">
      <Link to="/vantoris" className="text-sm text-brass">Vantoris</Link>
      <h1 className="mt-3 font-display text-4xl">Institutional office</h1>
      {error ? <p className="mt-4 text-sm text-brass">{error}</p> : null}
      {!office ? <p className="mt-6 text-sm">Opening the register…</p> : null}
      {office && !office.allowed ? <p className="mt-6 text-sm">{office.stepUp ? <>{office.stepUp} <Link to="/security" className="text-brass">Security</Link></> : <>No Vantoris staff profile. <Link to="/access" className="text-brass">Access</Link></>}</p> : null}
      {office && office.allowed ? (
        <div className="mt-8 max-w-3xl space-y-10 text-sm">
          <p className="text-slate">Role {office.role}. No Ashcombe account, IBAN or payment control is available here. <Link to="/vantoris/registers" className="text-brass">Registers</Link></p>
          <section>
            <h2 className="font-display text-2xl">People</h2>
            {office.people.map((person) => (
              <p key={person.id} className="flex justify-between border-b border-slate/30 py-2">
                <span>{person.display_name} · {person.kind} · {person.status}</span>
                {person.status === "pending" && person.user_id !== office.self ? (
                  <button type="button" className="text-brass" onClick={() => run(() => decideProfile({ data: { profileId: person.id, decision: "active" } }))}>Activate</button>
                ) : null}
              </p>
            ))}
          </section>
          <section>
            <h2 className="font-display text-2xl">Requests</h2>
            {office.requests.map((request) => (
              <p key={request.id} className="border-b border-slate/30 py-2">
                {request.title} · {request.status}
                <button type="button" className="ml-3 text-brass" onClick={() => run(() => setRequestStatus({ data: { requestId: request.id, status: "in_progress" } }))}>Progress</button>
                <button type="button" className="ml-3 text-brass" onClick={() => run(() => setRequestStatus({ data: { requestId: request.id, status: "closed" } }))}>Close</button>
              </p>
            ))}
          </section>
          <section>
            <h2 className="font-display text-2xl">Enquiries</h2>
            {office.enquiries.map((enquiry) => (
              <p key={enquiry.id} className="border-b border-slate/30 py-2">{enquiry.reference} · {enquiry.full_name} · {enquiry.topic}</p>
            ))}
          </section>
          <section>
            <h2 className="font-display text-2xl">Risk</h2>
            <form className="space-y-3" onSubmit={(event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              void run(() => addVantorisRisk({ data: { title: String(form.get("title")), detail: String(form.get("detail")) } }));
            }}>
              <input className="field" name="title" placeholder="Risk title" />
              <textarea className="field" name="detail" rows={3} placeholder="What is exposed, and to whom" />
              <button className="min-h-11 bg-brass px-4 text-navy" type="submit">Add risk</button>
            </form>
            {office.risks.map((risk) => <p key={risk.id} className="mt-3">{risk.title} · {risk.status}</p>)}
          </section>
          <section>
            <h2 className="font-display text-2xl">Audit</h2>
            {office.history.map((event) => <p key={event.id}>{event.action} · {event.detail}</p>)}
          </section>
        </div>
      ) : null}
    </main>
  );
}
