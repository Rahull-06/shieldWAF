import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isAuthPage = pathname.startsWith('/login');

    // Check for token in cookies (for SSR) — client-side uses localStorage
    // We use a simple approach: let client-side handle auth redirect
    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};