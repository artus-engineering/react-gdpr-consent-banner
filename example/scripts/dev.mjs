import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const exampleRoot = path.join(__dirname, '..')
const lockPath = path.join(exampleRoot, '.next', 'dev', 'lock')
const require = createRequire(import.meta.url)

function isProcessAlive(pid) {
    try {
        process.kill(pid, 0)
        return true
    } catch {
        return false
    }
}

async function releaseDevLock() {
    if (!fs.existsSync(lockPath)) return
    let pid
    try {
        pid = JSON.parse(fs.readFileSync(lockPath, 'utf8')).pid
    } catch {
        try {
            fs.unlinkSync(lockPath)
        } catch {}
        return
    }
    if (typeof pid !== 'number') {
        try {
            fs.unlinkSync(lockPath)
        } catch {}
        return
    }
    if (isProcessAlive(pid)) {
        process.kill(pid, 'SIGTERM')
        for (let i = 0; i < 40; i++) {
            await delay(100)
            if (!fs.existsSync(lockPath)) return
        }
    }
    try {
        fs.unlinkSync(lockPath)
    } catch {}
}

await releaseDevLock()

const nextPkg = require.resolve('next/package.json')
const nextBin = path.join(path.dirname(nextPkg), 'dist/bin/next')

const child = spawn(process.execPath, [nextBin, 'dev'], {
    cwd: exampleRoot,
    stdio: 'inherit',
    env: process.env
})

child.on('exit', (code, signal) => {
    if (signal) process.exit(1)
    process.exit(code ?? 0)
})
