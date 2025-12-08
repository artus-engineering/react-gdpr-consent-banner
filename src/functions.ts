import {
    CONSENT_DIALOG_HAS_BEEN_DISPLAYED,
    CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE,
    COOKIE_SUFFIX,
    COOKIE_VALUE_FALSE,
    COOKIE_VALUE_TRUE
} from './constants'
import { getLocalizedText } from './i18n'
import { getLanguageLabels } from './translations'
import { CookieProviderConfig, SectionKeys, SupportedLanguage, TranslationSections, Unit } from './types'

/**
 * Check if the code is running on the server.
 *
 * @returns {boolean} True if the code is running on the server, false otherwise.
 */
export function isServer(): boolean {
    return typeof window === 'undefined' || typeof document === 'undefined'
}

/**
 * Set a cookie with proper security settings.
 *
 * @param key The key of the cookie.
 * @param value The value of the cookie.
 * @param domain The domain of the cookie.
 * @param validForDays The validity of the cookie in days.
 */
export function setCookie(key: string, value: string, domain: string, validForDays: number) {
    if (isServer()) {
        return
    }

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    const isHttps = window.location.protocol === 'https:'

    // For localhost or HTTP, don't use Secure flag
    const secureFlag = isLocalhost || !isHttps ? '' : '; Secure'

    // For localhost, don't set domain attribute (browsers reject domain=localhost)
    const domainAttr = isLocalhost ? '' : `; domain=${domain}`

    const cookieString = `${key}=${value}${domainAttr}; path=/; max-age=${validForDays * 86400}; SameSite=Lax${secureFlag}`

    try {
        document.cookie = cookieString

        // Verify the cookie was set - check after a small delay to ensure it's readable
        if (process.env.NODE_ENV === 'development') {
            // Use setTimeout to check after the cookie is actually written
            setTimeout(() => {
                const wasSet = document.cookie.split(';').some(c => c.trim().startsWith(`${key}=`))
                console.log('[CookieConsent] Cookie set:', {
                    key,
                    value,
                    domain: isLocalhost ? '(no domain attr)' : domain,
                    wasSet,
                    cookieString,
                    allCookies: document.cookie.split(';').map(c => c.trim())
                })
            }, 0)
        }
    } catch (error) {
        console.error('[CookieConsent] Failed to set cookie:', {
            key,
            error
        })
    }
}

/**
 * Set the cookie consent has been given.
 *
 * @param {string} domain The domain of the cookie.
 * @param {number} validForDays The validity of the cookie in days.
 */
export function setCookieConsentDisplayed(domain: string, validForDays: number) {
    setCookie(CONSENT_DIALOG_HAS_BEEN_DISPLAYED, CONSENT_DIALOG_HAS_BEEN_DISPLAYED_VALUE, domain, validForDays)
}

/**
 * Set the cookie selection.
 *
 * @param {CookieProviderConfig} cookie The cookie the consent has been given for.
 * @param {boolean} consentGiven True if the user has given consent, false otherwise.
 * @param {string} domain The domain of the cookie.
 * @param {number} validForDays The validity of the cookie in days.
 */
export function persistCookieSelection(
    cookie: CookieProviderConfig,
    consentGiven: boolean,
    domain: string,
    validForDays: number
) {
    setCookie(cookieAccessor(cookie), consentGiven ? COOKIE_VALUE_TRUE : COOKIE_VALUE_FALSE, domain, validForDays)
}

/**
 * Get the cookie accessor.
 *
 * @param cookie
 * @returns {string} The key to access the cookie.
 */
export function cookieAccessor(cookie: Partial<CookieProviderConfig> | Partial<CookieProviderConfig>): string {
    return `${cookie.id}${COOKIE_SUFFIX}`
}

/**
 * Get the cookie selection.
 *
 * @param {CookieProviderConfig} cookie The cookie to check.
 * @returns {boolean} True if the user has given consent, false otherwise.
 */
export function getCookieSelection(cookie: CookieProviderConfig): boolean {
    if (isServer()) {
        return false
    }
    return document.cookie.includes(`${cookieAccessor(cookie)}=${COOKIE_VALUE_TRUE}`)
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
        .replace(/\s/g, '')
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
    config: { labels?: any; lang?: SupportedLanguage }
): string {
    const { labels, lang = 'enUS' } = config
    const customText = labels?.[section]?.[key]
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
export function getLocalizedCookieText(
    text: string | Record<SupportedLanguage, string>,
    lang: SupportedLanguage = 'enUS'
): string {
    return getLocalizedText(text, lang)
}

/**
 * Function to get the unit of the duration, if the duration is greater than 1, it will return the plural form of the unit
 *
 * @param number The duration
 * @param unit The unit
 * @param config The configuration object containing labels and language
 * @returns {string} The unit in singular or plural form
 */
export function getUnit(number: number, unit: Unit, config: { labels?: any; lang?: SupportedLanguage }): string {
    if (number > 1) {
        return getLabel('units', `${unit}Plural` as Unit, config)
    }
    return getLabel('units', unit, config)
}
