import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

const USER_ID_COOKIE = 'gdpr_user_id'
const USER_ID_HEADER = 'x-gdpr-user-id'

export function middleware(request: NextRequest) {
    const response = NextResponse.next()
    
    // Check if user ID already exists
    let userId = request.cookies.get(USER_ID_COOKIE)?.value
    
    // Generate new user ID if it doesn't exist
    if (!userId) {
        userId = uuidv4()
        
        // Set user ID cookie (strictly necessary for GDPR compliance)
        // This cookie is essential for audit trail and doesn't require consent
        response.cookies.set(USER_ID_COOKIE, userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365, // 1 year
            path: '/'
        })
    }
    
    // Add user ID to headers for API routes
    response.headers.set(USER_ID_HEADER, userId)
    
    // Add IP address to headers for audit trail
    const ip = request.ip || 
               request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') ||
               'unknown'
    
    response.headers.set('x-client-ip', ip)
    
    return response
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
}
