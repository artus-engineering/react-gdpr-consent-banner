import { SupportedLanguage } from './types'

/**
 * Platform config artifacts localize text with short language codes; the
 * library historically uses locale-style keys. Both are accepted.
 */
const LANGUAGE_ALIASES: Record<SupportedLanguage, string> = {
    deDE: 'de',
    enUS: 'en'
}

function lookup(text: Record<string, string>, language: SupportedLanguage): string | undefined {
    return text[language] ?? text[LANGUAGE_ALIASES[language]]
}

/**
 * Get text in the appropriate language from a string or language object
 * @param text - String or object with language keys (`deDE`/`enUS` or `de`/`en`)
 * @param language - Current language
 * @param fallbackLanguage - Fallback language if current language not found
 * @returns Localized text
 */
export function getLocalizedText(
    text: string | Record<string, string>,
    language: SupportedLanguage,
    fallbackLanguage: SupportedLanguage = 'enUS'
): string {
    // If text is a simple string, return it directly
    if (typeof text === 'string') {
        return text
    }

    // If text is an object with language keys
    if (typeof text === 'object' && text !== null) {
        const localized = lookup(text, language) ?? lookup(text, fallbackLanguage)
        if (localized) {
            return localized
        }

        // Fallback to any available language
        const availableLanguages = Object.keys(text)
        if (availableLanguages.length > 0) {
            return text[availableLanguages[0]]
        }
    }

    // Ultimate fallback
    return ''
}
