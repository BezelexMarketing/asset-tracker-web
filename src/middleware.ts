import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();

  // Extract subdomain
  const subdomain = hostname.split('.')[0];
  
  // Skip middleware for localhost and main domain
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return NextResponse.next();
  }

  // Handle subdomain routing for client portals
  if (subdomain && subdomain !== 'www' && subdomain !== 'admin') {
    // Check if it's a valid client subdomain
    if (isValidClientSubdomain(subdomain)) {
      // Rewrite to client portal with subdomain as client code
      url.pathname = `/client/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // Handle admin subdomain
  if (subdomain === 'admin') {
    url.pathname = `/admin${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

// Helper function to validate client subdomains
function isValidClientSubdomain(subdomain: string): boolean {
  // Basic validation - you can enhance this with database lookup
  const validPattern = /^[a-z0-9]{3,12}$/;
  return validPattern.test(subdomain);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};