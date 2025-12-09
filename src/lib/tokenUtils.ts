/**
 * Token utility functions for JWT token handling
 * Shared across HTTP client and SignalR service
 */

/**
 * Decode a JWT token to extract payload
 * @param token JWT token string
 * @returns Decoded token payload with exp field
 */
export function decodeToken(token: string): { exp?: number; sub?: string;[key: string]: unknown } {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return {};

        // Base64 decode the payload (second part)
        const payload = parts[1];
        const decoded = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
        return decoded;
    } catch (error) {
        console.error('Error decoding token:', error);
        return {};
    }
}

/**
 * Check if a token is expired
 * @param token JWT token string or null
 * @returns true if token is expired or invalid
 */
export function isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    try {
        const decoded = decodeToken(token);
        if (!decoded.exp) return true;

        const expiresAt = decoded.exp * 1000; // Convert to milliseconds
        return Date.now() >= expiresAt;
    } catch {
        return true;
    }
}

/**
 * Check if a token is expiring soon (within threshold)
 * @param token JWT token string or null
 * @param thresholdMs Threshold in milliseconds (default: 5 minutes)
 * @returns true if token is expiring soon
 */
export function isTokenExpiringSoon(token: string | null, thresholdMs: number = 5 * 60 * 1000): boolean {
    if (!token) return false;

    try {
        const decoded = decodeToken(token);
        if (!decoded.exp) return false;

        const expiresAt = decoded.exp * 1000;
        return Date.now() >= expiresAt - thresholdMs;
    } catch {
        return false;
    }
}

/**
 * Get token expiration time in milliseconds
 * @param token JWT token string or null
 * @returns Expiration timestamp in ms, or null if invalid
 */
export function getTokenExpiration(token: string | null): number | null {
    if (!token) return null;

    try {
        const decoded = decodeToken(token);
        if (!decoded.exp) return null;
        return decoded.exp * 1000;
    } catch {
        return null;
    }
}

/**
 * Get time until token expires
 * @param token JWT token string or null
 * @returns Time until expiration in ms, or 0 if expired/invalid
 */
export function getTimeUntilExpiration(token: string | null): number {
    const expiration = getTokenExpiration(token);
    if (!expiration) return 0;

    const timeLeft = expiration - Date.now();
    return Math.max(0, timeLeft);
}
