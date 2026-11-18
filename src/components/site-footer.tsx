import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col gap-6 md:flex-row md:justify-between">
          <div>
            <div className="font-serif text-lg">Ashcombe Private Bank</div>
            <p className="mt-2 max-w-sm text-sm text-charcoal">
              Independent of Vantoris. Enquiries go to operators. Accounts, IBANs and settlement are officer-controlled.
            </p>
          </div>
          <nav className="flex flex-col gap-2 text-sm">
            <Link to="/ashcombe/enquire" className="text-ink-muted">Enquire</Link>
            <Link to="/ashcombe/disclosures" className="text-ink-muted">Disclosures</Link>
            <Link to="/ashcombe/registers" className="text-ink-muted">Registers</Link>
            <Link to="/security" className="text-ink-muted">Security</Link>
            <Link to="/access" className="text-ink-muted">Access register</Link>
          </nav>
        </div>
        <p className="mt-8 border-t border-line pt-6 text-xs leading-relaxed text-charcoal">
          No banking licence, deposit protection or live interbank connection is claimed. Germany-readiness items stay open until evidence is approved by a second officer.
        </p>
      </div>
    </footer>
  );
}
