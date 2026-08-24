import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import typescript from '@rollup/plugin-typescript'
import analyze from 'rollup-plugin-analyzer'
import dtsPlugin from 'rollup-plugin-dts'
import peerDepsExternal from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import pkg from './package.json' with { type: 'json' }

// Handle both ESM and CJS imports for dts plugin
const dts = dtsPlugin.default || dtsPlugin

function getBuildConfig(output, input = 'src/index.ts') {
    // Extract directory from output file path for outDir
    const outputDir = output.file.split('/').slice(0, -1).join('/') || '.'

    return {
        input,
        output: [output],
        plugins: [
            peerDepsExternal(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.build.json',
                exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', '**/__snapshots__/**'],
                compilerOptions: {
                    declaration: false,
                    declarationMap: false,
                    outDir: outputDir
                }
            }),
            postcss({
                minimize: true,
                extract: true,
                config: true,
                inject: false
            }),
            terser({
                format: {
                    preamble: `"use client";`
                },
                mangle: {
                    // Don't mangle top-level exports to avoid ESM initialization issues
                    toplevel: false,
                    // Keep class and function names for debugging
                    keep_classnames: true,
                    keep_fnames: true
                },
                compress: {
                    // Don't hoist functions which can cause initialization order issues
                    hoist_funs: false,
                    // Don't inline functions across module boundaries
                    reduce_funcs: false
                }
            }),
            analyze({ summaryOnly: true })
        ],
        external: [/\.stories\.tsx$/, /\.css$/]
    }
}

export default [
    getBuildConfig({
        file: pkg.main,
        format: 'cjs',
        sourcemap: false
    }),
    getBuildConfig({
        file: pkg.module,
        format: 'esm',
        sourcemap: false
    }),
    {
        input: 'src/index.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts()],
        external: [/\.css$/]
    },
    // React-free entry point (`@artus_engineering/react-gdpr-cookie-consent/headless`)
    getBuildConfig({ file: 'dist/cjs/headless.cjs', format: 'cjs', sourcemap: false }, 'src/headless.ts'),
    getBuildConfig({ file: 'dist/esm/headless.js', format: 'esm', sourcemap: false }, 'src/headless.ts'),
    {
        input: 'src/headless.ts',
        output: [{ file: 'dist/headless.d.ts', format: 'esm' }],
        plugins: [dts()],
        external: [/\.css$/]
    }
]
