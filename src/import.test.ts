/**
 * Test to verify that the package can be imported correctly
 * This test ensures that all exports are available and the package works as expected
 */

import { existsSync } from 'fs'
import { join } from 'path'

const distPath = join(__dirname, '../dist/cjs/index.js')
const distExists = existsSync(distPath)

describe('Package Import Tests', () => {
    let packageExports: any

    beforeAll(() => {
        // Skip if dist doesn't exist (e.g., in CI without build step)
        if (!distExists) {
            return
        }
        // Import the package
        packageExports = require('../dist/cjs/index.js')
    })

    test('should import package successfully', () => {
        if (!distExists) {
            console.warn('Skipping import test: dist folder not found. Run "pnpm run build" first.')
            return
        }
        expect(packageExports).toBeDefined()
        expect(typeof packageExports).toBe('object')
    })

    test('should export CookieConsentProvider', () => {
        if (!distExists) return
        expect(packageExports.CookieConsentProvider).toBeDefined()
        expect(typeof packageExports.CookieConsentProvider).toBe('function')
    })

    test('should export CookieConsentBanner', () => {
        if (!distExists) return
        expect(packageExports.CookieConsentBanner).toBeDefined()
        expect(typeof packageExports.CookieConsentBanner).toBe('function')
    })

    test('should export CookieConsentModal', () => {
        if (!distExists) return
        expect(packageExports.CookieConsentModal).toBeDefined()
        expect(typeof packageExports.CookieConsentModal).toBe('function')
    })

    test('should export CookieConsentGate', () => {
        if (!distExists) return
        expect(packageExports.CookieConsentGate).toBeDefined()
        expect(typeof packageExports.CookieConsentGate).toBe('function')
    })

    test('should export CookiePolicy', () => {
        if (!distExists) return
        expect(packageExports.CookiePolicy).toBeDefined()
        expect(typeof packageExports.CookiePolicy).toBe('function')
    })

    test('should export DefaultTheme', () => {
        if (!distExists) return
        expect(packageExports.DefaultTheme).toBeDefined()
        expect(typeof packageExports.DefaultTheme).toBe('object')
    })

    test('should export useCookieConsentContext hook', () => {
        if (!distExists) return
        expect(packageExports.useCookieConsentContext).toBeDefined()
        expect(typeof packageExports.useCookieConsentContext).toBe('function')
    })

    test('should export useCookieState hook', () => {
        if (!distExists) return
        expect(packageExports.useCookieState).toBeDefined()
        expect(typeof packageExports.useCookieState).toBe('function')
    })

    test('should export getLocalizedCookieText function', () => {
        if (!distExists) return
        expect(packageExports.getLocalizedCookieText).toBeDefined()
        expect(typeof packageExports.getLocalizedCookieText).toBe('function')
    })

    test('should export type definitions', () => {
        if (!distExists) return
        // These should be available in TypeScript but not in runtime
        // We can only test that the package exports exist
        const expectedExports = [
            'CookieConsentProvider',
            'CookieConsentBanner',
            'CookieConsentModal',
            'CookieConsentGate',
            'CookiePolicy',
            'DefaultTheme',
            'useCookieConsentContext',
            'useCookieState',
            'getLocalizedCookieText'
        ]

        expectedExports.forEach(exportName => {
            expect(packageExports[exportName]).toBeDefined()
        })
    })

    test('should not have CSS import issues', () => {
        if (!distExists) return
        // This test ensures that the package doesn't try to import CSS files
        // which would cause issues in Node.js environments
        const fs = require('fs')
        const cjsContent = fs.readFileSync('./dist/cjs/index.js', 'utf8')
        const esmContent = fs.readFileSync('./dist/esm/index.js', 'utf8')

        // Check that CSS imports are not present in the built files
        expect(cjsContent).not.toMatch(/require\(['"]\.\/.*\.css['"]\)/)
        expect(esmContent).not.toMatch(/import.*\.css/)
    })
})
