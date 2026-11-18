import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { readKycInvite, submitKyc } from "@/lib/platform.functions";

export const Route = createFileRoute("/kyc/$token")({ component: Kyc });

function Kyc() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"loading" | "open" | "closed" | "done">("loading");
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    readKycInvite({ data: token }).then((result) => {
      if (result.state === "open") {
        setState("open");
        setReference(result.reference);
      } else setState("closed");
    });
  }, [token]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const result = await submitKyc({
      data: {
        token,
        legalName: String(form.get("legalName") ?? ""),
        dateOfBirth: String(form.get("dateOfBirth") ?? ""),
        nationality: String(form.get("nationality") ?? ""),
        residence: String(form.get("residence") ?? ""),
        sourceOfFunds: String(form.get("sourceOfFunds") ?? ""),
      },
    });
    if ("error" in result && result.error) setError(result.error);
    else setState("done");
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-16">
      <p className="text-xs uppercase tracking-widest text-forest">Ashcombe due diligence</p>
      <h1 className="mt-3 font-serif text-4xl">Private invitation</h1>
      {state === "loading" ? <p className="mt-6 text-sm">Checking the link…</p> : null}
      {state === "closed" ? <p className="mt-6 text-sm text-amber">This link is closed. It cannot be used to register.</p> : null}
      {state === "done" ? (
        <p className="mt-6 text-sm leading-relaxed">
          Received. This does not open an account. A member of staff will contact you.
        </p>
      ) : null}
      {state === "open" ? (
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <p className="text-sm text-ink-muted">Enquiry {reference}. Complete this only if Ashcombe sent you the link.</p>
          <input className="field" name="legalName" placeholder="Legal name" required />
          <input className="field" name="dateOfBirth" placeholder="Date of birth" required />
          <input className="field" name="nationality" placeholder="Nationality" required />
          <input className="field" name="residence" placeholder="Country of residence" required />
          <textarea className="field" name="sourceOfFunds" rows={5} placeholder="Source of funds, in outline" required />
          {error ? <p className="text-sm text-amber">{error}</p> : null}
          <button className="min-h-11 bg-forest px-6 text-sm text-paper" type="submit">Submit to compliance</button>
        </form>
      ) : null}
    </main>
  );
}
