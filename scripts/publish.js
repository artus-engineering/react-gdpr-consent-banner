#!/usr/bin/env node

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const packageJsonPath = join(rootDir, 'package.json')

function exec(command, options = {}) {
    try {
        console.log(`\n📦 Running: ${command}\n`)
        execSync(command, { stdio: 'inherit', cwd: rootDir, ...options })
    } catch {
        console.error(`\n❌ Error running: ${command}`)
        process.exit(1)
    }
}

function readPackageJson() {
    return JSON.parse(readFileSync(packageJsonPath, 'utf-8'))
}

function writePackageJson(pkg) {
    writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 4) + '\n')
}

function bumpVersion(currentVersion, type) {
    const parts = currentVersion.split('-')
    const version = parts[0]
    const preRelease = parts[1] || null

    const [major, minor, patch] = version.split('.').map(Number)

    let newVersion
    switch (type) {
        case 'major':
            newVersion = `${major + 1}.0.0`
            break
        case 'minor':
            newVersion = `${major}.${minor + 1}.0`
            break
        case 'patch':
            newVersion = `${major}.${minor}.${patch + 1}`
            break
        case 'prerelease':
            if (preRelease) {
                const preParts = preRelease.split('.')
                const preName = preParts[0]
                const preNum = parseInt(preParts[1] || '0', 10) + 1
                newVersion = `${version}-${preName}.${preNum}`
            } else {
                newVersion = `${version}-beta.1`
            }
            break
        default:
            newVersion = type
    }

    return newVersion
}

function getRegistry(registry) {
    if (registry === 'npmjs') {
        return 'https://registry.npmjs.org/'
    } else if (registry === 'github') {
        return 'https://npm.pkg.github.com'
    }
    return registry
}

function main() {
    const args = process.argv.slice(2)
    const versionType = args[0] || 'patch'
    const registryArg = args[1] || 'npmjs'
    const skipTests = args.includes('--skip-tests')
    const skipBuild = args.includes('--skip-build')
    const dryRun = args.includes('--dry-run')

    console.log('\n🚀 Publishing @artus-engineering/react-gdpr-cookie-consent\n')

    const pkg = readPackageJson()
    const currentVersion = pkg.version
    const newVersion = bumpVersion(currentVersion, versionType)
    const registry = getRegistry(registryArg)

    console.log(`📋 Current version: ${currentVersion}`)
    console.log(`📋 New version: ${newVersion}`)
    console.log(`📋 Registry: ${registry}`)
    console.log(`📋 Dry run: ${dryRun ? 'Yes' : 'No'}\n`)

    if (dryRun) {
        console.log('🔍 DRY RUN MODE - No changes will be made\n')
    }

    // Step 1: Run tests
    if (!skipTests) {
        console.log('🧪 Step 1: Running tests...')
        exec('pnpm test')
        console.log('✅ Tests passed!\n')
    } else {
        console.log('⏭️  Skipping tests (--skip-tests flag)\n')
    }

    // Step 2: Lint
    console.log('🔍 Step 2: Running linter...')
    exec('pnpm lint')
    console.log('✅ Linting passed!\n')

    // Step 3: Build
    if (!skipBuild) {
        console.log('🏗️  Step 3: Building library...')
        exec('pnpm build')
        console.log('✅ Build completed!\n')
    } else {
        console.log('⏭️  Skipping build (--skip-build flag)\n')
    }

    // Step 4: Update version
    if (!dryRun) {
        console.log('📝 Step 4: Updating version...')
        pkg.version = newVersion
        writePackageJson(pkg)
        console.log(`✅ Version updated to ${newVersion}\n`)
    } else {
        console.log(`📝 Step 4: Would update version to ${newVersion}\n`)
    }

    // Step 5: Publish
    if (!dryRun) {
        console.log('📤 Step 5: Publishing to npm...')
        const publishCommand = registry === 'https://npm.pkg.github.com'
            ? `npm publish --registry=${registry}`
            : `npm publish --registry=${registry} --access public`

        // Temporarily update publishConfig if needed
        const originalPublishConfig = pkg.publishConfig
        if (registry !== 'https://npm.pkg.github.com') {
            delete pkg.publishConfig
            writePackageJson(pkg)
        }

        try {
            exec(publishCommand)
            console.log(`✅ Published ${pkg.name}@${newVersion} to ${registry}\n`)

            // Restore original publishConfig
            if (originalPublishConfig) {
                pkg.publishConfig = originalPublishConfig
                writePackageJson(pkg)
            }
        } catch (error) {
            // Restore original publishConfig on error
            if (originalPublishConfig) {
                pkg.publishConfig = originalPublishConfig
                writePackageJson(pkg)
            }
            throw error
        }
    } else {
        console.log(`📤 Step 5: Would publish to ${registry}\n`)
    }

    console.log('🎉 Publishing process completed successfully!\n')
    console.log(`📦 Package: ${pkg.name}@${newVersion}`)
    console.log(`🌐 Registry: ${registry}\n`)
}

main()

