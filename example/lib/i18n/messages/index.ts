import { isValidLocale, type Locale } from '../config'
import { de } from './de'
import { en } from './en'
import type { Dictionary } from './types'

const dictionaries: Record<Locale, Dictionary> = {
    de,
    en
}

export function getDictionary(locale: string): Dictionary {
    if (!isValidLocale(locale)) {
        return dictionaries.de
    }
    return dictionaries[locale]
}

export type { Dictionary }
