const APPOINTABLE = ["operations", "compliance", "audit", "relationship"] as const;

export function instructionBlockedByLimit(amountCents: number, limitCents: number | null): string | null {
  if (limitCents == null) return null;
  if (!Number.isInteger(limitCents) || limitCents <= 0) return null;
  if (amountCents > limitCents) {
    return "This instruction is above the approved single-payment limit. It was not submitted.";
  }
  return null;
}

export function appointmentRefusal(actorRole: string, targetRole: string, samePerson: boolean): string | null {
  if (samePerson) return "You cannot change your own role.";
  if (actorRole !== "executive") return "Executive authority is required.";
  if (!APPOINTABLE.includes(targetRole as (typeof APPOINTABLE)[number])) {
    return "That role is not granted from this desk. Executive authority stays on the founding path.";
  }
  return null;
}
