import { createFileRoute, Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";

export const Route = createFileRoute("/")({ component: Gateway });

function Gateway() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <p className="text-xs uppercase tracking-widest text-charcoal">Two institutions</p>
        <UserButton />
      </header>
      <section className="mx-auto grid max-w-6xl gap-6 px-5 py-10 md:grid-cols-2">
        <Link to="/ashcombe" className="border border-line bg-paper-warm p-8 hover:border-forest">
          <p className="text-xs uppercase tracking-widest text-forest">Institution one</p>
          <h1 className="mt-4 font-serif text-4xl">Ashcombe Private Bank</h1>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            Private banking, wealth, treasury and the controlled financial ledger. Independent records. Independent authority.
          </p>
        </Link>
        <Link to="/vantoris" className="bg-navy p-8 text-ivory hover:bg-navy-deep">
          <p className="text-xs uppercase tracking-widest text-brass">Institution two</p>
          <h1 className="mt-4 font-display text-5xl">Vantoris Private Institution</h1>
          <p className="mt-4 text-sm leading-relaxed text-slate">
            Governance, workforce, research and institutional administration. Not a bank, and not a copy of Ashcombe.
          </p>
        </Link>
      </section>
      <p className="mx-auto max-w-6xl px-5 pb-12 text-xs leading-relaxed text-charcoal">
        Sign in on the institution itself. An Ashcombe sign-in stays on Ashcombe. A Vantoris sign-in stays on Vantoris.
        Google and X are not offered. No group headquarters sits above either institution.
        Banking authorisation is not claimed by this platform. Germany-readiness obligations remain open until evidence is reviewed.
      </p>
    </main>
  );
}
