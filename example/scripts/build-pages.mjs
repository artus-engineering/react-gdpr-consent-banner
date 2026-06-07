import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const exampleRoot = path.join(__dirname, '..')
const apiDir = path.join(exampleRoot, 'app', 'api')
const apiBackup = path.join(exampleRoot, 'app', '_api_backup')
const proxyFile = path.join(exampleRoot, 'proxy.ts')
const proxyBackup = path.join(exampleRoot, '_proxy.ts.backup')
const require = createRequire(import.meta.url)

function moveAside(from, to) {
    if (fs.existsSync(from)) {
        fs.renameSync(from, to)
    }
}

function restore(from, to) {
    if (fs.existsSync(from)) {
        fs.renameSync(from, to)
    }
}

moveAside(apiDir, apiBackup)
moveAside(proxyFile, proxyBackup)

const nextPkg = require.resolve('next/package.json')
const nextBin = path.join(path.dirname(nextPkg), 'dist/bin/next')

const result = spawnSync(process.execPath, [nextBin, 'build'], {
    cwd: exampleRoot,
    stdio: 'inherit',
    env: {
        ...process.env,
        STATIC_EXPORT: 'true',
        NEXT_PUBLIC_STATIC_DEMO: 'true',
        NEXT_PUBLIC_DEMO_DOMAIN: 'react-gdpr-consent-banner.artus-engineering.de'
    }
})

restore(apiBackup, apiDir)
restore(proxyBackup, proxyFile)

process.exit(result.status ?? 1)
