import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  beginSecondFactor,
  confirmSecondFactor,
  confirmThisSession,
  endOtherSessions,
  replaceSecondFactor,
  securityStatus,
} from "@/lib/mfa.functions";

export const Route = createFileRoute("/security")({ component: Security });

type Status = Awaited<ReturnType<typeof securityStatus>>;

function Security() {
  const [status, setStatus] = useState<Status | null>(null);
  const [secret, setSecret] = useState("");
  const [otpauth, setOtpauth] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [error, setError] = useState("");

  async function refresh() {
    setStatus(await securityStatus());
  }

  useEffect(() => {
    refresh().catch(() => {
      window.location.assign("/login?next=/security");
    });
  }, []);

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <Link to="/access" className="text-sm text-forest">Access</Link>
      <p className="mt-6 text-xs uppercase tracking-widest text-forest">Second factor</p>
      <h1 className="mt-3 font-serif text-4xl">Security</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">
        Email and password only. Google and X are not used. Officer actions also require a code from an authenticator, or a one-time recovery code, on this session. This page is not a certification.
      </p>
      {error ? <p className="mt-4 text-sm text-amber">{error}</p> : null}
      {!status ? <p className="mt-6 text-sm">Reading this session…</p> : null}
      {status ? (
        <div className="mt-8 space-y-8 text-sm">
          <p>Factor: {status.status}. This session: {status.steppedUp ? "confirmed for 12 hours" : "not confirmed"}.</p>
          {status.status !== "active" ? (
            <button type="button" className="min-h-11 bg-forest px-4 text-paper" onClick={async () => {
              const result = await beginSecondFactor();
              if ("error" in result && result.error) setError(result.error);
              else if ("secret" in result && result.secret && result.otpauth) {
                setError("");
                setSecret(result.secret);
                setOtpauth(result.otpauth);
              }
            }}>Begin enrolment</button>
          ) : null}
          {secret ? (
            <div className="border border-line p-4">
              <p>Enter this key in an authenticator. It is shown once.</p>
              <p className="mt-2 break-all font-mono text-xs">{secret}</p>
              <p className="mt-2 break-all text-xs text-charcoal">{otpauth}</p>
              <form className="mt-3 flex gap-2" onSubmit={async (event) => {
                event.preventDefault();
                const form = new FormData(event.currentTarget);
                const result = await confirmSecondFactor({ data: { code: String(form.get("code")) } });
                if ("error" in result && result.error) setError(result.error);
                else if ("recoveryCodes" in result && result.recoveryCodes) {
                  setCodes(result.recoveryCodes);
                  setSecret("");
                  setError("");
                  await refresh();
                }
              }}>
                <input className="field" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" required />
                <button className="min-h-11 border border-line-strong px-3" type="submit">Confirm</button>
              </form>
            </div>
          ) : null}
          {codes.length ? (
            <div className="border border-amber p-4">
              <p>Recovery codes. Store them now. They will not be shown again. Each works once.</p>
              <ul className="mt-2 font-mono text-xs">{codes.map((code) => <li key={code}>{code}</li>)}</ul>
            </div>
          ) : null}
          {status.status === "active" && !status.steppedUp ? (
            <form className="space-y-3" onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const result = await confirmThisSession({ data: { code: String(form.get("code") ?? ""), recovery: String(form.get("recovery") ?? "") } });
              if ("error" in result && result.error) setError(result.error);
              else {
                setError("");
                await refresh();
              }
            }}>
              <h2 className="font-serif text-2xl">Confirm this session</h2>
              <input className="field" name="code" inputMode="numeric" autoComplete="one-time-code" placeholder="Authenticator code" />
              <input className="field" name="recovery" placeholder="Or a recovery code" />
              <button className="min-h-11 bg-forest px-4 text-paper" type="submit">Confirm session</button>
            </form>
          ) : null}
          {status.status === "active" ? (
            <form className="space-y-3" onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const result = await replaceSecondFactor({ data: { recovery: String(form.get("recovery")) } });
              if ("error" in result && result.error) setError(result.error);
              else if ("secret" in result && result.secret && result.otpauth) {
                setSecret(result.secret);
                setOtpauth(result.otpauth);
                setError("The previous factor is retired. Confirm the new key before officer actions will open.");
                await refresh();
              }
            }}>
              <h2 className="font-serif text-2xl">Replace the factor</h2>
              <input className="field" name="recovery" placeholder="Unused recovery code" required />
              <button className="min-h-11 border border-line-strong px-4" type="submit">Retire and replace</button>
            </form>
          ) : null}
          <section>
            <h2 className="font-serif text-2xl">Sessions</h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {status.sessions.map((session) => (
                <li key={session.id} className="py-3">
                  <span className="break-all">{session.current ? "This session" : "Other session"} · {session.agent || "device not recorded"}</span>
                </li>
              ))}
            </ul>
            <button type="button" className="mt-3 min-h-11 border border-line-strong px-4" onClick={async () => {
              const result = await endOtherSessions();
              setError("error" in result && result.error ? result.error : "");
              await refresh();
            }}>End every other session</button>
          </section>
        </div>
      ) : null}
    </main>
  );
}
