import { createServerFn } from "@tanstack/react-start";
import { vantorisLegacyAccepts } from "@/lib/legacy-vantoris-login";

export const confirmVantorisLegacy = createServerFn({ method: "POST" })
  .validator((input: { email?: string; password?: string }) => ({
    email: String(input.email ?? "").trim().toLowerCase(),
    password: String(input.password ?? ""),
  }))
  .handler(async ({ data }) => {
    if (!data.email.includes("@") || data.password.length < 8 || data.password.length > 256) {
      return { accepted: false, unavailable: false };
    }
    return vantorisLegacyAccepts(data.email, data.password);
  });
