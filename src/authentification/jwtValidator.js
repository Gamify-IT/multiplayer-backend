import { verify, decode } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const ISSUER = "http://localhost/keycloak/realms/Gamify-IT";
const JWKS_URL = `${ISSUER}/protocol/openid-connect/certs`;

const client = jwksClient({
  jwksUri: JWKS_URL,
  cache: true,
  rateLimit: true,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

function validateTokenOrThrow(token) {
  return new Promise((resolve, reject) => {
    verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
        issuer: ISSUER,
      },
      (err, decoded) => {
        if (err) {
          console.error("JWT validation failed:", err.message);
          return reject(new Error("Unauthorized"));
        }
        resolve(decoded);
      }
    );
  });
}

function extractUserId(token) {
  const decoded = decode(token);
  return decoded?.sub;
}

function hasRolesOrThrow(decoded, requiredRoles = []) {
  const userRoles = decoded?.realm_access?.roles || [];
  const hasAll = requiredRoles.every((r) => userRoles.includes(r));
  if (!hasAll) {
    throw new Error("User does not have required roles");
  }
}

export default {
  validateTokenOrThrow,
  extractUserId,
  hasRolesOrThrow,
};