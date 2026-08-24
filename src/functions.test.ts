import { getLabel, getLocalizedCookieText, getUnit, hexToRGBA, isServer, lightenHexColor } from './functions'

describe('functions', () => {
    describe('isServer', () => {
        it('returns false in jsdom environment', () => {
            expect(isServer()).toBe(false)
        })
    })

    describe('hexToRGBA', () => {
        it('converts a hex color to rgba with default alpha', () => {
            expect(hexToRGBA('#ff8040')).toBe('rgba(255, 128, 64, 1)')
        })

        it('supports custom alpha', () => {
            expect(hexToRGBA('#000000', 0.5)).toBe('rgba(0, 0, 0, 0.5)')
        })
    })

    describe('lightenHexColor', () => {
        it('lightens the color by the given degree', () => {
            expect(lightenHexColor('#102030', 16)).toBe('rgb(32, 48, 64)')
        })

        it('clamps channel values at 255', () => {
            expect(lightenHexColor('#f0f0f0', 100)).toBe('rgb(255, 255, 255)')
        })
    })

    describe('getLabel', () => {
        it('returns the default English label when no custom labels provided', () => {
            expect(getLabel('buttons', 'acceptAllCookies', {})).toBe('Accept All')
        })

        it('returns the German label when lang is deDE', () => {
            expect(getLabel('buttons', 'acceptAllCookies', { lang: 'deDE' })).toBe('Alle Akzeptieren')
        })

        it('returns the custom label override when provided', () => {
            const labels = { buttons: { acceptAllCookies: 'Yes please' } }
            expect(getLabel('buttons', 'acceptAllCookies', { labels })).toBe('Yes please')
        })

        it('falls back to defaults for keys missing from a partial override', () => {
            const labels = { buttons: { acceptAllCookies: 'Yes please' } }
            expect(getLabel('buttons', 'back', { labels })).toBe('Back')
        })

        it('provides a re-consent notice label in both languages', () => {
            expect(getLabel('descriptions', 'reconsentNotice', {})).toContain('updated')
            expect(getLabel('descriptions', 'reconsentNotice', { lang: 'deDE' })).toContain('aktualisiert')
        })
    })

    describe('getLocalizedCookieText', () => {
        it('returns a plain string untouched', () => {
            expect(getLocalizedCookieText('hello')).toBe('hello')
        })

        it('returns the text for the requested language from a translation object', () => {
            expect(getLocalizedCookieText({ enUS: 'Hello', deDE: 'Hallo' }, 'deDE')).toBe('Hallo')
        })

        it('defaults to enUS when no language is specified', () => {
            expect(getLocalizedCookieText({ enUS: 'Hello', deDE: 'Hallo' })).toBe('Hello')
        })
    })

    describe('getUnit', () => {
        it('returns the singular form when the number equals one', () => {
            expect(getUnit(1, 'days', {})).toBe('Day')
        })

        it('returns the plural form when the number is greater than one', () => {
            expect(getUnit(7, 'days', {})).toBe('Days')
        })

        it('respects the configured language', () => {
            expect(getUnit(2, 'weeks', { lang: 'deDE' })).toBe('Wochen')
        })
    })
})
