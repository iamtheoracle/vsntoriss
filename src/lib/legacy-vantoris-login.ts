const LEGACY_LOGIN = "https://vantoris.base44.app/api/apps/6a3d85c1632966fefe16f3d4/auth/login";

export function legacyPasswordAccepted(status: number, body: unknown) {
  if (status < 200 || status >= 300 || !body || typeof body !== "object") return false;
  const record = body as Record<string, unknown>;
  return Boolean(record.access_token || record.mfa_required || record.mfa_session_token);
}

/** Ask the existing Vantoris sign-in whether this email and password match. The password is not stored. */
export async function vantorisLegacyAccepts(email: string, password: string) {
  const response = await fetch(LEGACY_LOGIN, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await response.json().catch(() => null);
  return {
    accepted: legacyPasswordAccepted(response.status, body),
    unavailable: response.status >= 500,
  };
}
