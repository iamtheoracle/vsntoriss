import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicShell } from "@/components/public-shell";

export const Route = createFileRoute("/ashcombe/")({ component: AshcombeHome });

const SECTIONS = [
  ["Private banking", "Named relationships, multi-currency accounts and payment instructions under maker-checker control."],
  ["Wealth", "Investment reporting sits beside the banking ledger. It does not move cash by itself."],
  ["Treasury", "Currency positions are internal records until a scheme participant and settlement evidence exist."],
  ["Governance", "Germany-readiness obligations stay open until evidence is filed and a different officer approves it."],
  ["Leadership", "Officers appear only after the access register grants them a role. This page does not invent a board."],
  ["Careers", "Roles are opened by the institution, not by a public application that creates authority."],
];

function AshcombeHome() {
  return (
    <PublicShell>
      <section className="px-5 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-widest text-forest">Ashcombe Private Bank</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">A distinguished institution. Personal relationships. Modern banking.</h1>
          <p className="mx-auto mt-6 max-w-xl text-ink-muted">
            Enquiries go to the operators responsible. They do not open an account. Due diligence is sent back only as a private link.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/ashcombe/enquire" className="inline-flex min-h-11 items-center justify-center bg-forest px-6 text-sm text-paper">Private enquiry</Link>
            <Link to="/login" search={{ institution: "ashcombe", next: "/ashcombe/banking" }} className="inline-flex min-h-11 items-center justify-center border border-line-strong px-6 text-sm">Sign in</Link>
            <Link to="/ashcombe/banking" className="inline-flex min-h-11 items-center justify-center border border-line-strong px-6 text-sm">Client banking</Link>
            <Link to="/ashcombe/disclosures" className="inline-flex min-h-11 items-center justify-center border border-line-strong px-6 text-sm">Disclosures</Link>
          </div>
        </div>
      </section>
      <section className="border-t border-line px-5 py-14">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {SECTIONS.map(([title, copy]) => (
            <article key={title}>
              <h2 className="font-serif text-xl">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{copy}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-t border-line bg-paper-warm px-5 py-12">
        <div className="mx-auto max-w-3xl text-sm leading-relaxed text-charcoal">
          Ashcombe is being established. No banking licence, deposit guarantee or live interbank rail is stated here.
          Payment settlement is recorded only when an officer attaches evidence and a different officer reconciles it against a funded ledger.
        </div>
      </section>
    </PublicShell>
  );
}
