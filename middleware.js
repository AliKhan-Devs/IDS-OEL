import { NextResponse } from 'next/server';
import { initializeDatabase } from './lib/db';

console.log('Middleware loaded - Starting database initialization...');

// Initialize database when the application starts
initializeDatabase()
  .then(() => {
    console.log('Database initialization completed successfully');
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
  });

export function middleware(request) {
  // Add any middleware logic here if needed
  return NextResponse.next();
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