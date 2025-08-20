import { getLocalizedText } from './i18n'

describe('i18n utilities', () => {
    describe('getLocalizedText', () => {
        it('should return string text as-is', () => {
            const text = 'Simple text'
            const result = getLocalizedText(text, 'enUS')
            expect(result).toBe('Simple text')
        })

        it('should return text in current language when available', () => {
            const text = {
                enUS: 'English text',
                deDE: 'Deutscher Text'
            }
            const result = getLocalizedText(text, 'deDE')
            expect(result).toBe('Deutscher Text')
        })

        it('should fallback to default language when current language not available', () => {
            const text = {
                enUS: 'English text',
                deDE: 'Deutscher Text'
            }
            const result = getLocalizedText(text, 'frFR' as any)
            expect(result).toBe('English text')
        })

        it('should fallback to any available language when neither current nor default available', () => {
            const text: Record<string, string> = {
                deDE: 'Deutscher Text'
            }
            const result = getLocalizedText(text as any, 'frFR' as any, 'esES' as any)
            expect(result).toBe('Deutscher Text')
        })

        it('should return empty string when no text available', () => {
            const text: Record<string, string> = {}
            const result = getLocalizedText(text as any, 'enUS')
            expect(result).toBe('')
        })

        it('should handle null/undefined gracefully', () => {
            const result1 = getLocalizedText(null as any, 'enUS')
            const result2 = getLocalizedText(undefined as any, 'enUS')
            expect(result1).toBe('')
            expect(result2).toBe('')
        })
    })
})
