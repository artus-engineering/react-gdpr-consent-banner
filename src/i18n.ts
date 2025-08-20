import { SupportedLanguage } from './types'

/**
 * Get text in the appropriate language from a string or language object
 * @param text - String or object with language keys
 * @param language - Current language
 * @param fallbackLanguage - Fallback language if current language not found
 * @returns Localized text
 */
export function getLocalizedText(
    text: string | Record<SupportedLanguage, string>,
    language: SupportedLanguage,
    fallbackLanguage: SupportedLanguage = 'enUS'
): string {
    // If text is a simple string, return it directly
    if (typeof text === 'string') {
        return text
    }

    // If text is an object with language keys
    if (typeof text === 'object' && text !== null) {
        // Return text in current language if available
        if (text[language]) {
            return text[language]
        }

        // Fallback to fallback language
        if (text[fallbackLanguage]) {
            return text[fallbackLanguage]
        }

        // Fallback to any available language
        const availableLanguages = Object.keys(text) as SupportedLanguage[]
        if (availableLanguages.length > 0) {
            return text[availableLanguages[0]]
        }
    }

    // Ultimate fallback
    return ''
}
