import { createRemoteJWKSet, jwtVerify } from "jose";

export interface KeycloakServerConfig {
  readonly issuer: string;
  readonly audience: string;
  readonly jwksUri: string;
}

export type KeycloakAccessTokenVerifier = (token: string) => Promise<string>;

/** Reports whether one issuer URL is HTTPS or an explicitly local HTTP development URL. */
function isAllowedIssuerUrl(url: URL): boolean {
  if (url.protocol === "https:") return true;
  return url.protocol === "http:" && ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
}

/** Allows HTTPS plus an explicitly enabled private Compose hostname for JWKS retrieval. */
function isAllowedJwksUrl(url: URL, allowInternalHttp: boolean): boolean {
  if (isAllowedIssuerUrl(url)) return true;
  return allowInternalHttp && url.protocol === "http:" && /^[a-z0-9-]+$/u.test(url.hostname);
}

/** Resolves and validates the Keycloak issuer, audience and JWKS boundary from server environment values. */
export function resolveKeycloakServerConfig(
  env: Record<string, string | undefined> = process.env,
): KeycloakServerConfig {
  const issuer = String(
    env.KEYCLOAK_ISSUER || "http://localhost:8081/realms/mirror-island",
  ).replace(/\/+$/, "");
  const audience = String(env.KEYCLOAK_AUDIENCE || "mirror-island-game").trim();
  const issuerUrl = new URL(issuer);
  if (!isAllowedIssuerUrl(issuerUrl)) {
    throw new Error("KEYCLOAK_ISSUER must use HTTPS outside localhost.");
  }
  if (!audience) throw new Error("KEYCLOAK_AUDIENCE must not be empty.");

  const jwksUri = String(
    env.KEYCLOAK_JWKS_URI || `${issuer}/protocol/openid-connect/certs`,
  );
  const jwksUrl = new URL(jwksUri);
  if (!isAllowedJwksUrl(jwksUrl, env.KEYCLOAK_ALLOW_HTTP_JWKS === "true")) {
    throw new Error("KEYCLOAK_JWKS_URI must use HTTPS outside localhost.");
  }
  return { issuer, audience, jwksUri: jwksUrl.toString() };
}

/** Creates an RS256 verifier that returns the stable Keycloak subject and never returns token claims. */
export function createKeycloakAccessTokenVerifier(
  config: KeycloakServerConfig = resolveKeycloakServerConfig(),
  keyResolver: Parameters<typeof jwtVerify>[1] = createRemoteJWKSet(new URL(config.jwksUri)),
): KeycloakAccessTokenVerifier {
  return async (token: string): Promise<string> => {
    const { payload } = await jwtVerify(token, keyResolver, {
      algorithms: ["RS256"],
      issuer: config.issuer,
      audience: config.audience,
      requiredClaims: ["sub"],
    });
    if (typeof payload.sub !== "string" || payload.sub.trim() === "") {
      throw new Error("Authentication failed.");
    }
    return payload.sub;
  };
}
