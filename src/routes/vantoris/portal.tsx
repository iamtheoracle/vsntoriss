import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { createVantorisRequest, postMessage, vantorisHome } from "@/lib/platform.functions";
import { fileComplaint, memberDesk } from "@/lib/registers.functions";

export const Route = createFileRoute("/vantoris/portal")({ component: Portal });

type Home = Awaited<ReturnType<typeof vantorisHome>>;
type Desk = Awaited<ReturnType<typeof memberDesk>>;

function Portal() {
  const [home, setHome] = useState<Home | null>(null);
  const [desk, setDesk] = useState<Desk | null>(null);
  const [error, setError] = useState("");

  async function refresh() {
    const next = await vantorisHome();
    setHome(next);
    if (next.member?.status === "active") setDesk(await memberDesk());
  }

  useEffect(() => {
    refresh().catch(() => {
      window.location.assign("/login?institution=vantoris&next=/vantoris/portal");
    });
  }, []);

  return (
    <main className="min-h-screen bg-navy px-5 py-12 text-ivory">
      <Link to="/vantoris" className="text-sm text-brass">Vantoris</Link>
      <h1 className="mt-3 font-display text-4xl">Institutional portal</h1>
      {!home ? <p className="mt-6 text-sm">Opening your profile…</p> : null}
      {home && home.member?.status !== "active" ? (
        <p className="mt-6 max-w-xl text-sm text-slate">
          No active member profile. <Link to="/access" className="text-brass">Request access</Link>. Pending requests stay closed until an executive of Vantoris activates them.
        </p>
      ) : null}
      {home && home.member?.status === "active" ? (
        <div className="mt-8 max-w-2xl space-y-8">
          <p className="text-sm text-slate">{home.member.display_name} · {home.member.role}</p>
          <ul className="divide-y divide-slate/30 border-y border-slate/30 text-sm">
            {home.requests.map((request) => (
              <li key={request.id} className="py-3">
                <span className="text-brass">{request.status}</span> · {request.title}
                <p className="text-slate">{request.body}</p>
              </li>
            ))}
          </ul>
          <form className="space-y-3" onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            const result = await createVantorisRequest({ data: { title: String(form.get("title")), body: String(form.get("body")) } });
            if ("error" in result && result.error) setError(result.error);
            else {
              setError("");
              event.currentTarget.reset();
              await refresh();
            }
          }}>
            <input className="field" name="title" placeholder="Request title" required />
            <textarea className="field" name="body" rows={4} placeholder="What you are asking the institution to do" required />
            {error ? <p className="text-sm text-brass">{error}</p> : null}
            <button className="min-h-11 bg-brass px-5 text-sm text-navy" type="submit">File request</button>
          </form>
          <form className="space-y-3" onSubmit={async (event) => {
            event.preventDefault();
            const form = new FormData(event.currentTarget);
            await postMessage({ data: { institution: "vantoris", body: String(form.get("body")) } });
            event.currentTarget.reset();
            await refresh();
          }}>
            <h2 className="font-display text-2xl">Messages</h2>
            <ul className="text-sm">{home.thread.map((message) => <li key={message.id}>{message.body}</li>)}</ul>
            <textarea className="field" name="body" rows={3} required />
            <button className="min-h-11 border border-brass px-5 text-sm" type="submit">Send</button>
          </form>
          {desk && desk.allowed ? (
            <section className="space-y-3">
              <h2 className="font-display text-2xl">Records</h2>
              {desk.documents.length === 0 ? <p className="text-sm text-slate">No document has been filed for you.</p> : null}
              {desk.documents.map((document) => (
                <article key={document.id} className="border-t border-brass/40 pt-3 text-sm">
                  <h3>{document.title}</h3>
                  <p className="mt-1 whitespace-pre-wrap text-slate">{document.body}</p>
                </article>
              ))}
              <h2 className="pt-4 font-display text-2xl">Released work</h2>
              {desk.publications.length === 0 ? <p className="text-sm text-slate">None released.</p> : null}
              {desk.publications.map((paper) => <p key={paper.id} className="text-sm">{paper.title} — {paper.summary}</p>)}
              <form className="space-y-3 pt-4" onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const result = await fileComplaint({ data: { institution: "vantoris", subject: String(form.get("subject")), detail: String(form.get("detail")) } });
                setError("reference" in result && result.reference ? `Recorded ${result.reference}` : result.error ?? "");
                if ("reference" in result && result.reference) event.currentTarget.reset();
              }}>
                <h2 className="font-display text-2xl">Complaint</h2>
                <input className="field text-ivory" name="subject" placeholder="Subject" required />
                <textarea className="field text-ivory" name="detail" rows={3} placeholder="What should be looked at" required />
                <button className="min-h-11 border border-brass px-5 text-sm" type="submit">File</button>
              </form>
            </section>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
