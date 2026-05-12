import { NextResponse } from 'next/server';

/**
 * HTTP Basic Auth middleware.
 *
 * Reads expected credentials from env:
 *   AUTH_USERNAME
 *   AUTH_PASSWORD
 *
 * If either is missing, auth is DISABLED (useful for local dev without a
 * .env.local). When both are present, every route under matcher requires
 * the browser to send a matching `Authorization: Basic <base64(user:pass)>`
 * header, otherwise the response is 401 with a WWW-Authenticate challenge
 * (which makes the browser pop its native sign-in dialog).
 *
 * The basic-auth credentials persist in the browser for the rest of the
 * session, so the user only types them once per browser launch.
 */
export function middleware(request) {
  const expectedUser = process.env.AUTH_USERNAME;
  const expectedPass = process.env.AUTH_PASSWORD;

  // No credentials configured → public access. Helpful in local dev.
  if (!expectedUser || !expectedPass) {
    return NextResponse.next();
  }

  const auth = request.headers.get('authorization') || '';
  if (auth.startsWith('Basic ')) {
    try {
      const encoded = auth.slice(6).trim();
      const decoded = atob(encoded); // edge-runtime safe
      const idx = decoded.indexOf(':');
      if (idx >= 0) {
        const user = decoded.slice(0, idx);
        const pass = decoded.slice(idx + 1);
        if (user === expectedUser && pass === expectedPass) {
          return NextResponse.next();
        }
      }
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Resume Tailor", charset="UTF-8"',
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

// Apply to every route except Next internals and static assets that the
// browser fetches before login (favicon etc.). The /downloads/ folder is
// intentionally protected — only authenticated users should be able to
// pull tailored resumes off the CDN.
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.svg|favicon.ico).*)',
  ],
};
