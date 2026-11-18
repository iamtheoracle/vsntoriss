import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth/server";

export async function resolveSessionId(bearerToken?: string): Promise<string | null> {
  const request = getRequest();
  if (!request) return null;
  let headers = request.headers;
  if (bearerToken) {
    headers = new Headers(request.headers);
    headers.set("Authorization", `Bearer ${bearerToken}`);
  }
  const session = await auth.api.getSession({ headers });
  const id = session?.session?.id;
  return typeof id === "string" && id ? id : null;
}
