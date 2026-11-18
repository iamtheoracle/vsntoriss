import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { authClient, authEnabled } from "@/lib/auth/client";
import { institutionOf, stayOnInstitution, type InstitutionId } from "@/lib/institution-login";
import { confirmVantorisLegacy } from "@/lib/legacy-vantoris-login.functions";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { institution?: InstitutionId; next: string } => ({
    institution:
      search.institution === "ashcombe" || search.institution === "vantoris"
        ? search.institution
        : undefined,
    next: typeof search.next === "string" ? search.next : "",
  }),
  component: Login,
});

function Login() {
  const search = Route.useSearch();
  const institution = search.institution ?? institutionOf(search.next) ?? undefined;
  if (!institution) return <InstitutionDoors />;
  return <InstitutionLogin institution={institution} next={search.next} />;
}

function InstitutionDoors() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-5 py-16">
      <p className="text-xs uppercase tracking-widest text-charcoal">Choose an institution</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">Sign in where you belong</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
        There is no shared Google or X sign-in. An Ashcombe sign-in stays on Ashcombe. A Vantoris sign-in stays on Vantoris.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          to="/login"
          search={{ institution: "ashcombe", next: "/ashcombe/banking" }}
          className="border border-line bg-paper-warm p-6 hover:border-forest"
        >
          <p className="text-xs uppercase tracking-widest text-forest">Ashcombe Private Bank</p>
          <p className="mt-3 font-serif text-2xl">Sign in to Ashcombe</p>
        </Link>
        <Link
          to="/login"
          search={{ institution: "vantoris", next: "/vantoris/portal" }}
          className="bg-navy p-6 text-ivory hover:bg-navy-deep"
        >
          <p className="text-xs uppercase tracking-widest text-brass">Vantoris Private Institution</p>
          <p className="mt-3 font-display text-3xl">Sign in to Vantoris</p>
        </Link>
      </div>
    </main>
  );
}

function InstitutionLogin({ institution, next }: { institution: InstitutionId; next: string }) {
  const destination = stayOnInstitution(institution, next);
  const ashcombe = institution === "ashcombe";
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onEmail(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const result =
      mode === "up"
        ? await authClient.signUp.email({ email, password, name, callbackURL: destination })
        : await authClient.signIn.email({ email, password, callbackURL: destination });
    if (!result.error) {
      window.location.assign(destination);
      return;
    }
    if (institution === "vantoris") {
      const legacy = await confirmVantorisLegacy({ data: { email, password } });
      if (legacy.unavailable) {
        setError("The existing Vantoris sign-in could not be reached. Nothing was changed.");
        return;
      }
      if (legacy.accepted) {
        const opened = await authClient.signUp.email({
          email,
          password,
          name: name || email.split("@")[0] || "Member",
          callbackURL: destination,
        });
        if (!opened.error) {
          window.location.assign(destination);
          return;
        }
        const again = await authClient.signIn.email({ email, password, callbackURL: destination });
        if (!again.error) {
          window.location.assign(destination);
          return;
        }
        setError("This email is already on the new sign-in with a different password. The old password was not replaced.");
        return;
      }
    }
    setError(result.error.message ?? "Sign-in failed.");
  }

  return (
    <main className={ashcombe ? "mx-auto flex min-h-screen max-w-md flex-col justify-center bg-paper px-5 py-16 text-ink" : "mx-auto flex min-h-screen max-w-md flex-col justify-center bg-navy px-5 py-16 text-ivory"}>
      <Link to={ashcombe ? "/ashcombe" : "/vantoris"} className={ashcombe ? "text-sm text-forest" : "text-sm text-brass"}>
        {ashcombe ? "Ashcombe" : "Vantoris"}
      </Link>
      <p className={ashcombe ? "mt-6 text-xs uppercase tracking-widest text-forest" : "mt-6 text-xs uppercase tracking-widest text-brass"}>
        {ashcombe ? "Ashcombe Private Bank" : "Vantoris Private Institution"}
      </p>
      <h1 className={ashcombe ? "mt-3 font-serif text-4xl" : "mt-3 font-display text-5xl"}>Sign in</h1>
      <p className={ashcombe ? "mt-3 text-sm leading-relaxed text-ink-muted" : "mt-3 text-sm leading-relaxed text-slate"}>
        {ashcombe
          ? "Email and password only. This sign-in returns to Ashcombe and does not open Vantoris."
          : "Email and password. An existing Vantoris password is checked against the original sign-in and then kept here. A new email is created only for Vantoris. This does not open Ashcombe."}
      </p>
      {authEnabled ? (
        <form onSubmit={onEmail} className="mt-8 space-y-3">
          {mode === "up" ? (
            <input className="field" placeholder="Name" value={name} onChange={(event) => setName(event.target.value)} required />
          ) : null}
          <input className="field" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <input className="field" type="password" minLength={institution === "vantoris" ? 8 : 12} placeholder={institution === "vantoris" ? "Password" : "Password, 12 characters"} value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error ? <p className="text-sm text-amber">{error}</p> : null}
          <button type="submit" className={ashcombe ? "min-h-11 w-full bg-forest px-4 text-sm text-paper" : "min-h-11 w-full bg-brass px-4 text-sm text-navy"}>
            {mode === "up" ? "Create email sign-in" : "Sign in"}
          </button>
          <button type="button" className={ashcombe ? "text-sm text-ink-muted" : "text-sm text-slate"} onClick={() => setMode(mode === "up" ? "in" : "up")}>
            {mode === "up" ? "I already have a sign-in" : "Create an email sign-in"}
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm">Sign-in is disabled.</p>
      )}
    </main>
  );
}
