/**
 * Social sign-in is not offered.
 *
 * Google and X were removed so a sign-in cannot arrive from a shared broker
 * identity. Email and password is the only method, and the login page keeps
 * the session on the institution that asked for it.
 */
export type GrokProvider = {
  providerId: string;
  idp: string;
  label: string;
};

export const GROK_PROVIDERS: readonly GrokProvider[] = [];
