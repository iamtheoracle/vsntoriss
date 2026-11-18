import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { submitEnquiry } from "@/lib/platform.functions";

export const Route = createFileRoute("/vantoris/enquire")({ component: Enquire });

function Enquire() {
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await submitEnquiry({
      data: {
        institution: "vantoris",
        fullName: String(form.get("fullName") ?? ""),
        email: String(form.get("email") ?? ""),
        country: String(form.get("country") ?? ""),
        topic: String(form.get("topic") ?? ""),
        message: String(form.get("message") ?? ""),
      },
    });
    if ("error" in result && result.error) setError(result.error);
    else if ("reference" in result && result.reference) setDone(`${result.reference}. ${result.notice ?? ""}`);
  }

  return (
    <main className="min-h-screen bg-navy px-5 py-14 text-ivory">
      <Link to="/vantoris" className="text-sm text-brass">Vantoris</Link>
      <h1 className="mt-4 font-display text-4xl">Institutional enquiry</h1>
      <p className="mt-3 max-w-xl text-sm text-slate">Sent to Vantoris operators. It does not create a banking account.</p>
      {done ? <p className="mt-8 max-w-xl text-sm">{done}</p> : (
        <form onSubmit={onSubmit} className="mt-8 max-w-xl space-y-3">
          <input className="field" name="fullName" placeholder="Name" required />
          <input className="field" name="email" type="email" placeholder="Email" required />
          <input className="field" name="country" placeholder="Jurisdiction" required />
          <select className="field" name="topic" defaultValue="Governance"><option>Governance</option><option>Research</option><option>Workforce</option><option>Partnership</option></select>
          <textarea className="field" name="message" rows={6} required placeholder="The matter, without confidential third-party data" />
          {error ? <p className="text-sm text-brass">{error}</p> : null}
          <button className="min-h-11 bg-brass px-6 text-sm text-navy" type="submit">Send to operators</button>
        </form>
      )}
    </main>
  );
}
