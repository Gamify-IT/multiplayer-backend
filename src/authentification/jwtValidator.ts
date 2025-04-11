import { verify, JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

// keycloak information from env variables
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const ISSUER = process.env.KEYCLOAK_ISSUER;
const JWKS_URL = `${KEYCLOAK_URL}/protocol/openid-connect/certs`;

// initialize JWKS client
const client = jwksClient({
    jwksUri: JWKS_URL,
    cache: true,
    rateLimit: true,
});

/**
 * Retrieves the signing key from thr JWKS endpoint based on the 'kid' i the token header.
 * @param header the JWT header containing the 'kid' (key ID)
 * @param callback callback to return the singing key or an error
 */
function getKey(header: { kid?: string }, callback: (err: Error | null, key?: string) => void) {
    if (!header.kid) return callback(new Error("JWT header does not contain 'kid'"));

    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        if (!key) return callback(new Error("Signing key not found"));
        const signingKey = key.getPublicKey();
        callback(null, signingKey);
    });
}

/**
 * Validates the JWT token and resolves with the decoded payload if valid.
 * @param token the JWT token to validate
 * @returns promise that resolves with the decoded payload or rejects with an error
 */
export function validateTokenOrThrow(token: string): Promise<JwtPayload> {
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
                    return reject(new Error("Unauthorized"));
                }
                resolve(decoded as JwtPayload);
            }
        );
    });
}