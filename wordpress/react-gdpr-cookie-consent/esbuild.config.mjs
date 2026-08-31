import { execFileSync } from 'child_process'
import { build } from 'esbuild'
import { createReadStream, createWriteStream, readdirSync, statSync } from 'fs'
import { dirname, join, relative, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createGzip } from 'zlib'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLUGIN_DIR = __dirname
const PLUGIN_NAME = 'react-gdpr-cookie-consent'
const DIST_DIR = resolve(__dirname, 'dist')
const GERMAN_TRANSLATIONS_MODULE = resolve(__dirname, 'src/german-translations.ts')
const SHARED_FUNCTIONS_MODULE = resolve(__dirname, '../../src/functions.ts')

const PLUGIN_FILES = [
    'react-gdpr-cookie-consent.php',
    'includes/defaults.php',
    'includes/settings.php',
    'includes/admin-page.php',
    'includes/frontend-links.php',
    'assets/css/admin.css',
    'assets/js/admin.js'
]

async function buildJs() {
    console.log('\n--- JavaScript-Bundle erstellen ---')
    const result = await build({
        entryPoints: [resolve(__dirname, 'src/wordpress-entry.tsx')],
        bundle: true,
        minify: true,
        format: 'iife',
        target: 'es2020',
        outfile: resolve(__dirname, 'assets/js/cookie-consent-banner.js'),
        jsx: 'automatic',
        define: {
            'process.env.NODE_ENV': '"production"'
        },
        banner: {
            js: '/* React DSGVO Cookie-Banner - https://github.com/artus-engineering/react-gdpr-consent-banner */'
        },
        plugins: [
            {
                name: 'wordpress-german-translations',
                setup(build) {
                    build.onResolve({ filter: /^\.\/translations$/ }, args => {
                        if (args.importer !== SHARED_FUNCTIONS_MODULE) {
                            return undefined
                        }

                        return { path: GERMAN_TRANSLATIONS_MODULE }
                    })
                }
            }
        ],
        logLevel: 'info',
        metafile: true
    })

    for (const [file, meta] of Object.entries(result.metafile.outputs)) {
        console.log(`  ${file}: ${(meta.bytes / 1024).toFixed(1)} KB`)
    }
}

async function createZip() {
    console.log('\n--- WordPress-Plugin als .zip packen ---')

    const { mkdirSync, existsSync, rmSync, cpSync, statSync: stat } = await import('fs')
    if (!existsSync(DIST_DIR)) {
        mkdirSync(DIST_DIR, { recursive: true })
    }

    const zipPath = resolve(DIST_DIR, `${PLUGIN_NAME}.zip`)
    const stageRoot = resolve(DIST_DIR, '.stage')
    const stageDir = resolve(stageRoot, PLUGIN_NAME)
    rmSync(stageRoot, { recursive: true, force: true })
    mkdirSync(stageDir, { recursive: true })

    const files = [...PLUGIN_FILES, 'assets/js/cookie-consent-banner.js']
    for (const filePath of files) {
        const target = resolve(stageDir, filePath)
        mkdirSync(dirname(target), { recursive: true })
        cpSync(resolve(PLUGIN_DIR, filePath), target)
    }

    rmSync(zipPath, { force: true })
    execFileSync('zip', ['-r', '-9', '-q', zipPath, PLUGIN_NAME], { cwd: stageRoot })
    rmSync(stageRoot, { recursive: true, force: true })

    const sizeKb = (stat(zipPath).size / 1024).toFixed(1)
    console.log(`  ${PLUGIN_NAME}.zip: ${sizeKb} KB`)
    console.log(`  Output: ${zipPath}`)
}

await buildJs()
await createZip()
console.log('\nFertig. Die .zip-Datei kann im WordPress-Adminbereich unter Plugins hochgeladen werden.\n')
