import { AuthUser } from "./types";

// In a real deployment, wire these helpers to SSO (OIDC/SAML/JWT) for
// internal users and magic-link invitations for external testers.
// The rest of the app should use these helpers instead of calling
// provider-specific SDKs directly.

export async function getCurrentUser(): Promise<AuthUser | null> {
  // Placeholder: swap this with real session lookup.
  const mode = process.env.NEXT_PUBLIC_AUTH_MODE ?? "sso";
  if (mode === "none") {
    return null;
  }

  const isExternal = mode === "magic-link";
  return {
    id: isExternal ? "tester-001" : "employee-001",
    name: isExternal ? "External Tester" : "Internal Employee",
    email: isExternal ? "tester@example.com" : "employee@example.com",
    provider: isExternal ? "magic-link" : "sso",
    isInternal: !isExternal,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

