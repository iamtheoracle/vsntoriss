import { createMiddleware } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";

/**
 * Same verified user as authMiddleware, plus the current session id so a second
 * factor can be bound to this session and not to the person in general.
 */
export const sessionMiddleware = createMiddleware({ type: "function" })
  .middleware([authMiddleware])
  .client(async ({ next }) => {
    const { getBearerToken } = await import("@/lib/auth/client");
    return next({ sendContext: { bearerToken: getBearerToken() ?? undefined } });
  })
  .server(async ({ next, context }) => {
    const { resolveSessionId } = await import("./session-id.server");
    const sessionId = await resolveSessionId(context.bearerToken);
    return next({ context: { userId: context.userId, sessionId } });
  });
