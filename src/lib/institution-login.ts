export type InstitutionId = "ashcombe" | "vantoris";

const HOME: Record<InstitutionId, string> = {
  ashcombe: "/ashcombe/banking",
  vantoris: "/vantoris/portal",
};

export function institutionOf(path: string): InstitutionId | null {
  const clean = path.split("?")[0]?.split("#")[0] ?? "";
  if (clean === "/ashcombe" || clean.startsWith("/ashcombe/")) return "ashcombe";
  if (clean === "/vantoris" || clean.startsWith("/vantoris/")) return "vantoris";
  return null;
}

/** Keep a post-login path inside the institution that opened the sign-in. */
export function stayOnInstitution(institution: InstitutionId, next: string): string {
  if (!isLocalPath(next)) return HOME[institution];
  const path = next.split("?")[0] ?? "";
  const found = institutionOf(path);
  if (found === institution) return next;
  if (path === "/security") return "/security";
  return HOME[institution];
}

function isLocalPath(next: string) {
  return next.startsWith("/") && !next.startsWith("//") && !next.includes("\\");
}
