import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import {
  beginEnrolment,
  confirmEnrolment,
  presentFactor,
  presentRecovery,
  replaceWithRecovery,
  revokeOtherSessions,
  securityView,
} from "@/lib/mfa.store";
import { sessionMiddleware } from "@/lib/session.middleware";

async function emailOf(userId: string) {
  const sql = await getSql();
  const rows = await sql<{ email: string }>`select "email" from "user" where "id" = ${userId}`;
  return rows[0]?.email ?? "";
}

export const securityStatus = createServerFn({ method: "GET" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return securityView(sql, context.userId, context.sessionId);
  });

export const beginSecondFactor = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return beginEnrolment(sql, context.userId, await emailOf(context.userId));
  });

export const confirmSecondFactor = createServerFn({ method: "POST" })
  .validator((input: { code?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    return confirmEnrolment(sql, context.userId, context.sessionId, String(data.code ?? ""));
  });

export const confirmThisSession = createServerFn({ method: "POST" })
  .validator((input: { code?: string; recovery?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const recovery = String(data.recovery ?? "").trim();
    if (recovery) return presentRecovery(sql, context.userId, context.sessionId, recovery);
    return presentFactor(sql, context.userId, context.sessionId, String(data.code ?? ""));
  });

export const replaceSecondFactor = createServerFn({ method: "POST" })
  .validator((input: { recovery?: string }) => input)
  .middleware([sessionMiddleware])
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    return replaceWithRecovery(sql, context.userId, context.sessionId, String(data.recovery ?? ""), await emailOf(context.userId));
  });

export const endOtherSessions = createServerFn({ method: "POST" })
  .middleware([sessionMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return revokeOtherSessions(sql, context.userId, context.sessionId);
  });
