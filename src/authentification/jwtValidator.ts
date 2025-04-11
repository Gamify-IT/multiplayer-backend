import { verify, decode, JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const ISSUER = process.env.KEYCLOAK_ISSUER;
const JWKS_URL = "http://keycloak/keycloak/realms/Gamify-IT/protocol/openid-connect/certs";

const client = jwksClient({
    jwksUri: JWKS_URL,
    cache: true,
    rateLimit: true,
});

function getKey(header: { kid?: string }, callback: (err: Error | null, key?: string) => void) {
    if (!header.kid) {
        console.error('Missing kid in JWT header');
        return callback(new Error("JWT header does not contain 'kid'"));
    }
    console.log('Requesting signing key for kid:', header.kid);

    client.getSigningKey(header.kid, (err, key) => {
        if (err) {
            console.error('Error fetching signing key:', err);
            return callback(err);
        }
        if (!key) {
            console.error('No signing key returned!');
            return callback(new Error("Signing key not found"));
        }
        const signingKey = key.getPublicKey();
        console.log('Obtained signing key:', signingKey.slice(0, 40) + '...');
        callback(null, signingKey);
    });
}

export function validateTokenOrThrow(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
        console.log("Token: " + token);
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
                resolve(decoded as JwtPayload);
                console.log("successfully authorized");
            }
        );
    });
}

export function extractUserId(token: string): string | undefined {
    const decoded = decode(token) as JwtPayload | null;
    return decoded?.sub;
}

export function hasRolesOrThrow(decoded: JwtPayload, requiredRoles: string[] = []): void {
    const userRoles = decoded?.realm_access?.roles || [];
    const hasAll = requiredRoles.every((r) => userRoles.includes(r));
    if (!hasAll) {
        throw new Error("User does not have required roles");
    }
}