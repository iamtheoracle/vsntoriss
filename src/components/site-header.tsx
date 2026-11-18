import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Mark } from "@/components/mark";
import { UserButton } from "@/lib/auth/gates";

const NAV = [
  { to: "/ashcombe", label: "Ashcombe", exact: false },
  { to: "/ashcombe/enquire", label: "Enquire", exact: true },
  { to: "/ashcombe/banking", label: "Banking", exact: false },
  { to: "/ashcombe/office", label: "Office", exact: false },
  { to: "/ashcombe/disclosures", label: "Disclosures", exact: true },
  { to: "/vantoris", label: "Vantoris", exact: false },
  { to: "/access", label: "Access", exact: false },
] as const;

function active(pathname: string, to: string, exact: boolean) {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function SiteHeader() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="border-b border-line bg-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4">
        <Link to="/" className="flex items-center gap-3 text-ink" aria-label="Platform home">
          <Mark className="size-8 shrink-0 text-forest" />
          <span className="font-serif text-lg leading-tight">Ashcombe</span>
        </Link>
        <nav className="hidden max-w-[70%] flex-wrap items-center justify-end gap-x-4 gap-y-2 md:flex" aria-label="Primary">
          {NAV.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={active(pathname, link.to, link.exact) ? "text-sm font-medium text-ink" : "text-sm text-ink-muted"}
            >
              {link.label}
            </Link>
          ))}
          <UserButton />
        </nav>
        <button type="button" className="inline-flex size-11 items-center justify-center md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open ? (
        <nav className="border-t border-line px-4 py-3 md:hidden">
          {NAV.map((link) => (
            <Link key={link.to} to={link.to} className="block min-h-11 py-3 text-sm">{link.label}</Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
