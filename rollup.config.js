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

function getBuildConfig(output) {
    return {
        input: 'src/index.ts',
        output: [output],
        plugins: [
            peerDepsExternal(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.build.json',
                exclude: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**', '**/__snapshots__/**']
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
        sourcemap: true
    }),
    getBuildConfig({
        file: pkg.module,
        format: 'esm',
        sourcemap: true
    }),
    {
        input: 'src/index.ts',
        output: [{ file: 'dist/index.d.ts', format: 'esm' }],
        plugins: [dts()],
        external: [/\.css$/]
    }
]
