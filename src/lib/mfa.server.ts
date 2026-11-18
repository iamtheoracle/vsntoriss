import { getSql } from "@/lib/db";
import { readStepUp } from "@/lib/mfa.store";

export async function stepUpBlock(userId: string, sessionId: string | null): Promise<string | null> {
  const sql = await getSql();
  return readStepUp(sql, userId, sessionId);
}
