export const locales = ['de', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'de'

export function isValidLocale(value: string): value is Locale {
    return locales.includes(value as Locale)
}

export const consentLangByLocale: Record<Locale, 'deDE' | 'enUS'> = {
    de: 'deDE',
    en: 'enUS'
}
