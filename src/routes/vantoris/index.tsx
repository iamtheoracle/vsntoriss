import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/vantoris/")({ component: VantorisHome });

const AREAS = [
  ["Purpose", "An independent private institution. It does not take deposits and it does not run Ashcombe's ledger."],
  ["Governance", "Registers, approvals and delegation stay inside Vantoris."],
  ["Workforce", "People are recorded as institutional profiles, not as bank customers."],
  ["Research", "Intelligence and publications are institutional work, not investment advice from the bank."],
  ["Compliance", "Obligations and risk are Vantoris's own. They are not the German banking tracker."],
  ["Contact", "Enquiries reach Vantoris operators. They do not create Ashcombe accounts."],
];

function VantorisHome() {
  return (
    <main className="min-h-screen bg-navy text-ivory">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link to="/" className="font-display text-2xl">Vantoris</Link>
        <nav className="flex flex-wrap justify-end gap-x-4 gap-y-2 text-sm text-slate">
          <Link to="/vantoris/enquire">Enquire</Link>
          <Link to="/login" search={{ institution: "vantoris", next: "/vantoris/portal" }}>Sign in</Link>
          <Link to="/vantoris/portal">Portal</Link>
          <Link to="/vantoris/office">Office</Link>
          <Link to="/vantoris/disclosures">Disclosures</Link>
        </nav>
      </header>
      <section className="mx-auto max-w-3xl px-5 py-16">
        <p className="text-xs uppercase tracking-widest text-brass">Vantoris Private Institution</p>
        <h1 className="mt-4 font-display text-5xl leading-tight">Independent authority. Independent records.</h1>
        <p className="mt-6 text-slate">
          Heritage, research, workforce and governance. The visual system is navy and brass so it is not mistaken for Ashcombe.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/vantoris/enquire" className="inline-flex min-h-11 items-center bg-brass px-6 text-sm text-navy">Institutional enquiry</Link>
          <Link to="/login" search={{ institution: "vantoris", next: "/vantoris/portal" }} className="inline-flex min-h-11 items-center border border-brass px-6 text-sm text-ivory">Sign in</Link>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-8 px-5 pb-16 md:grid-cols-3">
        {AREAS.map(([title, copy]) => (
          <article key={title} className="border-t border-brass pt-4">
            <h2 className="font-display text-2xl">{title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate">{copy}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
