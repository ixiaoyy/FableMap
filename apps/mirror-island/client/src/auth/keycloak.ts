import Keycloak, { type KeycloakConfig } from "keycloak-js";

const TOKEN_REFRESH_INTERVAL_MS = 30_000;
const TOKEN_MIN_VALIDITY_SECONDS = 60;

export interface AuthenticatedSession {
  readonly subject: string;
  getAccessToken(): Promise<string>;
  dispose(): void;
}

/** Resolves public Keycloak browser configuration from reviewed Vite variables and local defaults. */
export function resolveKeycloakClientConfig(env: ImportMetaEnv = import.meta.env): KeycloakConfig {
  return {
    url: String(env.VITE_KEYCLOAK_URL || "http://localhost:8081").replace(/\/+$/, ""),
    realm: String(env.VITE_KEYCLOAK_REALM || "mirror-island"),
    clientId: String(env.VITE_KEYCLOAK_CLIENT_ID || "mirror-island-web"),
  };
}
/** Initializes login-required PKCE authentication and exposes a refreshable memory-only access token. */
export async function initializeKeycloakSession(): Promise<AuthenticatedSession> {
  const keycloak = new Keycloak(resolveKeycloakClientConfig());
  const authenticated = await keycloak.init({
    onLoad: "login-required",
    pkceMethod: "S256",
    checkLoginIframe: false,
  });
  if (!authenticated || !keycloak.subject || !keycloak.token) {
    await keycloak.login();
    throw new Error("Authentication did not establish a Keycloak session.");
  }

  const refresh = async (): Promise<string> => {
    try {
      await keycloak.updateToken(TOKEN_MIN_VALIDITY_SECONDS);
    } catch {
      await keycloak.login();
    }
    if (!keycloak.token) throw new Error("Authentication token is unavailable.");
    return keycloak.token;
  };
  keycloak.onTokenExpired = () => void refresh();
  keycloak.onAuthLogout = () => void keycloak.login();
  const refreshTimer = window.setInterval(() => void refresh(), TOKEN_REFRESH_INTERVAL_MS);

  return {
    subject: keycloak.subject,
    getAccessToken: refresh,
    dispose: () => window.clearInterval(refreshTimer),
  };
}
