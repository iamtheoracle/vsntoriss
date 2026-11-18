import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { UserButton } from "@/lib/auth/gates";
import { bootstrapExecutive, getAccess, requestProfile } from "@/lib/platform.functions";

export const Route = createFileRoute("/access")({ component: Access });

type AccessState = Awaited<ReturnType<typeof getAccess>>;

function Access() {
  const [state, setState] = useState<AccessState | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function refresh() {
    setState(await getAccess());
  }

  useEffect(() => {
    refresh().catch(() => {
      window.location.assign("/login");
    });
  }, []);

  async function found(institution: "ashcombe" | "vantoris") {
    setError("");
    const result = await bootstrapExecutive({ data: { institution, displayName: name } });
    if ("error" in result && result.error) setError(result.error);
    await refresh();
  }

  async function ask(institution: "ashcombe" | "vantoris") {
    setError("");
    const result = await requestProfile({ data: { institution, displayName: name } });
    if ("error" in result && result.error) setError(result.error);
    await refresh();
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-12">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-widest text-forest">Identity</p>
        <UserButton />
      </div>
      <h1 className="mt-3 font-serif text-4xl">Your profiles</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Signing in does not make you a client, a member, or an officer. Each institution grants that separately.
      </p>
      {!state ? <p className="mt-8 text-sm text-charcoal">Reading the access register…</p> : null}
      {state ? (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {state.profiles.length === 0 ? <li className="py-4 text-sm text-charcoal">No institutional profile yet.</li> : null}
          {state.profiles.map((profile) => (
            <li key={profile.id} className="flex items-center justify-between py-4 text-sm">
              <span>{profile.display_name} · {profile.institution} · {profile.kind} · {profile.role}</span>
              <span className="uppercase tracking-widest text-forest">{profile.status}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <label className="mt-8 block text-sm">Name used on the register
        <input className="field" value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      {error ? <p className="mt-3 text-sm text-amber">{error}</p> : null}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" className="min-h-11 border border-line-strong px-4 text-sm" onClick={() => ask("ashcombe")}>Request Ashcombe client profile</button>
        <button type="button" className="min-h-11 border border-line-strong px-4 text-sm" onClick={() => ask("vantoris")}>Request Vantoris member profile</button>
        {state?.vacancies.ashcombe ? (
          <button type="button" className="min-h-11 bg-forest px-4 text-sm text-paper" onClick={() => found("ashcombe")}>Establish first Ashcombe executive</button>
        ) : null}
        {state?.vacancies.vantoris ? (
          <button type="button" className="min-h-11 bg-navy px-4 text-sm text-ivory" onClick={() => found("vantoris")}>Establish first Vantoris executive</button>
        ) : null}
      </div>
      <p className="mt-4 text-xs leading-relaxed text-charcoal">
        The founding-executive action exists only while that institution has none. It is written to the audit register and then closes.
      </p>
      <div className="mt-8 flex flex-wrap gap-4 text-sm">
        <Link to="/ashcombe/banking" className="text-forest">Ashcombe banking</Link>
        <Link to="/ashcombe/office" className="text-forest">Ashcombe office</Link>
        <Link to="/vantoris/portal" className="text-navy">Vantoris portal</Link>
        <Link to="/vantoris/office" className="text-navy">Vantoris office</Link>
        <Link to="/security" className="text-forest">Security</Link>
      </div>
    </main>
  );
}
