import { defaultLocale, type Locale } from './config'

export function detectLocaleFromAcceptLanguage(header: string | null): Locale {
    if (!header) {
        return defaultLocale
    }

    const preferred = header.split(',').map(part => part.split(';')[0]?.trim().toLowerCase() ?? '')

    for (const tag of preferred) {
        if (tag.startsWith('de')) {
            return 'de'
        }
        if (tag.startsWith('en')) {
            return 'en'
        }
    }

    return defaultLocale
}

export function detectBrowserLocale(): Locale {
    if (typeof navigator === 'undefined') {
        return defaultLocale
    }

    const languages = navigator.languages?.length ? navigator.languages : [navigator.language]

    for (const tag of languages) {
        const normalized = tag.toLowerCase()
        if (normalized.startsWith('de')) {
            return 'de'
        }
        if (normalized.startsWith('en')) {
            return 'en'
        }
    }

    return defaultLocale
}
