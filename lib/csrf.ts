import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

const CSRF_TOKEN_COOKIE = 'csrf_token';

/**
 * Verifica se o token CSRF é válido
 */
export function validateCsrfToken(
  cookieStore: ReadonlyRequestCookies,
  headerToken?: string | null
): boolean {
  if (headerToken === null || headerToken === undefined) return false;
  
  const cookieToken = cookieStore.get(CSRF_TOKEN_COOKIE)?.value;
  if (!cookieToken) return false;
  
  // Comparação em tempo constante para evitar timing attacks
  return timingSafeEqual(headerToken, cookieToken);
}

/**
 * Compara dois tokens em tempo constante para evitar timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
} 