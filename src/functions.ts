import { getLocalizedText } from './i18n'
import { getLanguageLabels } from './translations'
import {
    LocalizedText,
    PartialCookieConsentLabels,
    SectionKeys,
    SupportedLanguage,
    TranslationSections,
    Unit
} from './types'

/**
 * Mutable SSR check so tests can simulate a server environment when jsdom
 * exposes non-configurable `window` / `document` globals.
 */
export const serverEnvironment = {
    isServer(): boolean {
        return globalThis.window === undefined || globalThis.document === undefined
    }
}

/**
 * Check if the code is running on the server.
 *
 * @returns {boolean} True if the code is running on the server, false otherwise.
 */
export function isServer(): boolean {
    return serverEnvironment.isServer()
}

/**
 * Convert a hex color to an RGBA color.
 *
 * @param hex The hex color.
 * @param alpha The alpha value 0.0 - 1.0 (optional, default: 1)
 * @returns The RGBA color.
 */
export function hexToRGBA(hex: string, alpha = 1): string {
    const r = Number.parseInt(hex.slice(1, 3), 16)
    const g = Number.parseInt(hex.slice(3, 5), 16)
    const b = Number.parseInt(hex.slice(5, 7), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Lighten a hex color.
 *
 * @param hex The hex color.
 * @param degree The degree to lighten the color.
 * @returns The lightened color.
 */
export function lightenHexColor(hex: string, degree: number): string {
    const color = hexToRGBA(hex)
    const rgb = color
        .replace(/^(rgb|rgba)\(/, '')
        .replace(/\)$/, '')
        .replaceAll(/\s/g, '')
        .split(',')
    const r = Math.min(255, Number.parseInt(rgb[0], 10) + degree)
    const g = Math.min(255, Number.parseInt(rgb[1], 10) + degree)
    const b = Math.min(255, Number.parseInt(rgb[2], 10) + degree)
    return `rgb(${r}, ${g}, ${b})`
}

/**
 * Function to get the text from the labels object or the default labels
 *
 * @param section The section of the labels
 * @param key The key of the label
 * @param config The configuration object containing labels and language
 * @returns {string} The text of the label
 */
export function getLabel<S extends TranslationSections, K extends SectionKeys<S>>(
    section: S,
    key: K,
    config: { labels?: PartialCookieConsentLabels; lang?: SupportedLanguage }
): string {
    const { labels, lang = 'enUS' } = config
    const customText = labels?.[section]?.[key as keyof PartialCookieConsentLabels[S]]
    if (customText) {
        return customText as string
    }

    const defaultText = getLanguageLabels(lang)
    return defaultText[section][key] as string
}

/**
 * Get localized text for cookie descriptions and purposes
 *
 * @param text The text to localize (string or object with language keys)
 * @param lang The language to use
 * @returns Localized text based on current language configuration
 */
export function getLocalizedCookieText(text: LocalizedText, lang: SupportedLanguage = 'enUS'): string {
    return getLocalizedText(text as string | Record<string, string>, lang)
}

/**
 * Function to get the unit of the duration, if the duration is greater than 1, it will return the plural form of the unit
 *
 * @param number The duration
 * @param unit The unit
 * @param config The configuration object containing labels and language
 * @returns {string} The unit in singular or plural form
 */
export function getUnit(
    number: number,
    unit: Unit,
    config: { labels?: PartialCookieConsentLabels; lang?: SupportedLanguage }
): string {
    if (number > 1) {
        return getLabel('units', `${unit}Plural` as Unit, config)
    }
    return getLabel('units', unit, config)
}
