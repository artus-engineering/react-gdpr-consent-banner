import { isValidLocale, type Locale } from './config'

export function getLocaleFromPathname(pathname: string): Locale | null {
    const segment = pathname.split('/').filter(Boolean)[0]
    return segment && isValidLocale(segment) ? segment : null
}

export function getPrivacyPath(locale: Locale): string {
    return locale === 'de' ? `/${locale}/datenschutz/` : `/${locale}/privacy/`
}

export function getHomePath(locale: Locale): string {
    return `/${locale}/`
}

export function switchLocaleInPath(pathname: string, targetLocale: Locale): string {
    const segments = pathname.split('/').filter(Boolean)
    const rest = segments.slice(1)

    if (rest[0] === 'datenschutz' || rest[0] === 'privacy') {
        return getPrivacyPath(targetLocale)
    }

    if (rest.length === 0) {
        return getHomePath(targetLocale)
    }

    return `/${targetLocale}/${rest.join('/')}/`
}
