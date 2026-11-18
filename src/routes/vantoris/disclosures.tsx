import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { publicPublications } from "@/lib/registers.functions";

export const Route = createFileRoute("/vantoris/disclosures")({ component: Disclosures });

function Disclosures() {
  const [papers, setPapers] = useState<Array<{ title: string; summary: string }>>([]);

  useEffect(() => {
    publicPublications({ data: "vantoris" }).then(setPapers).catch(() => setPapers([]));
  }, []);

  return (
    <main className="min-h-screen bg-navy px-5 py-14 text-ivory">
      <article className="mx-auto max-w-3xl">
        <Link to="/vantoris" className="text-sm text-brass">Vantoris</Link>
        <h1 className="mt-4 font-display text-5xl">Disclosures</h1>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-slate">
          <p>Vantoris Private Institution is independent of Ashcombe Private Bank. It does not take deposits, issue cards, run payments or hold client funds.</p>
          <p>Shared sign-in does not share authority. A Vantoris profile cannot see the Ashcombe ledger, and an Ashcombe profile cannot administer Vantoris.</p>
          <p>There is no group headquarters above the two institutions. Enquiries reach Vantoris operators and do not create an account.</p>
          <p>Institutional obligations start open. They are not a banking licence and they are not the German readiness list.</p>
        </div>
        <h2 className="mt-12 font-display text-3xl">Released work</h2>
        {papers.length === 0 ? <p className="mt-3 text-sm text-slate">None released.</p> : null}
        <ul className="mt-4 space-y-4">
          {papers.map((paper) => (
            <li key={paper.title}>
              <h3 className="font-display text-2xl text-ivory">{paper.title}</h3>
              <p className="mt-1 text-sm text-slate">{paper.summary}</p>
            </li>
          ))}
        </ul>
      </article>
    </main>
  );
}
