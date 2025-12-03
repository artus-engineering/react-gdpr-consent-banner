const USER_ID_COOKIE = 'gdpr_user_id'

/**
 * Get user ID from cookies (client-side)
 */
export function getUserIdFromClientCookies(): string | null {
    if (typeof window === 'undefined') {
        return null
    }

    const cookies = document.cookie.split(';')
    const userIdCookie = cookies.find(cookie => cookie.trim().startsWith(`${USER_ID_COOKIE}=`))

    if (userIdCookie) {
        return userIdCookie.split('=')[1]
    }

    return null
}

/**
 * Generate a new user ID (for fallback scenarios)
 */
export function generateUserId(): string {
    // Simple UUID-like generation for fallback
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}
