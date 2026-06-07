import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import { detectLocaleFromAcceptLanguage } from './lib/i18n/detect-locale'
import { getHomePath } from './lib/i18n/paths'

const USER_ID_COOKIE = 'gdpr_user_id'
const USER_ID_HEADER = 'x-gdpr-user-id'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname === '/') {
        const locale = detectLocaleFromAcceptLanguage(request.headers.get('accept-language'))
        return NextResponse.redirect(new URL(getHomePath(locale), request.url))
    }

    const response = NextResponse.next()

    let userId = request.cookies.get(USER_ID_COOKIE)?.value

    if (!userId) {
        userId = uuidv4()

        // Strictly necessary for GDPR audit trail; does not require consent
        response.cookies.set(USER_ID_COOKIE, userId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
            path: '/'
        })
    }

    response.headers.set(USER_ID_HEADER, userId)

    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'

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
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
}
