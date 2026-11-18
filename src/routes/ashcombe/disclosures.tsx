import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PublicShell } from "@/components/public-shell";
import { publicPublications } from "@/lib/registers.functions";

export const Route = createFileRoute("/ashcombe/disclosures")({ component: Disclosures });

function Disclosures() {
  const [papers, setPapers] = useState<Array<{ title: string; summary: string }>>([]);

  useEffect(() => {
    publicPublications({ data: "ashcombe" }).then(setPapers).catch(() => setPapers([]));
  }, []);

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-5 py-14">
        <p className="text-xs uppercase tracking-widest text-forest">Ashcombe Private Bank</p>
        <h1 className="mt-3 font-serif text-4xl">Disclosures</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-charcoal">
          <p>Ashcombe is being established as an independent private bank on this platform. A banking licence, deposit guarantee and live interbank connection are not claimed, because none has been verified.</p>
          <p>Germany is the first readiness perimeter. Thirteen obligations remain open until evidence is filed and a different officer approves it. Switzerland is a later workstream and is not open.</p>
          <p>An enquiry does not open an account. Due diligence is a private link. Staff contact the applicant. Payment instructions settle only when evidence exists, a different officer reconciles them, and the posted ledger can fund them.</p>
          <p>Card requests, where accepted, are internal records. They do not create a PAN or contact a card scheme.</p>
          <p>Careers are not a public registration. Authority is appointed by an executive onto an existing sign-in, never by the applicant. Officer actions also require a second factor on that session.</p>
        </div>
        <h2 className="mt-12 font-serif text-2xl">Released publications</h2>
        {papers.length === 0 ? <p className="mt-3 text-sm text-charcoal">None released.</p> : null}
        <ul className="mt-4 space-y-4">
          {papers.map((paper) => (
            <li key={paper.title}>
              <h3 className="font-serif text-xl">{paper.title}</h3>
              <p className="mt-1 text-sm text-charcoal">{paper.summary}</p>
            </li>
          ))}
        </ul>
      </article>
    </PublicShell>
  );
}
