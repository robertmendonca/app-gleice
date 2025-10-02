import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const buildNonce = () => crypto.randomUUID().replace(/-/g, '');

const csp = (nonce: string) =>
  [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "img-src 'self' data: blob:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `script-src 'self' 'nonce-${nonce}' https://challenges.cloudflare.com`,
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "object-src 'none'"
  ].join('; ');

export function middleware(request: NextRequest) {
  const nonce = buildNonce();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  response.headers.set('Content-Security-Policy', csp(nonce));
  response.headers.set('X-Nonce', nonce);

  return response;
}

export const config = {
  matcher: '/:path*'
};
