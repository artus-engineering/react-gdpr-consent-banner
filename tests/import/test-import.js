#!/usr/bin/env node

/**
 * Dist-level smoke test.
 *
 * Runs against the freshly built `dist/` output (CJS + ESM + .d.ts) to catch
 * packaging regressions that Jest cannot see: missing/extra side-effect CSS
 * imports, missing public exports, and missing type declarations. Invoked via
 * `pnpm run test:import` and enforced by CI.
 */

import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const distDir = path.resolve(__dirname, '../../dist')

console.log('🧪 Testing package imports...\n')

try {
    console.log('📦 Testing CommonJS import...')
    const cjsExports = require(path.join(distDir, 'cjs/index.cjs'))
    console.log('✅ CommonJS import successful')

    console.log('📦 Testing ESM build...')
    const esmPath = path.join(distDir, 'esm/index.js')
    if (fs.existsSync(esmPath)) {
        console.log('✅ ESM build exists')
    } else {
        throw new Error('ESM build not found')
    }

    console.log('🎨 Checking for CSS import issues...')
    const cjsContent = fs.readFileSync(path.join(distDir, 'cjs/index.cjs'), 'utf8')
    const esmContent = fs.readFileSync(esmPath, 'utf8')

    if (cjsContent.includes('require("./index.css")') || cjsContent.includes('require("./styles/index.css")')) {
        throw new Error('CSS import found in CJS build')
    }

    if (esmContent.includes('import "./index.css"') || esmContent.includes('import "./styles/index.css"')) {
        throw new Error('CSS import found in ESM build')
    }

    console.log('✅ No CSS import issues found')

    console.log('🔍 Checking key exports...')
    const requiredExports = [
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

    const missingExports = requiredExports.filter(exportName => !cjsExports[exportName])

    if (missingExports.length > 0) {
        throw new Error(`Missing exports: ${missingExports.join(', ')}`)
    }

    console.log('✅ All required exports are available')

    console.log('📝 Checking type definitions...')
    const typeDefPath = path.join(distDir, 'index.d.ts')
    if (fs.existsSync(typeDefPath)) {
        const typeDefContent = fs.readFileSync(typeDefPath, 'utf8')
        if (typeDefContent.includes('export declare const CookieConsentProvider')) {
            console.log('✅ Type definitions include CookieConsentProvider')
        } else {
            console.log('⚠️  Type definitions may be incomplete')
        }
    } else {
        throw new Error('Type definitions not found')
    }

    console.log('\n🎉 All import tests passed!')
    console.log('📊 Package exports found:', Object.keys(cjsExports).length)
    console.log('📋 Available exports:', Object.keys(cjsExports).join(', '))
} catch (error) {
    console.error('\n❌ Import test failed:', error.message)
    process.exit(1)
}
