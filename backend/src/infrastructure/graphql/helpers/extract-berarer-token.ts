export function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) return null;

  // O token vem assim: Bearer <token>
  const [scheme, token] = authorizationHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  return token;
}
