/** Officer step-up policy. Sign-in alone is not this factor. */
export function stepUpDecision(input: {
  sessionBound: boolean;
  enrolled: boolean;
  fresh: boolean;
}): string | null {
  if (!input.sessionBound) return "This session is not bound, so privileged actions stay closed.";
  if (!input.enrolled || !input.fresh) return "A second factor is required before this action.";
  return null;
}

export const STEP_UP_HOURS = 12;
