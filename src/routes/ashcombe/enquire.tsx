import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { submitEnquiry } from "@/lib/platform.functions";

export const Route = createFileRoute("/ashcombe/enquire")({ component: Enquire });

function Enquire() {
  const [notice, setNotice] = useState("");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await submitEnquiry({
      data: {
        institution: "ashcombe",
        fullName: String(form.get("fullName") ?? ""),
        email: String(form.get("email") ?? ""),
        country: String(form.get("country") ?? ""),
        topic: String(form.get("topic") ?? ""),
        message: String(form.get("message") ?? ""),
      },
    });
    if ("error" in result && result.error) {
      setError(result.error);
      return;
    }
    if ("reference" in result && result.reference) {
      setReference(result.reference);
      setNotice(result.notice ?? "");
    }
  }

  return (
    <PublicShell>
      <section className="mx-auto max-w-xl px-5 py-14">
        <p className="text-xs uppercase tracking-widest text-forest">Operators only</p>
        <h1 className="mt-3 font-serif text-4xl">Private enquiry</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          This form does not create an account and it is not a public KYC register. The operators in charge receive it. A member of staff will contact you.
        </p>
        {reference ? (
          <div className="mt-8 border border-line bg-paper-warm p-6">
            <p className="font-serif text-2xl">{reference}</p>
            <p className="mt-3 text-sm leading-relaxed">{notice}</p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input className="field" name="fullName" placeholder="Full name" required />
            <input className="field" name="email" type="email" placeholder="Email" required />
            <input className="field" name="country" placeholder="Country of residence" required />
            <select className="field" name="topic" required defaultValue="Private banking">
              <option>Private banking</option>
              <option>Wealth</option>
              <option>Treasury</option>
              <option>Institutional</option>
            </select>
            <textarea className="field" name="message" rows={6} placeholder="What relationship are you asking the operators to consider?" required />
            {error ? <p className="text-sm text-amber">{error}</p> : null}
            <button className="min-h-11 bg-forest px-6 text-sm text-paper" type="submit">Send to operators</button>
          </form>
        )}
      </section>
    </PublicShell>
  );
}
